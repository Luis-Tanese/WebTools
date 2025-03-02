const elements = {
    input: document.getElementById("search-input"),
    cards: document.querySelectorAll(".tool-card"),
};

const filterTools = (term) => {
    term = term.toLowerCase().trim();

    elements.cards.forEach((card) => {
        const toolName = card.getAttribute("data-name").toLowerCase();
        const toolKeywords = card.getAttribute("data-keywords").toLowerCase();
        const cardTitle = card.querySelector("h3").textContent.toLowerCase();
        const cardDescription = card
            .querySelector("p")
            .textContent.toLowerCase();

        const isSilly =
            toolName.includes(term) ||
            toolKeywords.includes(term) ||
            cardTitle.includes(term) ||
            cardDescription.includes(term);

        if (isSilly || term === "") {
            card.classList.remove("hidden");
        } else {
            card.classList.add("hidden");
        }
    });

    const visibleCards = document.querySelectorAll(".tool-card:not(.hidden)");
    const toolsContainer = document.getElementById("tools-container");

    if (visibleCards.length === 0 && term !== "") {
        let noResults = document.querySelector(".no-results");
        if (!noResults) {
            noResults = document.createElement("div");
            noResults.className = "no-results";
            noResults.textContent = "No tools found matching your search.";
            noResults.style.textAlign = "center";
            noResults.style.width = "100%";
            noResults.style.padding = "30px";
            noResults.style.color = "#c5bdb4";
            toolsContainer.appendChild(noResults);
        }
    } else {
        const noResults = document.querySelector(".no-results");
        if (noResults) {
            noResults.remove();
        }
    }
};

elements.input.addEventListener("input", (e) => {
    filterTools(e.target.value);
});

elements.input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        elements.input.value = "";
        filterTools("");
    }
});

filterTools("");
