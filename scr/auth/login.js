(function () {
    const FORM = document.getElementById("login-form");
    const ERROR_EL = document.getElementById("auth-error");
    const STORAGE_KEY = "panificacion_usuarios";
    const SESSION_KEY = "panificacion_sesion";

    function showError(msg) {
        if (!ERROR_EL) return;
        ERROR_EL.textContent = msg || "Correo o contraseña incorrectos.";
        ERROR_EL.classList.add("visible");
    }

    function hideError() {
        if (ERROR_EL) ERROR_EL.classList.remove("visible");
    }

    function getUsuarios() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function login(email, password) {
        const usuarios = getUsuarios();
        const normalizado = (email || "").trim().toLowerCase();
        const user = usuarios[normalizado];
        if (!user || user.password !== password) return false;
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: normalizado, nombre: user.nombre }));
        } catch (e) {}
        return true;
    }

    if (FORM) {
        FORM.addEventListener("submit", function (e) {
            e.preventDefault();
            hideError();
            const email = (FORM.querySelector("#email") || {}).value;
            const password = (FORM.querySelector("#password") || {}).value;
            if (!email || !password) {
                showError("Completá correo y contraseña.");
                return;
            }
            if (login(email, password)) {
                window.location.href = "../../index.html";
            } else {
                showError("Correo o contraseña incorrectos. Si no tenés cuenta, registrate.");
            }
        });
    }
})();
