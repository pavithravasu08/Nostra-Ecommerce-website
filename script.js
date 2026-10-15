// Nostra website interactions: mobile navigation, collection search/filters, and forms.
document.addEventListener("DOMContentLoaded", () => {
    // Mobile navigation
    const menuToggle = document.querySelector(".menu-toggle");
    const mainNav = document.querySelector(".main-nav");
    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("open");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.textContent = isOpen ? "×" : "☰";
        });
    }

    // Collections search + filters
    const productGrid = document.getElementById("product-grid");
    if (productGrid) {
        const cards = Array.from(productGrid.querySelectorAll(".product-card"));
        const searchInput = document.getElementById("product-search");
        const categoryInputs = Array.from(document.querySelectorAll('input[name="category"]'));
        const priceInputs = Array.from(document.querySelectorAll('input[name="price"]'));
        const sortSelect = document.getElementById("sort-select");
        const resultsCount = document.getElementById("results-count");
        const emptyState = document.getElementById("empty-state");
        const clearButton = document.getElementById("clear-filters");
        const emptyClearButton = document.getElementById("empty-clear");

        // Allow category links from the home page, e.g. collections.html?category=Women
        const requestedCategory = new URLSearchParams(window.location.search).get("category");
        if (requestedCategory && categoryInputs.some(input => input.value === requestedCategory)) {
            categoryInputs.forEach(input => { input.checked = input.value === requestedCategory; });
        }

        function applyFilters() {
            const query = (searchInput?.value || "").trim().toLowerCase();
            const selectedCategories = categoryInputs.filter(input => input.checked).map(input => input.value);
            const selectedPrice = priceInputs.find(input => input.checked)?.value || "all";
            const sortMode = sortSelect?.value || "featured";

            let visibleCards = cards.filter(card => {
                const name = (card.dataset.name || "").toLowerCase();
                const category = card.dataset.category || "";
                const price = Number(card.dataset.price || 0);
                const matchesSearch = name.includes(query) || category.toLowerCase().includes(query) ||
                    (card.querySelector(".product-category")?.textContent || "").toLowerCase().includes(query);
                const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(category);
                let matchesPrice = true;
                if (selectedPrice === "under1000") matchesPrice = price < 1000;
                if (selectedPrice === "1000-2000") matchesPrice = price >= 1000 && price <= 2000;
                if (selectedPrice === "over2000") matchesPrice = price > 2000;
                return matchesSearch && matchesCategory && matchesPrice;
            });

            if (sortMode === "low-high") visibleCards.sort((a, b) => Number(a.dataset.price) - Number(b.dataset.price));
            if (sortMode === "high-low") visibleCards.sort((a, b) => Number(b.dataset.price) - Number(a.dataset.price));
            if (sortMode === "name") visibleCards.sort((a, b) => a.dataset.name.localeCompare(b.dataset.name));

            // Re-append cards in the selected order, then hide non-matches.
            visibleCards.forEach(card => { card.hidden = false; productGrid.appendChild(card); });
            cards.filter(card => !visibleCards.includes(card)).forEach(card => { card.hidden = true; });
            if (resultsCount) resultsCount.textContent = `Showing ${visibleCards.length} of ${cards.length} products`;
            if (emptyState) emptyState.hidden = visibleCards.length !== 0;
            productGrid.hidden = visibleCards.length === 0;
        }

        function clearFilters() {
            if (searchInput) searchInput.value = "";
            categoryInputs.forEach(input => { input.checked = false; });
            priceInputs.forEach(input => { input.checked = input.value === "all"; });
            if (sortSelect) sortSelect.value = "featured";
            applyFilters();
        }

        searchInput?.addEventListener("input", applyFilters);
        categoryInputs.forEach(input => input.addEventListener("change", applyFilters));
        priceInputs.forEach(input => input.addEventListener("change", applyFilters));
        sortSelect?.addEventListener("change", applyFilters);
        clearButton?.addEventListener("click", clearFilters);
        emptyClearButton?.addEventListener("click", clearFilters);
        applyFilters();
    }

    // Contact form: client-side validation and demo success feedback.
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        const fields = {
            name: document.getElementById("contact-name"),
            email: document.getElementById("contact-email"),
            subject: document.getElementById("contact-subject"),
            message: document.getElementById("contact-message")
        };
        const errors = {
            name: document.getElementById("name-error"),
            email: document.getElementById("email-error"),
            subject: document.getElementById("subject-error"),
            message: document.getElementById("message-error")
        };
        const feedback = document.getElementById("form-feedback");
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        function validateField(key) {
            const value = fields[key].value.trim();
            let message = "";
            if (!value) message = "This field is required.";
            else if (key === "email" && !emailPattern.test(value)) message = "Enter a valid email address.";
            else if (key === "message" && value.length < 10) message = "Please enter at least 10 characters.";
            errors[key].textContent = message;
            fields[key].classList.toggle("invalid", Boolean(message));
            return !message;
        }

        Object.keys(fields).forEach(key => {
            fields[key].addEventListener("input", () => validateField(key));
            fields[key].addEventListener("change", () => validateField(key));
        });

        contactForm.addEventListener("submit", event => {
            event.preventDefault();
            const valid = Object.keys(fields).map(validateField).every(Boolean);
            if (!valid) {
                feedback.textContent = "Please check the highlighted fields and try again.";
                feedback.classList.add("error");
                return;
            }
            feedback.textContent = "Thanks! Your message passed validation. This demo does not send it to a server.";
            feedback.classList.remove("error");
            contactForm.reset();
            Object.keys(errors).forEach(key => { errors[key].textContent = ""; fields[key].classList.remove("invalid"); });
        });
    }

    // Newsletter demo form
    const newsletterForm = document.querySelector(".newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", event => {
            event.preventDefault();
            const input = newsletterForm.querySelector("input[type='email']");
            const message = newsletterForm.querySelector(".newsletter-message");
            if (input && input.checkValidity()) {
                message.textContent = "You're on the list (demo only) — thanks for joining!";
                input.value = "";
            } else {
                input?.reportValidity();
            }
        });
    }
});
