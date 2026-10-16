
const extensionsGrid = document.getElementById("extensionsGrid");

let extensions = [];
let currentFilter = "all";
let searchText = "";
let extensionToRemove = null;
let previouslyFocusedElement = null;

const searchInput = document.getElementById("extension-search");
const filterButtons = document.querySelectorAll(".filter-btn");

const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle.querySelector("img");

const removeModal = document.getElementById("removeModal");
const modalMessage = document.getElementById("modal-message");
const cancelRemove = document.getElementById("cancelRemove");
const confirmRemove = document.getElementById("confirmRemove");

// Load extensions
async function loadExtensions() {
    try {
        const savedExtensions = localStorage.getItem("extensions");

        if (savedExtensions !== null) {
            extensions = JSON.parse(savedExtensions);
        } else {
            const response = await fetch("./data.json");

            if (!response.ok) {
                throw new Error("Failed to load extensions");
            }

            extensions = await response.json();
        }

        applyFilter();
    } catch (error) {
        extensionsGrid.innerHTML = `
            <p class="no-results">
                Unable to load extensions. Please refresh the page.
            </p>
        `;

        console.error("Error loading extensions:", error);
    }
}

// Save extensions
function saveExtensions() {
    localStorage.setItem("extensions", JSON.stringify(extensions));
}

// Apply filters and search
function applyFilter() {
    let filteredExtensions = extensions;

    if (currentFilter === "active") {
        filteredExtensions = filteredExtensions.filter(function (extension) {
            return extension.isActive;
        });
    } else if (currentFilter === "inactive") {
        filteredExtensions = filteredExtensions.filter(function (extension) {
            return !extension.isActive;
        });
    }

    if (searchText !== "") {
        filteredExtensions = filteredExtensions.filter(function (extension) {
            return extension.name.toLowerCase().includes(searchText);
        });
    }

    displayExtensions(filteredExtensions);
}

// Display extension cards
function displayExtensions(list) {
    extensionsGrid.innerHTML = "";

    if (list.length === 0) {
        extensionsGrid.innerHTML = `
            <p class="no-results">No extensions found.</p>
        `;
        return;
    }

    list.forEach(function (extension) {
        const card = document.createElement("article");
        card.className = "extension-card";

        card.innerHTML = `
            <div class="extension-info">
                <img src="${extension.logo}" alt="">
                <div>
                    <h2>${extension.name}</h2>
                    <p>${extension.description}</p>
                </div>
            </div>

            <div class="extension-actions">
                <button type="button" class="remove-btn">Remove</button>

                <label>
                    <input
                        type="checkbox"
                        class="extension-toggle"
                        ${extension.isActive ? "checked" : ""}
                    >
                    <span>${extension.isActive ? "Active" : "Inactive"}</span>
                </label>
            </div>
        `;

        // Toggle active/inactive
        const toggle = card.querySelector(".extension-toggle");
        const status = toggle.nextElementSibling;

        toggle.addEventListener("change", function () {
            extension.isActive = toggle.checked;
            saveExtensions();
            applyFilter();
        });

        // Remove button
        const removeButton = card.querySelector(".remove-btn");

        removeButton.addEventListener("click", function () {
            openRemoveModal(extension);
        });

        extensionsGrid.appendChild(card);
    });
}

// Filter buttons
filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
        filterButtons.forEach(function (btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");
        currentFilter = button.textContent.trim().toLowerCase();

        applyFilter();
    });
});

// Search
searchInput.addEventListener("input", function () {
    searchText = searchInput.value.trim().toLowerCase();
    applyFilter();
});

// Theme
function setTheme(isDark) {
    document.body.classList.toggle("dark-theme", isDark);

    themeIcon.src = isDark
        ? "./assets/images/icon-sun.svg"
        : "./assets/images/icon-moon.svg";

    themeIcon.alt = isDark
        ? "Switch to light theme"
        : "Switch to dark theme";

    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
    );
}

const savedTheme = localStorage.getItem("theme");
setTheme(savedTheme === "dark");

themeToggle.addEventListener("click", function () {
    const isDark = !document.body.classList.contains("dark-theme");

    setTheme(isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Open confirmation modal
function openRemoveModal(extension) {
    extensionToRemove = extension;
    previouslyFocusedElement = document.activeElement;

    modalMessage.textContent =
        `Are you sure you want to remove ${extension.name}?`;

    removeModal.classList.add("show");
    confirmRemove.focus();
}

// Close confirmation modal
function closeRemoveModal() {
    removeModal.classList.remove("show");
    extensionToRemove = null;

    if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
        previouslyFocusedElement = null;
    }
}

// Cancel removal
cancelRemove.addEventListener("click", closeRemoveModal);

// Close when clicking outside the modal
removeModal.addEventListener("click", function (event) {
    if (event.target === removeModal) {
        closeRemoveModal();
    }
});

// Confirm removal
confirmRemove.addEventListener("click", function () {
    if (extensionToRemove === null) return;

    extensions = extensions.filter(function (item) {
        return item !== extensionToRemove;
    });

    saveExtensions();
    closeRemoveModal();
    applyFilter();
});

// Close modal with Escape
document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        removeModal.classList.contains("show")
    ) {
        closeRemoveModal();
    }
});

// Start app
loadExtensions();

