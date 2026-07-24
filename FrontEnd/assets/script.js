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
async function deleteWork(id, figureElement, works) {
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

        const index = works.findIndex((work) => work.id === id);
        if (index !== -1) works.splice(index, 1);
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
            deleteWork(work.id, figure, works);
        });

        figure.appendChild(img);
        figure.appendChild(deleteBtn);
        grid.appendChild(figure);
    });
}

// Remplissage du select des catégories dans le formulaire
function populateCategorySelect(categories) {
    const select = document.getElementById("work-category");
    select.innerHTML = '<option value="" selected disabled></option>';

    categories.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

// Active/désactive le style du bouton valider selon la validité du formulaire
function updateValidateButtonState() {
    const titleInput = document.getElementById("work-title");
    const categorySelect = document.getElementById("work-category");
    const fileInput = document.getElementById("work-image");
    const validateBtn = document.getElementById("validate-btn");

    const isValid = titleInput.value !== "" && categorySelect.value !== "" && fileInput.files.length > 0;
    validateBtn.classList.toggle("valid", isValid);
}

// Prévisualisation de l'image sélectionnée
function initImagePreview() {
    const fileInput = document.getElementById("work-image");
    const uploadZone = document.getElementById("upload-zone");

    fileInput.addEventListener("change", () => {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.addEventListener("load", () => {
            uploadZone.innerHTML = `
                <img src="${reader.result}" class="preview-img" alt="Prévisualisation">
                <button type="button" id="remove-image-btn" aria-label="Supprimer l'image">✕</button>
                <input type="file" id="work-image" name="image" accept=".jpg,.png" hidden>
            `;

            // Réattache le fichier sélectionné au nouvel input recréé
            const newInput = document.getElementById("work-image");
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            newInput.files = dataTransfer.files;

            // Bouton pour retirer l'image sans fermer la modale
            document.getElementById("remove-image-btn").addEventListener("click", () => {
                resetUploadZone();
                updateValidateButtonState();
            });

            updateValidateButtonState();
        });
        reader.readAsDataURL(file);
    });
}

// Réinitialisation visuelle de la zone d'upload
function resetUploadZone() {
    const uploadZone = document.getElementById("upload-zone");
    uploadZone.innerHTML = `
        <img src="./assets/icons/image-placeholder.png" alt="">
        <label for="work-image">+ Ajouter photo</label>
        <input type="file" id="work-image" name="image" accept=".jpg,.png" hidden>
        <p>jpg, png : 4mo max</p>
    `;
    initImagePreview();
}

// Réinitialisation complète du formulaire d'ajout (champs, image, bouton, erreur)
function resetAddWorkForm() {
    const form = document.getElementById("add-work-form");
    const existingError = document.getElementById("form-error");

    form.reset();
    resetUploadZone();
    updateValidateButtonState();
    if (existingError) existingError.remove();
}

// Ajout d'un nouveau travail
async function addWork(e, works, categories) {
    e.preventDefault();

    const existingError = document.getElementById("form-error");
    if (existingError) existingError.remove();

    const titleInput = document.getElementById("work-title");
    const categorySelect = document.getElementById("work-category");
    const fileInput = document.getElementById("work-image");
    const file = fileInput.files[0];

    if (!titleInput.value || !categorySelect.value || !file) {
        const form = document.getElementById("add-work-form");
        form.insertAdjacentHTML("beforeend", "<p id='form-error' class='login-error'>Veuillez remplir tous les champs.</p>");
        return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);
    formData.append("title", titleInput.value);
    formData.append("category", categorySelect.value);

    const response = await fetch(`${API_URL}/works`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
        body: formData,
    });

    if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "login.html";
        return;
    }

    if (response.ok) {
        // L'API ne renvoie pas l'objet "category" complet, on le reconstruit
        // à partir de la catégorie sélectionnée dans le formulaire
        const newWork = await response.json();
        newWork.category = {
            id: Number(categorySelect.value),
            name: categorySelect.options[categorySelect.selectedIndex].textContent,
        };

        // Ajout du nouveau travail au tableau partagé, puis réaffichage
        works.push(newWork);
        displayWorks(works);
        displayFilters(categories, works);
        displayModalGallery(works);

        resetAddWorkForm();
        document.body.classList.remove("modal-open");
    }
}

// Gestion de la modale
function initModal(works, categories) {
    const overlay = document.getElementById("modal-overlay");
    const editBtn = document.getElementById("edit-btn");
    const closeButtons = document.querySelectorAll(".modal-close");
    const addBtn = document.getElementById("modal-add-btn");
    const backBtn = document.getElementById("modal-back");
    const modalGallery = document.getElementById("modal-gallery");
    const modalForm = document.getElementById("modal-form");
    const addWorkForm = document.getElementById("add-work-form");
    const titleInput = document.getElementById("work-title");
    const categorySelect = document.getElementById("work-category");

    // Ouvrir la modale
    editBtn.addEventListener("click", () => {
        document.body.classList.add("modal-open");
    });

    // Fermer avec la croix
    closeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            document.body.classList.remove("modal-open");
            resetAddWorkForm();
        });
    });

    // Fermer en cliquant sur l'overlay
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
            document.body.classList.remove("modal-open");
            resetAddWorkForm();
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

    // Preview image et soumission du formulaire
    initImagePreview();
    addWorkForm.addEventListener("submit", (e) => {
        addWork(e, works, categories);
    });

    // Mise à jour du style du bouton valider selon la saisie
    titleInput.addEventListener("input", updateValidateButtonState);
    categorySelect.addEventListener("change", updateValidateButtonState);
}

// Initialisation
Promise.all([getWorks(), getCategories()])
    .then(([works, categories]) => {
        displayWorks(works);
        displayFilters(categories, works);

        const isLogged = checkAuth();
        if (isLogged) {
            displayModalGallery(works);
            populateCategorySelect(categories);
            initModal(works, categories);
        }
    })
    // si impossible de récupérer data de l'API on affiche un front au cas où
    .catch((error) => {
        console.error("Erreur lors du chargement des données :", error);
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = "<p class='gallery-error'>Impossible de charger les projets. Veuillez réessayer plus tard.</p>";
    });