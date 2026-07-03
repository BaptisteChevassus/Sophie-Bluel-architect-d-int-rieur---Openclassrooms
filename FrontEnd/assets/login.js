const API_URL = "http://localhost:5678/api";

const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Supprime le message d'erreur précédent s'il existe
    const existingError = form.querySelector(".login-error");
    if (existingError) existingError.remove();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("token", data.token);
            window.location.href = "index.html";
        } else {
            form.innerHTML += "<p class='login-error'>Identifiants incorrects. Veuillez réessayer.</p>";
        }
    } catch (error) {
        console.error("Erreur réseau :", error);
        form.innerHTML += "<p class='login-error'>Impossible de contacter le serveur. Veuillez réessayer plus tard.</p>";
    }
});