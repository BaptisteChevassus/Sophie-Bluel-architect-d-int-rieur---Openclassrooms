// URL de base de l'API
const API_URL = "http://localhost:5678/api";

// Récupération des travaux depuis l'API
async function getWorks() {
    const response = await fetch(`${API_URL}/works`);
    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
    const works = await response.json();
    return works;
}

// Récupération des catégories depuis l'API
async function getCategories() {
    const response = await fetch(`${API_URL}/categories`);
    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);
    const categories = await response.json();
    return categories;
}

// Affichage des travaux dans la galerie
function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    works.forEach((work) => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const figcaption = document.createElement("figcaption");

        img.src = work.imageUrl;
        img.alt = work.title;
        figcaption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
}

// Affichage des boutons de filtre
function displayFilters(categories, works) {
    const filtersContainer = document.querySelector(".filters");
    filtersContainer.innerHTML = "";

    // Bouton "Tous" par défaut
    const allButton = document.createElement("button");
    allButton.textContent = "Tous";
    allButton.classList.add("filter-btn", "active");
    allButton.addEventListener("click", () => {
        displayWorks(works);
        setActiveButton(allButton);
    });
    filtersContainer.appendChild(allButton);

    // Boutons par catégorie
    categories.forEach((category) => {
        const button = document.createElement("button");
        button.textContent = category.name;
        button.classList.add("filter-btn");
        button.addEventListener("click", () => {
            const filtered = works.filter((work) => work.category.id === category.id);
            displayWorks(filtered);
            setActiveButton(button);
        });
        filtersContainer.appendChild(button);
    });
}

// Gestion du bouton actif
function setActiveButton(activeBtn) {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.classList.remove("active");
    });
    activeBtn.classList.add("active");
}

// Vérification de l'authentification
function checkAuth() {
    const token = localStorage.getItem("token");
    const loginNav = document.getElementById("login-nav");

    if (token) {
        document.body.classList.add("is-logged");
        loginNav.innerHTML = "<a id='logout-btn' href='#'>logout</a>";

        document.getElementById("logout-btn").addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            window.location.reload();
        });
    }
}

// Initialisation
Promise.all([getWorks(), getCategories()])
    .then(([works, categories]) => {
        displayWorks(works);
        displayFilters(categories, works);
        checkAuth();
    })
    //si impossible de récupérer data de l'API on affiche un front au cas où
    .catch((error) => {
        console.error("Erreur lors du chargement des données :", error);
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = "<p class='gallery-error'>Impossible de charger les projets. Veuillez réessayer plus tard.</p>";
    });