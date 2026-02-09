(function () {
    const FORM = document.getElementById("registro-form");
    const ERROR_EL = document.getElementById("auth-error");
    const STORAGE_KEY = "panificacion_usuarios";

    function showError(msg) {
        if (!ERROR_EL) return;
        ERROR_EL.textContent = msg || "Revisá los datos e intentá de nuevo.";
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

    function guardarUsuario(nombre, email, password) {
        const usuarios = getUsuarios();
        const normalizado = (email || "").trim().toLowerCase();
        if (usuarios[normalizado]) return false;
        usuarios[normalizado] = { nombre: (nombre || "").trim(), email: normalizado, password: password };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
            return true;
        } catch (e) {
            return false;
        }
    }

    if (FORM) {
        FORM.addEventListener("submit", function (e) {
            e.preventDefault();
            hideError();
            const nombre = (FORM.querySelector("#nombre") || {}).value;
            const email = (FORM.querySelector("#email") || {}).value;
            const password = (FORM.querySelector("#password") || {}).value;
            const password2 = (FORM.querySelector("#password2") || {}).value;

            if (!nombre || !email) {
                showError("Completá nombre y correo.");
                return;
            }
            if (password.length < 6) {
                showError("La contraseña debe tener al menos 6 caracteres.");
                return;
            }
            if (password !== password2) {
                showError("Las contraseñas no coinciden.");
                return;
            }
            if (guardarUsuario(nombre, email, password)) {
                window.location.href = "login.html?registro=1";
            } else {
                showError("Ese correo ya está registrado. Iniciá sesión o usá otro correo.");
            }
        });
    }
})();
