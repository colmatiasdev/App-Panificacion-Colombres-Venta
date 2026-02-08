const AUTH_KEY = "toro_admin_auth";

const showDashboard = () => {
    const dashboardContent = document.getElementById("dashboard-content");
    if (dashboardContent) {
        dashboardContent.style.display = "block";
        dashboardContent.setAttribute("aria-hidden", "false");
    }
};

const showLogin = (loginCard, loginError) => {
    if (loginError) loginError.style.display = "none";
    if (loginCard) loginCard.style.display = "grid";
    const dashboardContent = document.getElementById("dashboard-content");
    if (dashboardContent) {
        dashboardContent.style.display = "none";
        dashboardContent.setAttribute("aria-hidden", "true");
    }
};

const initLogin = () => {
    const loginCard = document.getElementById("login-card");
    const loginForm = document.getElementById("login-form");
    const loginUser = document.getElementById("login-user");
    const loginPass = document.getElementById("login-pass");
    const loginError = document.getElementById("login-error");
    const logoutBtn = document.getElementById("logout-btn");

    try {
        if (sessionStorage.getItem(AUTH_KEY) === "1") {
            if (loginCard) loginCard.style.display = "none";
            showDashboard();
        } else {
            showLogin(loginCard, loginError);
        }
    } catch (e) {
        showLogin(loginCard, loginError);
    }

    loginForm?.addEventListener("submit", (event) => {
        event.preventDefault();
        const user = loginUser?.value.trim() || "";
        const pass = loginPass?.value.trim() || "";
        const ok = user === "admin" && pass === "admin";
        if (!ok) {
            if (loginError) loginError.style.display = "block";
            return;
        }
        try { sessionStorage.setItem(AUTH_KEY, "1"); } catch (e) {}
        if (loginCard) loginCard.style.display = "none";
        showDashboard();
    });

    logoutBtn?.addEventListener("click", () => {
        try { sessionStorage.removeItem(AUTH_KEY); } catch (e) {}
        showLogin(loginCard, loginError);
    });
};

const loadLoginFragment = async () => {
    const slot = document.getElementById("login-slot");
    if (!slot) return;
    try {
        const response = await fetch("login/login.html");
        if (!response.ok) return;
        slot.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
    initLogin();
};

loadLoginFragment();
