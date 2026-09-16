/* Apply the saved/system theme before the application or stylesheet paints. */
(function () {
  var preference = "system";
  try {
    preference = localStorage.getItem("buidlcamp-theme") || "system";
  } catch {
    /* Browser storage may be blocked. */
  }
  var dark =
    preference === "dark" ||
    (preference !== "light" &&
      matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
})();
