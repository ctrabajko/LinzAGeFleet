(function () {
  const fromInput = document.getElementById("fromStopName");
  const fromList = document.getElementById("fromStopList");
  const fromHiddenId = document.getElementById("fromStopId");

  const toInput = document.getElementById("toStopName");
  const toList = document.getElementById("toStopList");
  const toHiddenId = document.getElementById("toStopId");

  const bookingForm = document.getElementById("booking-form");
  const formMessage = document.getElementById("formMessage");
  const submitBookingBtn = document.getElementById("submitBooking");
  const summaryTextEl = document.getElementById("bookingSummaryText");

  const departuresContainer = document.getElementById("departures");
  const refreshDeparturesBtn = document.getElementById("refreshDepartures");

  const bookingsContainer = document.getElementById("bookings");
  const refreshBookingsBtn = document.getElementById("refreshBookings");

  const toggleContrastBtn = document.getElementById("toggle-contrast");
  const increaseFontBtn = document.getElementById("increase-font");
  const decreaseFontBtn = document.getElementById("decrease-font");
  const langToggleButtons = document.querySelectorAll(".lang-toggle");
  const fromStopMapLink = document.getElementById("fromStopMapLink");
  const toStopMapLink = document.getElementById("toStopMapLink");

  let currentStep = 1;
  const totalSteps = 3;
  let stepElements;
  let stepIndicatorItems;
  let prevStepBtn;
  let nextStepBtn;

  const translations = {
    en: {
      "skip.link": "Skip to main content",
      "header.title": "Linz Accessible E\u2011Fleet",
      "header.tagline":
        "Book wheelchair\u2011friendly electric vehicles that connect seamlessly to Linz AG public transport.",
      "tools.highContrast": "High contrast",
      "tools.increaseFont": "A+",
      "tools.decreaseFont": "A\u2212",
      "intro.heading": "Why this project?",
      "intro.paragraph":
        "Many wheelchair users cannot use standard ride\u2011sharing or taxis because vehicles do not support ramps or secure wheelchair positions. Our prototype bridges that gap:",
      "intro.list1": "On\u2011demand booking of e\u2011vehicles equipped with ramps.",
      "intro.list2":
        "Explicit capture of accessibility needs (number of wheelchairs, assistance level).",
      "intro.list3":
        "Integration with Linz AG\u2019s <abbr title=\"Elektronische Fahrplanauskunft\">EFA</abbr> API to show real-time departures at your origin stop.",
      "booking.heading": "Book an accessible E\u2011Fleet ride",
      "booking.description":
        "Bookings can be made for rides today or up to one day in advance. All vehicles have ramps and secure spaces for wheelchair users.",
      "booking.legend.details": "Your details",
      "booking.legend.trip": "Trip details",
      "booking.legend.accessibility": "Accessibility needs",
      "booking.label.name": "Name",
      "booking.label.email": "Email",
      "booking.label.phone": "Phone",
      "booking.hint.trip":
        "Choose origin and destination from Linz AG stops or important places. Suggestions come directly from the Linz AG EFA API.",
      "booking.label.pickup": "Pickup stop / place",
      "booking.hint.pickup":
        "Start typing \u201cHauptbahnhof\u201d, \u201cJKU\u201d, \u201csolarCity\u201d\u2026 and select a suggestion.",
      "booking.label.destination": "Destination stop / place",
      "booking.hint.destination":
        "Start typing your destination and pick one of the suggestions.",
      "booking.label.date": "Date",
      "booking.label.time": "Pickup time",
      "booking.label.wheelchairCount": "Number of wheelchair users",
      "booking.label.assistanceLevel": "Assistance level",
      "booking.option.assistance.standard":
        "Standard \u2013 ramp and secure space",
      "booking.option.assistance.extraTime":
        "Extra time for boarding / alighting",
      "booking.option.assistance.withAssistant":
        "Needs driver to assist with wheelchair",
      "booking.label.notes": "Additional notes for the driver",
      "booking.placeholder.notes":
        "E.g. service dog, oxygen equipment, transfer requirements\u2026",
      "booking.submit": "Book accessible ride",
      "booking.ctaPrimary": "Book your accessible ride",
      "booking.ctaSecondary": "See live departures",
      "booking.stepPrev": "Back",
      "booking.stepNext": "Next step",
      "booking.map.view": "View on Google Maps",
      "booking.aside.title": "How this prototype works",
      "booking.aside.step1":
        "You choose pickup and destination from Linz AG stops, plus date, time and accessibility needs.",
      "booking.aside.step2":
        "The backend validates that the trip is within the next 24 hours and assigns one of three demo e-vans based on load and wheelchair capacity.",
      "booking.aside.step3":
        "The app calls Linz AG\u2019s departure monitor to show real-time departures at your pickup stop and updates the operator view with your booking.",
      "booking.summary.title": "Your trip summary",
      "booking.summary.text":
        "On {date} at {time}, from {from} to {to}. Wheelchairs: {wheelchairs}. Assistance: {assistance}.",
      "departures.heading":
        "Live departures from your pickup stop (Linz AG)",
      "departures.refresh": "Refresh departures",
      "departures.description":
        "After you select a pickup stop, we use Linz AG\u2019s EFA Departure Monitor to show the next public transport connections. This helps coordinate transfers between the E\u2011Fleet and trams / buses.",
      "departures.selectPickupFirst":
        "Select a pickup stop first to see real-time departures.",
      "departures.none":
        "No upcoming departures found for this stop.",
      "departures.stopLabel": "Stop",
      "departures.leavesInLabel": "Leaves in",
      "departures.minutesSuffix": "min",
      "departures.now": "now",
      "departures.loadError":
        "Could not load departures from Linz AG. Please try again.",
      "bookings.heading":
        "Upcoming bookings (demo / operator view)",
      "bookings.refresh": "Refresh bookings",
      "bookings.description":
        "This simple operator view shows all upcoming bookings in the next 24 hours. In a full system, dispatchers would use this to assign vehicles and drivers.",
      "bookings.none":
        "No upcoming bookings yet. Book a ride to see it here.",
      "bookings.whenLabel": "When",
      "bookings.atSeparator": "at",
      "bookings.routeLabel": "Route",
      "bookings.wheelchairsLabel": "Wheelchairs",
      "bookings.assistanceLabel": "Assistance",
      "bookings.vehicleLabel": "Vehicle",
      "bookings.loadError":
        "Could not load bookings. Please refresh.",
      "footer.text":
        "Prototype for DevFest Linz \u2013 Great AI Hackathon \u00b7 Built with Linz AG EFA open data \u00b7 Accessibility-first design.",
      "error.pickupDestinationRequired":
        "Please select a valid pickup and destination stop from the suggestions.",
      "error.requiredFields":
        "Please fill in all required fields (name, email, date, time).",
      "error.step1Required":
        "Please fill in your name and email to continue.",
      "error.step2Required":
        "Please select pickup, destination, date and time to continue.",
      "error.bookingFailed": "Booking failed.",
      "error.generic":
        "Something went wrong. Please try again.",
      "success.bookingConfirmed":
        "Booking confirmed: {id}. We will send a confirmation to {email}.",
      "hero.card1.title": "Designed for wheelchair users",
      "hero.card1.body":
        "Vehicles with ramps and secure spaces, explicit wheelchair count and assistance level in every booking.",
      "hero.card2.title": "Connected to Linz AG",
      "hero.card2.body":
        "Stop-Finder suggestions and live departure monitor to coordinate transfers with trams and buses.",
      "hero.card3.title": "Hackathon-ready",
      "hero.card3.body":
        "In-memory backend, simple dispatch logic for 3 e-vans and a clear API for future voice/WhatsApp access."
    },
    de: {
      "skip.link": "Zum Hauptinhalt springen",
      "header.title": "Linz Barrierefreie E\u2011Flotte",
      "header.tagline":
        "Buche rollstuhlgerechte Elektrofahrzeuge, die nahtlos mit den \u00f6ffentlichen Verkehrsmitteln der Linz AG verbunden sind.",
      "tools.highContrast": "Hoher Kontrast",
      "tools.increaseFont": "A+",
      "tools.decreaseFont": "A\u2212",
      "intro.heading": "Warum dieses Projekt?",
      "intro.paragraph":
        "Viele Rollstuhlnutzer:innen k\u00f6nnen Standard-Taxis oder Ride-Sharing nicht verwenden, weil Fahrzeuge keine Rampen oder sicheren Rollstuhlpl\u00e4tze haben. Unser Prototyp schlie\u00dft diese L\u00fccke:",
      "intro.list1": "On-Demand-Buchung von E\u2011Fahrzeugen mit Rampe.",
      "intro.list2":
        "Erfassung der Barrierefreiheits-Bed\u00fcrfnisse (Anzahl Rollst\u00fchle, Unterst\u00fctzungsbedarf).",
      "intro.list3":
        "Integration mit der <abbr title=\"Elektronische Fahrplanauskunft\">EFA</abbr>-Schnittstelle der Linz AG, um Echtzeit-Abfahrten an deiner Starthaltestelle anzuzeigen.",
      "booking.heading": "Barrierefreie E\u2011Flottenfahrt buchen",
      "booking.description":
        "Fahrten k\u00f6nnen f\u00fcr heute oder bis zu einen Tag im Voraus gebucht werden. Alle Fahrzeuge haben Rampen und gesicherte Rollstuhlpl\u00e4tze.",
      "booking.legend.details": "Deine Angaben",
      "booking.legend.trip": "Fahrtdaten",
      "booking.legend.accessibility": "Barrierefreiheits-Bedarf",
      "booking.label.name": "Name",
      "booking.label.email": "E\u2011Mail",
      "booking.label.phone": "Telefon",
      "booking.hint.trip":
        "W\u00e4hle Start und Ziel aus Haltestellen oder wichtigen Orten der Linz AG. Die Vorschl\u00e4ge kommen direkt aus der EFA-Schnittstelle.",
      "booking.label.pickup": "Abhol\u2011Haltestelle / Ort",
      "booking.hint.pickup":
        "Tippe z.\u202fB. \u201eHauptbahnhof\u201c, \u201eJKU\u201c oder \u201esolarCity\u201c und w\u00e4hle einen Vorschlag.",
      "booking.label.destination": "Ziel\u2011Haltestelle / Ort",
      "booking.hint.destination":
        "Tippe dein Ziel und w\u00e4hle einen passenden Vorschlag aus.",
      "booking.label.date": "Datum",
      "booking.label.time": "Abholzeit",
      "booking.label.wheelchairCount": "Anzahl Rollstuhlnutzer:innen",
      "booking.label.assistanceLevel": "Unterst\u00fctzungsbedarf",
      "booking.option.assistance.standard":
        "Standard \u2013 Rampe und Sicherungsplatz",
      "booking.option.assistance.extraTime":
        "Mehr Zeit zum Ein- und Aussteigen",
      "booking.option.assistance.withAssistant":
        "Fahrer:in soll beim Rollstuhl helfen",
      "booking.label.notes":
        "Zus\u00e4tzliche Hinweise f\u00fcr die/den Fahrer:in",
      "booking.placeholder.notes":
        "z.\u202fB. Assistenzhund, Sauerstoffger\u00e4t, Umsteige-Unterst\u00fctzung \u2026",
      "booking.submit": "Barrierefreie Fahrt buchen",
      "booking.ctaPrimary": "Barrierefreie Fahrt buchen",
      "booking.ctaSecondary": "Echtzeit-Abfahrten anzeigen",
      "booking.stepPrev": "Zur\u00fcck",
      "booking.stepNext": "Weiter",
      "booking.map.view": "In Google Maps \u00f6ffnen",
      "booking.aside.title": "So funktioniert dieser Prototyp",
      "booking.aside.step1":
        "Du w\u00e4hlst Abhol- und Ziel-Haltestelle aus dem Haltestellenverzeichnis der Linz AG sowie Datum, Uhrzeit und Barrierefreiheits-Bed\u00fcrfnisse.",
      "booking.aside.step2":
        "Das Backend pr\u00fcft, ob die Fahrt innerhalb der n\u00e4chsten 24 Stunden liegt, und weist anhand der Auslastung und Rollstuhlkapazit\u00e4t eines von drei Demo-E-Fahrzeugen zu.",
      "booking.aside.step3":
        "Die App ruft die Abfahrtsanzeige der Linz AG auf, um Echtzeit-Abfahrten an deiner Abhol-Haltestelle anzuzeigen, und aktualisiert die Dispo-Ansicht mit deiner Buchung.",
      "booking.summary.title": "Deine Fahrt\u00fcbersicht",
      "booking.summary.text":
        "Am {date} um {time}, von {from} nach {to}. Rollst\u00fchle: {wheelchairs}. Unterst\u00fctzung: {assistance}.",
      "departures.heading":
        "Echtzeit\u2011Abfahrten von deiner Abhol\u2011Haltestelle (Linz AG)",
      "departures.refresh": "Abfahrten aktualisieren",
      "departures.description":
        "Nachdem du eine Abhol\u2011Haltestelle gew\u00e4hlt hast, nutzen wir die EFA-Abfahrtsanzeige der Linz AG, um die n\u00e4chsten Verbindungen zu zeigen. So lassen sich Umstiege zur E\u2011Flotte besser planen.",
      "departures.selectPickupFirst":
        "W\u00e4hle zuerst eine Abhol\u2011Haltestelle, um Abfahrten zu sehen.",
      "departures.none":
        "F\u00fcr diese Haltestelle wurden keine bevorstehenden Abfahrten gefunden.",
      "departures.stopLabel": "Haltestelle",
      "departures.leavesInLabel": "Abfahrt in",
      "departures.minutesSuffix": "Min",
      "departures.now": "jetzt",
      "departures.loadError":
        "Abfahrten konnten nicht geladen werden. Bitte sp\u00e4ter erneut versuchen.",
      "bookings.heading":
        "Bevorstehende Buchungen (Demo / Dispo\u2011Ansicht)",
      "bookings.refresh": "Buchungen aktualisieren",
      "bookings.description":
        "Diese einfache Dispositionsansicht zeigt alle anstehenden Buchungen der n\u00e4chsten 24 Stunden. In einem echten System w\u00fcrden hier Fahrzeuge und Fahrer:innen zugeteilt.",
      "bookings.none":
        "Noch keine bevorstehenden Buchungen. Erstelle eine Fahrt, um sie hier zu sehen.",
      "bookings.whenLabel": "Wann",
      "bookings.atSeparator": "um",
      "bookings.routeLabel": "Strecke",
      "bookings.wheelchairsLabel": "Rollst\u00fchle",
      "bookings.assistanceLabel": "Unterst\u00fctzung",
      "bookings.vehicleLabel": "Fahrzeug",
      "bookings.loadError":
        "Buchungen konnten nicht geladen werden. Bitte aktualisieren.",
      "footer.text":
        "Prototyp f\\u00fcr das DevFest Linz \\u2013 Great AI Hackathon \\u00b7 Entwickelt mit Linz AG EFA Open Data \\u00b7 Accessibility\\u2011First\\u2011Design.",
      "error.pickupDestinationRequired":
        "Bitte w\\u00e4hle eine g\\u00fcltige Abhol- und Ziel\\u2011Haltestelle aus den Vorschl\\u00e4gen.",
      "error.requiredFields":
        "Bitte f\\u00fclle alle Pflichtfelder aus (Name, E\\u2011Mail, Datum, Uhrzeit).",
      "error.bookingFailed": "Buchung fehlgeschlagen.",
      "error.generic":
        "Etwas ist schiefgelaufen. Bitte versuche es erneut.",
      "error.step1Required":
        "Bitte gib Name und E\u2011Mail an, um fortzufahren.",
      "error.step2Required":
        "Bitte w\u00e4hle Abhol- und Ziel-Haltestelle sowie Datum und Uhrzeit, um fortzufahren.",
      "success.bookingConfirmed":
        "Buchung best\\u00e4tigt: {id}. Eine Best\\u00e4tigung wird an {email} gesendet.",
      "hero.card1.title": "Konzipiert f\\u00fcr Rollstuhlnutzer:innen",
      "hero.card1.body":
        "Fahrzeuge mit Rampe und Sicherungspl\\u00e4tzen, explizite Angabe von Rollstuhlanzahl und Unterst\\u00fctzungsbedarf bei jeder Buchung.",
      "hero.card2.title": "An Linz AG angebunden",
      "hero.card2.body":
        "Haltestellenvorschl\\u00e4ge \\u00fcber den Stop-Finder und Echtzeit-Abfahrten zur besseren Planung von Umstiegen mit Stra\\u00dfenbahn und Bus.",
      "hero.card3.title": "Hackathon-ready",
      "hero.card3.body":
        "In-Memory-Backend, einfache Disposition f\\u00fcr drei E-Vans und eine klare API f\\u00fcr k\\u00fcnftige Voice- oder WhatsApp-Anbindung."
    }
  };

  let currentLang =
    typeof window !== "undefined" &&
    window.localStorage &&
    window.localStorage.getItem("lang") === "de"
      ? "de"
      : "en";

  let lastFromStops = [];
  let lastToStops = [];
  let baseFontPercent = 100;

  function t(key, vars) {
    const dict = translations[currentLang] || translations.en;
    let template =
      dict[key] !== undefined
        ? dict[key]
        : translations.en[key] !== undefined
        ? translations.en[key]
        : key;

    if (vars) {
      Object.keys(vars).forEach((name) => {
        template = template.replace(
          new RegExp(`{${name}}`, "g"),
          vars[name]
        );
      });
    }

    return template;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;

    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const useHtml = el.getAttribute("data-i18n-html") === "true";
      const text = t(key);
      if (useHtml) {
        el.innerHTML = text;
      } else {
        el.textContent = text;
      }
    });

    const notes = document.getElementById("notes");
    if (notes) {
      notes.placeholder = t("booking.placeholder.notes");
    }

    if (currentStep === 3) {
      updateStep3Summary();
    }
  }

  function updateLanguageToggleUI() {
    langToggleButtons.forEach((btn) => {
      const lang = btn.getAttribute("data-lang");
      const isActive = lang === currentLang;
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      if (isActive) {
        btn.classList.add("active-lang");
      } else {
        btn.classList.remove("active-lang");
      }
    });
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem("lang", lang);
    }
    applyTranslations();
    updateLanguageToggleUI();
  }

  function setFormMessage(message, type) {
    formMessage.textContent = message || "";
    formMessage.classList.remove("error", "success");
    if (type) {
      formMessage.classList.add(type);
    }
  }

  function showStep(step) {
    if (!stepElements || !stepElements.length) return;

    const target = Math.min(Math.max(step, 1), totalSteps);
    currentStep = target;

    stepElements.forEach((el) => {
      const stepNum = Number(el.getAttribute("data-step"));
      el.hidden = stepNum !== currentStep;
    });

    if (prevStepBtn) {
      prevStepBtn.hidden = currentStep === 1;
    }
    if (nextStepBtn) {
      nextStepBtn.hidden = currentStep === totalSteps;
    }
    if (submitBookingBtn) {
      submitBookingBtn.hidden = currentStep !== totalSteps;
    }

    if (stepIndicatorItems && stepIndicatorItems.length) {
      stepIndicatorItems.forEach((item) => {
        const stepNum = Number(item.getAttribute("data-step"));
        item.classList.remove("is-active", "is-complete");
        if (stepNum < currentStep) {
          item.classList.add("is-complete");
        } else if (stepNum === currentStep) {
          item.classList.add("is-active");
        }
      });
    }

    let focusTarget = null;
    if (currentStep === 1) {
      focusTarget = document.getElementById("name");
    } else if (currentStep === 2) {
      focusTarget = fromInput;
    } else if (currentStep === 3) {
      focusTarget = document.getElementById("wheelchairCount");
      updateStep3Summary();
    }

    if (focusTarget && typeof focusTarget.focus === "function") {
      focusTarget.focus();
    }
  }

  function updateStep3Summary() {
    if (!summaryTextEl) return;

    const fromName = (fromInput && fromInput.value.trim()) || "–";
    const toName = (toInput && toInput.value.trim()) || "–";
    const dateVal = (document.getElementById("date") || {}).value || "";
    const timeVal = (document.getElementById("time") || {}).value || "";
    const wheelchairsVal =
      (document.getElementById("wheelchairCount") || {}).value || "0";
    const assistanceSelect = document.getElementById("assistanceLevel");
    let assistanceLabel = "–";
    if (assistanceSelect) {
      const selectedOption =
        assistanceSelect.options[assistanceSelect.selectedIndex];
      if (selectedOption && selectedOption.textContent) {
        assistanceLabel = selectedOption.textContent.trim();
      }
    }

    summaryTextEl.textContent = t("booking.summary.text", {
      date: dateVal || "–",
      time: timeVal || "–",
      from: fromName || "–",
      to: toName || "–",
      wheelchairs: wheelchairsVal || "0",
      assistance: assistanceLabel || "–",
    });
  }

  function validateStep(step) {
    setFormMessage("");
    if (step === 1) {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      if (!name || !email) {
        setFormMessage(t("error.step1Required"), "error");
        return false;
      }
    } else if (step === 2) {
      resolveSelectedStopId(fromInput, "from");
      resolveSelectedStopId(toInput, "to");
      const dateVal = document.getElementById("date").value;
      const timeVal = document.getElementById("time").value;
      if (!fromHiddenId.value || !toHiddenId.value || !dateVal || !timeVal) {
        setFormMessage(t("error.step2Required"), "error");
        return false;
      }
    }
    return true;
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

  function updateMapPreview(stopNameOrNull) {
    const frame = document.getElementById("mapPreviewFrame");
    if (!frame) return;

    if (stopNameOrNull) {
      const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
        stopNameOrNull
      )}&output=embed`;
      frame.src = embedUrl;
      frame.hidden = false;
    } else if (!fromHiddenId.value && !toHiddenId.value) {
      frame.hidden = true;
      frame.removeAttribute("src");
    }
  }

  function resolveSelectedStopId(inputEl, target) {
    const value = inputEl.value.trim();
    if (!value) {
      if (target === "from") {
        fromHiddenId.value = "";
        if (fromStopMapLink) {
          fromStopMapLink.hidden = true;
          fromStopMapLink.removeAttribute("href");
        }
      } else {
        toHiddenId.value = "";
        if (toStopMapLink) {
          toStopMapLink.hidden = true;
          toStopMapLink.removeAttribute("href");
        }
      }
      updateMapPreview(null);
      return;
    }

    const list = target === "from" ? lastFromStops : lastToStops;
    const lowerValue = value.toLowerCase();

    let match =
      list.find((s) => s.name === value) ||
      list.find((s) => s.name.toLowerCase() === lowerValue) ||
      list.find((s) => s.name.toLowerCase().includes(lowerValue));

    if (!match && list.length === 1) {
      match = list[0];
    }

    if (match) {
      const query = encodeURIComponent(match.name);
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

      if (target === "from") {
        fromHiddenId.value = match.id;
        if (fromStopMapLink) {
          fromStopMapLink.href = mapUrl;
          fromStopMapLink.hidden = false;
        }
      } else {
        toHiddenId.value = match.id;
        if (toStopMapLink) {
          toStopMapLink.href = mapUrl;
          toStopMapLink.hidden = false;
        }
      }

      updateMapPreview(match.name);
    } else {
      if (target === "from") {
        fromHiddenId.value = "";
        if (fromStopMapLink) {
          fromStopMapLink.hidden = true;
          fromStopMapLink.removeAttribute("href");
        }
      } else {
        toHiddenId.value = "";
        if (toStopMapLink) {
          toStopMapLink.hidden = true;
          toStopMapLink.removeAttribute("href");
        }
      }
      updateMapPreview(null);
    }
  }

  async function submitBooking(event) {
    event.preventDefault();
    setFormMessage("");

    resolveSelectedStopId(fromInput, "from");
    resolveSelectedStopId(toInput, "to");

    if (!fromHiddenId.value || !toHiddenId.value) {
      setFormMessage(
        t("error.pickupDestinationRequired"),
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
        t("error.requiredFields"),
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
        const errorMsg =
          data && data.error ? data.error : t("error.bookingFailed");
        setFormMessage(errorMsg, "error");
        return;
      }

      setFormMessage(
        t("success.bookingConfirmed", { id: data.id, email: data.email }),
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
      setFormMessage(t("error.generic"), "error");
    }
  }

  async function loadDepartures(stopId, stopNameFromBooking) {
    const stopIdToUse = stopId || fromHiddenId.value;
    if (!stopIdToUse) {
      departuresContainer.innerHTML = `<p class="hint">${escapeHtml(
        t("departures.selectPickupFirst")
      )}</p>`;
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
        departuresContainer.innerHTML = `<p class="hint">${escapeHtml(
          t("departures.none")
        )}</p>`;
        return;
      }

      const fragment = document.createDocumentFragment();
      data.forEach((dep) => {
        const card = document.createElement("article");
        card.className = "card";

        const stopLabel = escapeHtml(t("departures.stopLabel"));
        const leavesInLabel = escapeHtml(t("departures.leavesInLabel"));
        const countdownText = Number.isFinite(dep.countdownMinutes)
          ? `${dep.countdownMinutes} ${t("departures.minutesSuffix")}`
          : t("departures.now");

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
            <div><strong>${stopLabel}:</strong> ${escapeHtml(
          dep.stopName || stopNameFromBooking || ""
        )}</div>
            <div><strong>${leavesInLabel}:</strong> ${escapeHtml(
          countdownText
        )}</div>
          </div>
        `;
        fragment.appendChild(card);
      });

      departuresContainer.appendChild(fragment);
    } catch (err) {
      console.error("Error loading departures:", err);
      departuresContainer.innerHTML = `<p class="hint">${escapeHtml(
        t("departures.loadError")
      )}</p>`;
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
        bookingsContainer.innerHTML = `<p class="hint">${escapeHtml(
          t("bookings.none")
        )}</p>`;
        return;
      }

      const fragment = document.createDocumentFragment();
      data.forEach((b) => {
        const card = document.createElement("article");
        card.className = "card";

        const whenLabel = escapeHtml(t("bookings.whenLabel"));
        const routeLabel = escapeHtml(t("bookings.routeLabel"));
        const wheelchairsLabel = escapeHtml(t("bookings.wheelchairsLabel"));
        const assistanceLabel = escapeHtml(t("bookings.assistanceLabel"));
        const vehicleLabel = escapeHtml(t("bookings.vehicleLabel"));

        let vehicleLine = "";
        if (b.vehicleId || b.vehicleName) {
          const vehicleText = escapeHtml(
            [b.vehicleId, b.vehicleName].filter(Boolean).join(" – ")
          );
          vehicleLine = `<div><strong>${vehicleLabel}:</strong> ${vehicleText}</div>`;
        }

        card.innerHTML = `
          <div class="card-header">
            <div class="card-title">${escapeHtml(b.name)}</div>
            <span class="chip success">${escapeHtml(
              (b.status || "confirmed").toUpperCase()
            )}</span>
          </div>
          <div class="card-meta">
            <div><strong>${whenLabel}:</strong> ${escapeHtml(
          b.date
        )} ${t("bookings.atSeparator") || "at"} ${escapeHtml(b.time)}</div>
            <div><strong>${routeLabel}:</strong> ${escapeHtml(
          b.fromStopName
        )} → ${escapeHtml(b.toStopName)}</div>
            <div><strong>${wheelchairsLabel}:</strong> ${escapeHtml(
          String(b.wheelchairCount || 0)
        )}, <strong>${assistanceLabel}:</strong> ${escapeHtml(
          b.assistanceLevel
        )}</div>
            ${vehicleLine}
          </div>
        `;
        fragment.appendChild(card);
      });

      bookingsContainer.appendChild(fragment);
    } catch (err) {
      console.error("Error loading bookings:", err);
      bookingsContainer.innerHTML = `<p class="hint">${escapeHtml(
        t("bookings.loadError")
      )}</p>`;
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
    langToggleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        if (lang) {
          setLanguage(lang);
        }
      });
    });

    stepElements = Array.from(document.querySelectorAll(".form-step"));
    stepIndicatorItems = Array.from(
      document.querySelectorAll(".step-indicator-item")
    );
    prevStepBtn = document.getElementById("prevStep");
    nextStepBtn = document.getElementById("nextStep");

    if (prevStepBtn) {
      prevStepBtn.addEventListener("click", () => {
        if (currentStep > 1) {
          currentStep -= 1;
          showStep(currentStep);
        }
      });
    }

    if (nextStepBtn) {
      nextStepBtn.addEventListener("click", () => {
        if (!validateStep(currentStep)) return;
        if (currentStep < totalSteps) {
          currentStep += 1;
          showStep(currentStep);
        }
      });
    }

    const wheelchairCountInput = document.getElementById("wheelchairCount");
    const assistanceLevelSelect = document.getElementById("assistanceLevel");
    if (wheelchairCountInput) {
      wheelchairCountInput.addEventListener("input", () => {
        if (currentStep === 3) updateStep3Summary();
      });
    }
    if (assistanceLevelSelect) {
      assistanceLevelSelect.addEventListener("change", () => {
        if (currentStep === 3) updateStep3Summary();
      });
    }

    applyTranslations();
    updateLanguageToggleUI();
    showStep(currentStep);
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