(function () {
  const fromInput = document.getElementById("fromStopName");
  const fromList = document.getElementById("fromStopList");
  const fromHiddenId = document.getElementById("fromStopId");

  const toInput = document.getElementById("toStopName");
  const toList = document.getElementById("toStopList");
  const toHiddenId = document.getElementById("toStopId");

  const bookingForm = document.getElementById("booking-form");
  const formMessage = document.getElementById("formMessage");

  const departuresContainer = document.getElementById("departures");
  const refreshDeparturesBtn = document.getElementById("refreshDepartures");

  const bookingsContainer = document.getElementById("bookings");
  const refreshBookingsBtn = document.getElementById("refreshBookings");

  const toggleContrastBtn = document.getElementById("toggle-contrast");
  const increaseFontBtn = document.getElementById("increase-font");
  const decreaseFontBtn = document.getElementById("decrease-font");

  let lastFromStops = [];
  let lastToStops = [];
  let baseFontPercent = 100;

  function setFormMessage(message, type) {
    formMessage.textContent = message || "";
    formMessage.classList.remove("error", "success");
    if (type) {
      formMessage.classList.add(type);
    }
  }

  async function fetchStops(query) {
    const response = await fetch(`/api/stops?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error("Failed to fetch stops");
    }
    return response.json();
  }

  function updateDatalist(listEl, stops) {
    listEl.innerHTML = "";
    stops.forEach((stop) => {
      const option = document.createElement("option");
      option.value = stop.name;
      listEl.appendChild(option);
    });
  }

  function handleStopInput(inputEl, listEl, target) {
    const value = inputEl.value.trim();
    if (value.length < 2) {
      listEl.innerHTML = "";
      if (target === "from") {
        lastFromStops = [];
        fromHiddenId.value = "";
      } else {
        lastToStops = [];
        toHiddenId.value = "";
      }
      return;
    }

    fetchStops(value)
      .then((stops) => {
        if (target === "from") {
          lastFromStops = stops;
        } else {
          lastToStops = stops;
        }
        updateDatalist(listEl, stops);
      })
      .catch((err) => {
        console.error("Error fetching stops:", err);
      });
  }

  function resolveSelectedStopId(inputEl, target) {
    const value = inputEl.value.trim();
    if (!value) {
      if (target === "from") fromHiddenId.value = "";
      else toHiddenId.value = "";
      return;
    }

    const list = target === "from" ? lastFromStops : lastToStops;
    const match = list.find((s) => s.name === value);

    if (match) {
      if (target === "from") {
        fromHiddenId.value = match.id;
      } else {
        toHiddenId.value = match.id;
      }
    } else {
      if (target === "from") fromHiddenId.value = "";
      else toHiddenId.value = "";
    }
  }

  async function submitBooking(event) {
    event.preventDefault();
    setFormMessage("");

    resolveSelectedStopId(fromInput, "from");
    resolveSelectedStopId(toInput, "to");

    if (!fromHiddenId.value || !toHiddenId.value) {
      setFormMessage(
        "Please select a valid pickup and destination stop from the suggestions.",
        "error"
      );
      return;
    }

    const payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      fromStopName: fromInput.value.trim(),
      fromStopId: fromHiddenId.value,
      toStopName: toInput.value.trim(),
      toStopId: toHiddenId.value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      wheelchairCount: document.getElementById("wheelchairCount").value,
      assistanceLevel: document.getElementById("assistanceLevel").value,
      notes: document.getElementById("notes").value.trim(),
    };

    if (!payload.name || !payload.email || !payload.date || !payload.time) {
      setFormMessage(
        "Please fill in all required fields (name, email, date, time).",
        "error"
      );
      return;
    }

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data && data.error ? data.error : "Booking failed.";
        setFormMessage(errorMsg, "error");
        return;
      }

      setFormMessage(
        `Booking confirmed: ${data.id}. We will send a confirmation to ${data.email}.`,
        "success"
      );
      bookingForm.reset();
      fromHiddenId.value = "";
      toHiddenId.value = "";

      loadBookings();
      if (data.fromStopId) {
        loadDepartures(data.fromStopId, data.fromStopName);
      }
    } catch (err) {
      console.error("Booking error:", err);
      setFormMessage("Something went wrong. Please try again.", "error");
    }
  }

  async function loadDepartures(stopId, stopNameFromBooking) {
    const stopIdToUse = stopId || fromHiddenId.value;
    if (!stopIdToUse) {
      departuresContainer.innerHTML =
        '<p class="hint">Select a pickup stop first to see real-time departures.</p>';
      return;
    }

    departuresContainer.setAttribute("aria-busy", "true");
    departuresContainer.innerHTML = "";

    try {
      const response = await fetch(
        `/api/departures?stopId=${encodeURIComponent(stopIdToUse)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data && data.error ? data.error : "Error");
      }

      if (!data.length) {
        departuresContainer.innerHTML =
          "<p class=\"hint\">No upcoming departures found for this stop.</p>";
        return;
      }

      const fragment = document.createDocumentFragment();
      data.forEach((dep) => {
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
          <div class="card-header">
            <div class="card-title">
              <span class="chip primary">${escapeHtml(
                dep.lineNumber || "?"
              )}</span>
              <span>→ ${escapeHtml(dep.direction || "")}</span>
            </div>
            <span class="chip">${escapeHtml(dep.plannedTime || "")}</span>
          </div>
          <div class="card-meta">
            <div><strong>Stop:</strong> ${escapeHtml(
              dep.stopName || stopNameFromBooking || ""
            )}</div>
            <div><strong>Leaves in:</strong> ${Number.isFinite(
              dep.countdownMinutes
            )
              ? `${dep.countdownMinutes} min`
              : "now"}</div>
          </div>
        `;
        fragment.appendChild(card);
      });

      departuresContainer.appendChild(fragment);
    } catch (err) {
      console.error("Error loading departures:", err);
      departuresContainer.innerHTML =
        "<p class=\"hint\">Could not load departures from Linz AG. Please try again.</p>";
    } finally {
      departuresContainer.setAttribute("aria-busy", "false");
    }
  }

  async function loadBookings() {
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();

      bookingsContainer.innerHTML = "";

      if (!response.ok) {
        throw new Error(data && data.error ? data.error : "Error");
      }

      if (!data.length) {
        bookingsContainer.innerHTML =
          "<p class=\"hint\">No upcoming bookings yet. Book a ride to see it here.</p>";
        return;
      }

      const fragment = document.createDocumentFragment();
      data.forEach((b) => {
        const card = document.createElement("article");
        card.className = "card";
        card.innerHTML = `
          <div class="card-header">
            <div class="card-title">${escapeHtml(b.name)}</div>
            <span class="chip success">${escapeHtml(
              (b.status || "confirmed").toUpperCase()
            )}</span>
          </div>
          <div class="card-meta">
            <div><strong>When:</strong> ${escapeHtml(
              b.date
            )} at ${escapeHtml(b.time)}</div>
            <div><strong>Route:</strong> ${escapeHtml(
              b.fromStopName
            )} → ${escapeHtml(b.toStopName)}</div>
            <div><strong>Wheelchairs:</strong> ${escapeHtml(
              String(b.wheelchairCount || 0)
            )}, <strong>Assistance:</strong> ${escapeHtml(
          b.assistanceLevel
        )}</div>
          </div>
        `;
        fragment.appendChild(card);
      });

      bookingsContainer.appendChild(fragment);
    } catch (err) {
      console.error("Error loading bookings:", err);
      bookingsContainer.innerHTML =
        "<p class=\"hint\">Could not load bookings. Please refresh.</p>";
    }
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }

  function initDateTimeDefaults() {
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");
    const now = new Date();

    const todayIso = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowIso = tomorrow.toISOString().slice(0, 10);

    dateInput.min = todayIso;
    dateInput.max = tomorrowIso;
    dateInput.value = todayIso;

    const pad = (n) => String(n).padStart(2, "0");
    timeInput.value = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }

  function setupAccessibilityControls() {
    toggleContrastBtn.addEventListener("click", () => {
      document.body.classList.toggle("high-contrast");
    });

    increaseFontBtn.addEventListener("click", () => {
      baseFontPercent = Math.min(baseFontPercent + 10, 140);
      document.documentElement.style.setProperty(
        "--font-size",
        `${baseFontPercent}%`
      );
    });

    decreaseFontBtn.addEventListener("click", () => {
      baseFontPercent = Math.max(baseFontPercent - 10, 80);
      document.documentElement.style.setProperty(
        "--font-size",
        `${baseFontPercent}%`
      );
    });
  }

  function init() {
    let fromTimeout;
    fromInput.addEventListener("input", () => {
      clearTimeout(fromTimeout);
      fromTimeout = setTimeout(
        () => handleStopInput(fromInput, fromList, "from"),
        300
      );
    });
    fromInput.addEventListener("change", () =>
      resolveSelectedStopId(fromInput, "from")
    );

    let toTimeout;
    toInput.addEventListener("input", () => {
      clearTimeout(toTimeout);
      toTimeout = setTimeout(
        () => handleStopInput(toInput, toList, "to"),
        300
      );
    });
    toInput.addEventListener("change", () =>
      resolveSelectedStopId(toInput, "to")
    );

    bookingForm.addEventListener("submit", submitBooking);

    refreshDeparturesBtn.addEventListener("click", () => loadDepartures());
    refreshBookingsBtn.addEventListener("click", loadBookings);

    setupAccessibilityControls();
    initDateTimeDefaults();
    loadBookings();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();