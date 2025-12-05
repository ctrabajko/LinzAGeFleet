(function () {
  const toggleContrastBtn = document.getElementById("toggle-contrast");
  const increaseFontBtn = document.getElementById("increase-font");
  const decreaseFontBtn = document.getElementById("decrease-font");

  let baseFontPercent = 100;

  if (toggleContrastBtn) {
    toggleContrastBtn.addEventListener("click", () => {
      document.body.classList.toggle("high-contrast");
    });
  }

  if (increaseFontBtn) {
    increaseFontBtn.addEventListener("click", () => {
      baseFontPercent = Math.min(baseFontPercent + 10, 140);
      document.documentElement.style.setProperty(
        "--font-size",
        baseFontPercent + "%"
      );
    });
  }

  if (decreaseFontBtn) {
    decreaseFontBtn.addEventListener("click", () => {
      baseFontPercent = Math.max(baseFontPercent - 10, 80);
      document.documentElement.style.setProperty(
        "--font-size",
        baseFontPercent + "%"
      );
    });
  }
})();