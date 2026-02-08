document.addEventListener("DOMContentLoaded", () => {
    const igConfig = window.APP_CONFIG?.instagram || {};
    const igLink = document.getElementById("ig-link");
    const igName = document.getElementById("ig-name");
    if (igLink) igLink.href = igConfig.url || "#";
    if (igName) igName.textContent = igConfig.name ? `@${igConfig.name}` : "@ToroRapidoOk";
});
