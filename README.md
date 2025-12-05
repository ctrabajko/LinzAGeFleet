# Linz Accessible E‑Fleet – Hackathon Prototype

Accessible booking system for an electric vehicle fleet with ramps for wheelchair users, integrated with the **Linz AG EFA open data API**.

Built for the **DevFest Linz – Great AI Hackathon** with a focus on **accessibility and inclusive mobility**.

---

## 1. Problem & Concept

### Problem

- Many wheelchair users cannot rely on regular taxis, ride‑sharing or even some public transport legs.
- Planning a door‑to‑door trip that works with **ramps**, **secure wheelchair spaces** and **extra assistance time** is hard.
- Public transport apps often ignore details like:
  - number of wheelchair users,
  - required assistance level,
  - coordination between on‑demand rides and scheduled services.

### Concept

**Linz Accessible E‑Fleet** is a prototype booking portal for an electric vehicle fleet with onboard ramps and dedicated space for wheelchair users.

Key ideas:

- Book an accessible e‑vehicle **for today or tomorrow** (1 day in advance).
- Vehicles are assumed to be operated by *Linz AG* or partners and integrate with existing tram / bus lines.
- Use **Linz AG’s Elektronische Fahrplanauskunft (EFA) API** to:
  - search for stops and important places,
  - show live departures at the pickup stop so transfers can be coordinated.

---

## 2. Features

### User features

- Accessible booking form:
  - Name, email, phone.
  - Pickup stop / place (Linz AG stop finder).
  - Destination stop / place.
  - Date & time (today or tomorrow).
  - Number of wheelchair users.
  - Assistance level (extra time, driver help, etc.).
  - Additional notes (e.g. service dog, medical equipment).
- Hard rule: **bookings only up to 1 day in advance** (backend‑validated).

### Integration with Linz AG

The backend integrates with Linz AG’s **EFA XML Schnittstelle** using the open data endpoints:

- `XML_STOPFINDER_REQUEST` (Stop‑Finder):
  - Returns suggestions for stops / important places.
  - Used for pickup and destination inputs.
- `XML_DM_REQUEST` (Departure Monitor):
  - Returns upcoming departures for a stop.
  - The UI shows the next departures at the pickup stop to help coordinate transfers.

Endpoints documented in:

- [EFA XML Schnittstelle – LINZ AG LINIEN (PDF)](https://data.linz.gv.at/katalog/linz_ag/linz_ag_linien/fahrplan/EFA_XML_Schnittstelle_20151217.pdf)

### Accessibility UX

- High contrast **toggle**.
- Adjustable base font size (**A+ / A−**).
- Proper HTML landmarks: `header`, `main`, `section`, `footer`.
- Labels associated with form controls, helper text and clear error messages.
- Keyboard‑accessible buttons and skip link to main content.

### Demo / Operator view

- Simple operator panel listing **upcoming bookings** for the next 24 hours.
- Shows key details (time, origin, destination, wheelchair count, assistance level).
- Each booking is automatically assigned to one of **three demo e‑vans** using a simple load‑balancing dispatcher (fake dispatch).

---

## 3. Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: Static HTML/CSS/Vanilla JS served by Express
- **External API**: Linz AG EFA XML interface (JSON output)
- **Data storage**: In‑memory (sufficient for hackathon demo)

---

## 4. Project Structure

```text
.
├── package.json
├── server.js            # Express server, Linz AG API proxy, booking logic
├── public/
│   ├── index.html       # Accessible UI
│   ├── styles.css       # Styling and high‑contrast mode
│   └── app.js           # Frontend logic, API calls
└── README.md
```

---

## 5. Getting Started (Local Demo)

### Prerequisites

- **Node.js 18+** (for modern JS and fetch API support in Node)
- **npm** (comes with Node)
- Internet connection (to reach Linz AG EFA endpoints)

### 5.1. Install dependencies

```bash
npm install
```

### 5.2. Run the server (dev mode)

```bash
npm run dev
```

or standard:

```bash
npm start
```

The app will start on:

```text
http://localhost:3000
```

### 5.3. Environment variables (optional)

You can configure the Linz EFA base URL and port via a `.env` file:

```bash
cp .env.example .env   # if you create one (see below)
```

Supported variables:

- `PORT` – port for the Express server (default: `3000`)
- `EFA_BASE_URL` – base URL to the Linz AG EFA API  
  default: `http://www.linzag.at/static`

Example `.env`:

```env
PORT=3000
EFA_BASE_URL=http://www.linzag.at/static
```

> For the hackathon, the default values should work without configuration, as long as the network can reach `www.linzag.at`.

---

## 6. How to Use the Demo

1. **Open the app** in the browser:  
   `http://localhost:3000`

2. **Try the accessibility tools** in the header:
   - Toggle high contrast.
   - Increase/decrease font size.
   - Use the skip link to jump to main content (Tab once, press Enter).

3. **Make a booking**:
   - Fill in your name and email.
   - In “Pickup stop / place”, type e.g. `Hauptbahnhof` and select a suggestion.
   - Do the same for your destination (e.g. `JKU` or `solarCity`).
   - Choose **today** or **tomorrow** as date (limited by UI).
   - Pick a time.
   - Adjust number of wheelchair users and assistance level as needed.
   - Submit the form.

   The backend checks:

   - All mandatory fields are present.
   - Date/time is in the future.
   - Date/time is **no more than 24 hours ahead**.

4. **View live departures**:

   - After booking (or after selecting a pickup stop and clicking “Refresh departures”),
     the app calls:

     ```text
     GET /api/departures?stopId=...
     ```

   - This proxies to Linz AG’s `XML_DM_REQUEST` with `outputFormat=JSON`.
   - The UI shows the next departures (line, direction, time, countdown).

5. **View upcoming bookings**:

   - The “Upcoming bookings” section shows a list of all future bookings.
   - Click “Refresh bookings” to update the list.

---

## 7. API Details (Backend)

### Base URL

When running locally:

```text
http://localhost:3000
```

### 7.1. `GET /api/stops?q=QUERY`

Search for stops / important places using Linz AG **Stop-Finder**.

- **Query parameter**:
  - `q` – search text (min. 2 characters)

- **Response (JSON)**:

```json
[
  {
    "id": "60501720",
    "name": "Linz/Donau, Hauptbahnhof",
    "type": "stop",
    "place": "Linz/Donau"
  }
]
```

On the backend, this calls:

```text
GET {EFA_BASE_URL}/XML_STOPFINDER_REQUEST
  ?locationServerActive=1
  &stateless=1
  &type_sf=any
  &anyObjFilter_sf=34
  &outputFormat=JSON
  &name_sf={q}
```

---

### 7.2. `GET /api/departures?stopId=60501720`

Get next departures from a Linz AG stop (Departure Monitor).

- **Query parameter**:
  - `stopId` – stop “stateless” ID (e.g. `60501720` for Hauptbahnhof)

- **Response (JSON)**:

```json
[
  {
    "stopName": "Linz/Donau Hauptbahnhof (Tiefgeschoß)",
    "countdownMinutes": 0,
    "plannedTime": "17:38",
    "lineNumber": "2",
    "lineName": "Straßenbahn",
    "direction": "Universität",
    "motType": "4"
  }
]
```

On the backend, this calls:

```text
GET {EFA_BASE_URL}/XML_DM_REQUEST
  ?locationServerActive=1
  &stateless=1
  &type_dm=any
  &name_dm={stopId}
  &limit=5
  &mode=direct
  &outputFormat=JSON
  &ptOptionsActive=1
  &imparedOptionsActive=1
  &noSolidStairs=1
  &lowPlatformVhcl=1
```

The parameters showcase how EFA supports **mobility‑impaired** options.

---

### 7.3. `POST /api/bookings`

Create a new booking (stored in memory for demo purposes).

**Request body (JSON)**:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+43 660 1234567",
  "fromStopId": "60501720",
  "fromStopName": "Linz/Donau, Hauptbahnhof",
  "toStopId": "60500920",
  "toStopName": "Linz/Donau, JKU | Universität",
  "date": "2025-12-05",
  "time": "17:45",
  "wheelchairCount": 1,
  "assistanceLevel": "extra_time",
  "notes": "Travelling with a service dog."
}
```

Validation rules:

- `name`, `email`, `fromStopId`, `toStopId`, `date`, `time` are required.
- `date` + `time` must be in the future.
- `date` + `time` must be **≤ 24 hours** from now.

**Response (JSON)** – on success:

```json
{
  "id": "B1733410700000",
  "createdAt": "2025-12-05T17:38:20.123Z",
  "status": "confirmed",
  "...": "other fields as sent in the request"
}
```

On validation error:

```json
{ "error": "Bookings can only be made up to 1 day in advance" }
```

---

### 7.4. `GET /api/bookings`

List all upcoming bookings (used by the operator view and fake dispatcher).

- **Response (JSON)**:

```json
[
  {
    "id": "B1733410700000",
    "name": "Jane Doe",
    "fromStopName": "Linz/Donau, Hauptbahnhof",
    "toStopName": "Linz/Donau, JKU | Universität",
    "date": "2025-12-05",
    "time": "17:45",
    "wheelchairCount": 1,
    "assistanceLevel": "extra_time",
    "status": "confirmed",
    "vehicleId": "EV-01",
    "vehicleName": "E‑Van 1 – Central"
  }
]
```

The list is sorted by date/time and only includes **future** bookings. In addition, each booking is assigned to one of three demo vehicles (`EV-01`, `EV-02`, `EV-03`) using a simple load‑balancing algorithm that prefers vehicles with enough wheelchair capacity.

---

## 8. How This Addresses Accessibility

- **Vehicle accessibility**:
  - Explicit booking for vehicles with ramps and wheelchair spaces.
  - Captures number of wheelchair users and needed assistance.
- **Information accessibility**:
  - High contrast theme & font scaling.
  - Semantic HTML, labels, hints and keyboard focus styles.
  - Live region for form feedback and dynamic content.
- **Mobility impaired routing** (API‑side):
  - Use of `imparedOptionsActive=1`, `noSolidStairs=1`, `lowPlatformVhcl=1`
    in the EFA calls shows how routing can adapt to mobility constraints.

---

## 9. Possible Next Steps (if there is more time)

- Real persistence (database) instead of in‑memory storage.
- Simple **dispatching algorithm** to assign bookings to a small e‑fleet.
- AI‑assisted suggestions:
  - Predict optimal pickup time based on public transport arrivals.
  - Recommend connection strategies for different accessibility profiles.
- User accounts (with preferred stops, wheelchair type, assistance level).
- UI translations (German/English) using i18n.

---

## 10. License & Data

- Code: MIT (see `LICENSE` if added).
- Linz AG EFA data:
  - Subject to the terms described at  
    <https://www.data.gv.at/datasets/d3c0a223-516b-4049-9370-22881a0428d8>  
    and <http://data.linz.gv.at/nutzungsbedingungen/>.

Please check these terms before using the system outside of a hackathon context.

---

## 11. Optional WhatsApp Voice Booking (n8n + OpenAI + ElevenLabs + Twilio)

For people who cannot comfortably use a keyboard or screen, you can add a **voice-based booking path via WhatsApp** using low-code tooling. The idea:

- User sends a **voice message** to a WhatsApp number.
- A workflow in **n8n**:
  - Receives the audio via **Twilio**.
  - Transcribes and understands it using **OpenAI**.
  - Calls this backend (`/api/bookings`) to create a booking.
  - Generates a spoken confirmation with **ElevenLabs**.
  - Sends the audio (and text) back to the user on WhatsApp.

### 11.1. High-level flow

1. **User** sends a voice note to a Twilio WhatsApp number.
2. **Twilio** forwards the message (and media URL) to an **n8n webhook**.
3. **n8n**:
   1. Downloads the audio file from Twilio’s media URL.
   2. Sends audio to **OpenAI (Whisper)** for speech-to-text.
   3. Sends the transcript + conversation history to **OpenAI Chat** to extract:
      - name, email (optional, or phone as identifier),
      - origin stop/place,
      - destination stop/place,
      - date, time,
      - wheelchairCount,
      - assistanceLevel,
      - notes.
   4. n8n calls this app’s `POST /api/bookings` endpoint with the structured JSON.
   5. Receives the booking JSON (with `id`, `vehicleId`, etc.).
   6. Asks **OpenAI Chat** to produce a short confirmation sentence in the user’s language (DE/EN).
   7. Sends that text to **ElevenLabs TTS** → gets an audio file with the spoken confirmation.
   8. Uses **Twilio** again to send a WhatsApp message back to the user with:
      - the text confirmation, and
      - the audio confirmation as a voice note.

### 11.2. Suggested n8n nodes (one run)

1. **Webhook / Twilio Trigger**
   - Method: `POST`
   - URL: `https://<your-n8n>/webhook/whatsapp-inbound`
   - Configure Twilio WhatsApp Sandbox / number to call this URL for incoming messages.
   - This node receives parameters like:
     - `From` (user phone),
     - `Body` (text if any),
     - `NumMedia` and media URLs for voice notes.

2. **IF node – has audio?**
   - Check if `NumMedia > 0` and `MediaContentType0` starts with `audio/`.
   - If no audio:
     - (Optional) handle text-only booking or reply asking user to send a voice note.

3. **HTTP Request – Download audio**
   - GET `{{$json["MediaUrl0"]}}`
   - Authentication: Twilio Basic Auth (Account SID + Auth Token) or public media URL depending on Twilio settings.
   - Response: binary (audio).

4. **OpenAI – Audio Transcription (Whisper)**
   - Use the n8n **OpenAI** node in “Audio to Text” mode.
   - Input: binary audio from previous step.
   - Output: `transcript` string.

5. **OpenAI – Booking intent + extraction**
   - OpenAI Chat (GPT‑4 or similar).
   - System prompt example:

     > You are an assistant for \"Linz Accessible E‑Fleet\" in Linz, Austria.  
     > The user is leaving a voicemail on WhatsApp to book a wheelchair-accessible e-vehicle that connects to Linz AG public transport.  
     > Ask follow-up questions if needed, then output ONLY a JSON object with fields:  
     > `name`, `email` (optional), `origin`, `destination`, `date`, `time`, `wheelchairCount`, `assistanceLevel`, `notes`.  
     > `assistanceLevel` must be one of: `standard`, `extra_time`, `with_assistant`.  
     > Dates should be today or tomorrow only and formatted as `YYYY-MM-DD`. Times as `HH:MM` (24h).  
     > If you are missing information, ask a short, clear question in the user’s language (German or English).

   - User message: the transcript plus any stored context from previous messages (n8n can store per-user state in a database or [n8n Data Storage] node keyed by `From`).
   - Output: final structured JSON once all info is gathered.

6. **HTTP Request – Call backend**
   - Method: `POST`
   - URL: `http://<your-backend-host>:3000/api/bookings`
   - Body (JSON): map fields from the LLM output to the booking format:
     - `name`
     - `email`
     - `fromStopName` = `origin`
     - `toStopName` = `destination`
     - `date`
     - `time`
     - `wheelchairCount`
     - `assistanceLevel`
     - `notes`
   - To resolve `fromStopId` / `toStopId`, you can optionally call this app’s `/api/stops?q=...` from n8n before calling `/api/bookings` (pick the best match’s `id`).

7. **OpenAI – Confirmation text**
   - System prompt: “You are a friendly but concise booking confirmation assistant for Linz Accessible E‑Fleet.”
   - Input: booking JSON from backend.
   - Output example (EN):

     > Your accessible e‑fleet ride is booked for today at 17:45 from Linz/Donau, Hauptbahnhof to Linz/Donau, JKU | Universität. Vehicle EV‑01 has been assigned.

   - And German variant for German-speaking callers.

8. **ElevenLabs – Text to Speech**
   - Use ElevenLabs API (via n8n HTTP Request node or a dedicated node if available).
   - Method: `POST`
   - URL: `https://api.elevenlabs.io/v1/text-to-speech/<voice_id>`
   - Headers:
     - `xi-api-key: {{ $env.ELEVENLABS_API_KEY }}`
     - `Content-Type: application/json`
   - Body:

     ```json
     {
       "text": "{{ $json.confirmationText }}",
       "model_id": "eleven_multilingual_v2"
     }
     ```

   - Response: binary audio (MP3/OGG).

9. **Twilio – Send WhatsApp message (text + audio)**
   - Text: confirmation text from previous step.
   - Media: audio file from ElevenLabs.
   - Use Twilio node or HTTP Request to Twilio’s `/Messages.json`:
     - `To`: user’s WhatsApp number (from `From`).
     - `From`: your Twilio WhatsApp-enabled number.
     - `Body`: text confirmation.
     - `MediaUrl`: a URL where n8n exposes the ElevenLabs audio (e.g. n8n “Static file” or an S3 bucket).

### 11.3. Required configuration

Environment / secrets:

- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_NUMBER`
- `OPENAI_API_KEY`
- `ELEVENLABS_API_KEY`
- `BACKEND_BASE_URL` (e.g. `http://localhost:3000` or your deployed URL)
- n8n base URL reachable by Twilio.

---

This voice workflow is **optional** and lives entirely in n8n; the backend in this repo does not depend on it. It simply exposes clean JSON endpoints (`/api/stops`, `/api/departures`, `/api/bookings`) that the n8n flow can call to turn WhatsApp voice messages into real bookings.