const path = require("path");
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const EFA_BASE_URL = process.env.EFA_BASE_URL || "http://www.linzag.at/static";

// In-memory booking storage for demo purposes
const bookings = [];

// Simple demo fleet for fake dispatching
const fleet = [
  { id: "EV-01", name: "E\u2011Van 1 \u2013 Central", maxWheelchairs: 2 },
  { id: "EV-02", name: "E\u2011Van 2 \u2013 North", maxWheelchairs: 2 },
  { id: "EV-03", name: "E\u2011Van 3 \u2013 South", maxWheelchairs: 1 },
];

/**
 * Assign a booking to the vehicle with the smallest number of upcoming trips,
 * preferring vehicles that can handle the requested wheelchair count.
 */
function assignVehicle(booking) {
  if (!fleet.length) {
    return null;
  }

  const now = new Date();

  const loads = fleet.map((vehicle) => {
    const upcomingForVehicle = bookings.filter((b) => {
      if (b.vehicleId !== vehicle.id) return false;
      const ts = new Date(`${b.date}T${b.time}:00`);
      return !Number.isNaN(ts.getTime()) && ts >= now;
    }).length;

    return { vehicle, count: upcomingForVehicle };
  });

  loads.sort((a, b) => a.count - b.count);

  const byCapacity =
    loads.find((entry) => booking.wheelchairCount <= entry.vehicle.maxWheelchairs) ||
    loads[0];

  return byCapacity.vehicle;
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/**
 * Helper to parse StopFinder response from Linz AG EFA API
 */
function mapStopFinderResponse(json) {
  if (!json || !json.stopFinder || !json.stopFinder.points) {
    return [];
  }

  const points = json.stopFinder.points;
  // points can be an array or single object depending on result count
  const list = Array.isArray(points) ? points : [points];

  return list.map((p) => ({
    id: p.stateless,
    name: p.name,
    type: p.anyType || p.type,
    place: p.ref && p.ref.place ? p.ref.place : undefined,
  }));
}

/**
 * Helper to parse DM (departure monitor) response
 */
function mapDeparturesResponse(json) {
  if (!json || !json.dm || !json.dm.departureList) {
    return [];
  }

  const list = Array.isArray(json.dm.departureList)
    ? json.dm.departureList
    : [json.dm.departureList];

  return list.map((d) => {
    const line = d.servingLine || {};
    const dateTime = d.realDateTime || d.dateTime || {};
    return {
      stopName: d.stopName || d.nameWO,
      countdownMinutes: Number(d.countdown),
      plannedTime: `${dateTime.hour || ""}:${String(dateTime.minute || "")
        .padStart(2, "0")}`,
      lineNumber: line.number,
      lineName: line.name,
      direction: line.direction,
      motType: line.motType,
    };
  });
}

/**
 * GET /api/stops?q=...
 * Proxy to Linz AG EFA StopFinder (JSON)
 */
app.get("/api/stops", async (req, res) => {
  const query = (req.query.q || "").trim();

  if (!query || query.length < 2) {
    return res.json([]);
  }

  try {
    const url =
      EFA_BASE_URL +
      "/XML_STOPFINDER_REQUEST?" +
      new URLSearchParams({
        locationServerActive: "1",
        stateless: "1",
        type_sf: "any",
        anyObjFilter_sf: "34", // stops + important points
        outputFormat: "JSON",
        name_sf: query,
      }).toString();

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(502).json({ error: "Failed to reach Linz AG API" });
    }

    const data = await response.json();
    const stops = mapStopFinderResponse(data).slice(0, 10);

    res.json(stops);
  } catch (err) {
    console.error("Error in /api/stops:", err);
    res.status(500).json({ error: "Failed to fetch stops from Linz AG API" });
  }
});

/**
 * GET /api/departures?stopId=60501720
 * Proxy to Linz AG EFA Departure Monitor (JSON)
 */
app.get("/api/departures", async (req, res) => {
  const stopId = (req.query.stopId || "").trim();

  if (!stopId) {
    return res.status(400).json({ error: "Missing stopId" });
  }

  try {
    const url =
      EFA_BASE_URL +
      "/XML_DM_REQUEST?" +
      new URLSearchParams({
        locationServerActive: "1",
        stateless: "1",
        type_dm: "any",
        name_dm: stopId,
        limit: "5",
        mode: "direct",
        outputFormat: "JSON",
        // Accessibility-related options (can be tuned further)
        ptOptionsActive: "1",
        imparedOptionsActive: "1",
        noSolidStairs: "1",
        lowPlatformVhcl: "1",
      }).toString();

    const response = await fetch(url);
    if (!response.ok) {
      return res
        .status(502)
        .json({ error: "Failed to reach Linz AG departure API" });
    }

    const data = await response.json();
    const departures = mapDeparturesResponse(data);

    res.json(departures);
  } catch (err) {
    console.error("Error in /api/departures:", err);
    res.status(500).json({ error: "Failed to fetch departures" });
  }
});

/**
 * POST /api/bookings
 * Body: { name, email, phone, fromStopId, fromStopName, toStopId, toStopName, date, time, wheelchairCount, assistanceLevel, notes }
 */
app.post("/api/bookings", (req, res) => {
  const {
    name,
    email,
    phone,
    fromStopId,
    fromStopName,
    toStopId,
    toStopName,
    date,
    time,
    wheelchairCount,
    assistanceLevel,
    notes,
  } = req.body || {};

  if (!name || !email || !fromStopId || !toStopId || !date || !time) {
    return res.status(400).json({
      error:
        "Missing required fields. Please provide name, email, origin, destination, date and time.",
    });
  }

  // Enforce booking max 1 day in advance (today or tomorrow)
  const now = new Date();
  const bookingDate = new Date(`${date}T${time}:00`);

  if (Number.isNaN(bookingDate.getTime())) {
    return res.status(400).json({ error: "Invalid date or time" });
  }

  const diffMs = bookingDate.getTime() - now.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (diffMs < 0) {
    return res.status(400).json({ error: "Booking must be in the future" });
  }

  if (diffMs > oneDayMs) {
    return res
      .status(400)
      .json({ error: "Bookings can only be made up to 1 day in advance" });
  }

  const booking = {
    id: `B${Date.now()}`,
    createdAt: new Date().toISOString(),
    name,
    email,
    phone,
    fromStopId,
    fromStopName,
    toStopId,
    toStopName,
    date,
    time,
    wheelchairCount: Number(wheelchairCount) || 0,
    assistanceLevel: assistanceLevel || "standard",
    notes: notes || "",
    status: "confirmed",
  };

  const vehicle = assignVehicle(booking);
  if (vehicle) {
    booking.vehicleId = vehicle.id;
    booking.vehicleName = vehicle.name;
  }

  bookings.push(booking);

  res.status(201).json(booking);
});

/**
 * GET /api/bookings
 * Returns all upcoming bookings (for demo / operator view)
 */
app.get("/api/bookings", (req, res) => {
  const now = new Date();
  const upcoming = bookings
    .filter((b) => {
      const ts = new Date(`${b.date}T${b.time}:00`);
      return !Number.isNaN(ts.getTime()) && ts >= now;
    })
    .sort((a, b) => {
      const aTs = new Date(`${a.date}T${a.time}:00`).getTime();
      const bTs = new Date(`${b.date}T${b.time}:00`).getTime();
      return aTs - bTs;
    });

  res.json(upcoming);
});

// Fallback: serve index.html for root
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Accessible E-Fleet server listening on http://localhost:${PORT}`);
});