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

        figure.dataset.id = work.id;
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

    return !!token;
}

// Suppression d'un travail
async function deleteWork(id, figureElement) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/works/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
    }

    if (response.ok) {
        figureElement.remove();
        const workToRemove = document.querySelector(`.gallery figure[data-id="${id}"]`);
        if (workToRemove) workToRemove.remove();
    }
}

// Affichage des travaux dans la modale galerie
function displayModalGallery(works) {
    const grid = document.getElementById("modal-gallery-grid");
    grid.innerHTML = "";

    works.forEach((work) => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const deleteBtn = document.createElement("button");

        figure.dataset.id = work.id;
        img.src = work.imageUrl;
        img.alt = work.title;

        deleteBtn.classList.add("delete-btn");
        deleteBtn.innerHTML = `<svg width="9" height="11" viewBox="0 0 9 11" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.71607 0.35558C2.82455 0.136607 3.04754 0 3.29063 0H5.70938C5.95246 0 6.17545 0.136607 6.28393 0.35558L6.42857 0.642857H8.35714C8.71272 0.642857 9 0.930134 9 1.28571C9 1.64129 8.71272 1.92857 8.35714 1.92857H0.642857C0.287277 1.92857 0 1.64129 0 1.28571C0 0.930134 0.287277 0.642857 0.642857 0.642857H2.57143L2.71607 0.35558ZM0.642857 2.57143H8.35714V9C8.35714 9.70915 7.78058 10.2857 7.07143 10.2857H1.92857C1.21942 10.2857 0.642857 9.70915 0.642857 9V2.57143ZM2.57143 3.85714C2.39464 3.85714 2.25 4.00179 2.25 4.17857V8.67857C2.25 8.85536 2.39464 9 2.57143 9C2.74821 9 2.89286 8.85536 2.89286 8.67857V4.17857C2.89286 4.00179 2.74821 3.85714 2.57143 3.85714ZM4.5 3.85714C4.32321 3.85714 4.17857 4.00179 4.17857 4.17857V8.67857C4.17857 8.85536 4.32321 9 4.5 9C4.67679 9 4.82143 8.85536 4.82143 8.67857V4.17857C4.82143 4.00179 4.67679 3.85714 4.5 3.85714ZM6.42857 3.85714C6.25179 3.85714 6.10714 4.00179 6.10714 4.17857V8.67857C6.10714 8.85536 6.25179 9 6.42857 9C6.60536 9 6.75 8.85536 6.75 8.67857V4.17857C6.75 4.00179 6.60536 3.85714 6.42857 3.85714Z" fill="white"/>
</svg>`;

        deleteBtn.addEventListener("click", () => {
            deleteWork(work.id, figure);
        });

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        grid.appendChild(figure);
    });
}

// Gestion de la modale
function initModal() {
    const overlay = document.getElementById("modal-overlay");
    const editBtn = document.getElementById("edit-btn");
    const closeButtons = document.querySelectorAll(".modal-close");
    const addBtn = document.getElementById("modal-add-btn");
    const backBtn = document.getElementById("modal-back");
    const modalGallery = document.getElementById("modal-gallery");
    const modalForm = document.getElementById("modal-form");

    // Ouvrir la modale
    editBtn.addEventListener("click", () => {
        document.body.classList.add("modal-open");
    });

    // Fermer avec la croix
    closeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            document.body.classList.remove("modal-open");
        });
    });

    // Fermer en cliquant sur l'overlay
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            document.body.classList.remove("modal-open");
        }
    });

    // Aller vers le formulaire d'ajout
    addBtn.addEventListener("click", () => {
        modalGallery.classList.add("hidden");
        modalForm.classList.remove("hidden");
    });

    // Retour vers la galerie
    backBtn.addEventListener("click", () => {
        modalForm.classList.add("hidden");
        modalGallery.classList.remove("hidden");
    });
}

// Initialisation
Promise.all([getWorks(), getCategories()])
    .then(([works, categories]) => {
        displayWorks(works);
        displayFilters(categories, works);

        const isLogged = checkAuth();
        if (isLogged) {
            displayModalGallery(works);
            initModal();
        }
    })
    // si impossible de récupérer data de l'API on affiche un front au cas où
    .catch((error) => {
        console.error("Erreur lors du chargement des données :", error);
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = "<p class='gallery-error'>Impossible de charger les projets. Veuillez réessayer plus tard.</p>";
    });