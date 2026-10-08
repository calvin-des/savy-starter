(() => {
    "use strict";

    const { questions, reactionNames, loadJourney, saveJourney, isCurrentPage, navigateJourney, isEditing } = window.SavvyJourney;

    // Leave static markup and navigation untouched inside Pinegrow.
    if (isEditing()) return;

    const reactionBar = document.getElementById("stat-reactions");
    const reactionButtons = Array.from(reactionBar.querySelectorAll(".reaction-button"));
    const burstLayer = document.getElementById("reaction-burst");
    let state;
    let reacting = false;

    function renderReveal() {
        state = loadJourney();
        if (!isCurrentPage(state, "reveal")) return;
        reacting = false;
        const question = questions[state.currentQuestion];
        const response = state.responses[state.currentQuestion];
        const icon = document.getElementById("stat-focus-icon");
        const stats = question.stats || [{
            value: "Stat coming soon",
            copy: "The statistic for " + question.topic.toLowerCase() + " will appear here."
        }];
        const fragment = document.createDocumentFragment();

        document.getElementById("selected-answer").textContent = question.options[response.answer];
        document.getElementById("reveal-intro").textContent = question.intro
            || "A closer look at the bigger picture on " + question.topic.toLowerCase() + ".";
        icon.src = question.icon;
        icon.alt = question.topic;

        stats.forEach((stat) => {
            const block = document.createElement("article");
            const value = document.createElement("h2");
            const copy = document.createElement("p");

            block.className = question.stats ? "stat-block" : "stat-block stat-placeholder";
            value.className = "stat-value";
            value.textContent = stat.value;
            copy.className = "stat-copy";
            copy.textContent = stat.copy;
            block.append(value, copy);
            fragment.append(block);
        });

        document.getElementById("stat-content").replaceChildren(fragment);
        reactionButtons.forEach((button) => {
            button.disabled = false;
            button.classList.remove("is-selected");
            button.setAttribute("aria-pressed", "false");
        });
    }

    /* Varied-size emoji particles rise beyond the viewport before navigation. */
    function createReactionBurst(button) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches
            || typeof Element.prototype.animate !== "function") return Promise.resolve();

        const bounds = button.getBoundingClientRect();
        const emoji = button.querySelector(".reaction-emoji img");
if (!emoji) return Promise.resolve();
        const animations = [];

        for (let index = 0; index < 14; index += 1) {
            const particle = document.createElement("span");
            const size = 18 + (index % 5) * 5 + Math.random() * 3;
            const startX = bounds.x + bounds.width / 2 - size / 2;
            const startY = bounds.y + bounds.height / 2 - size / 2;
            const spread = (Math.random() - .5) * 180;
            const endX = Math.max(0, Math.min(window.innerWidth - size, startX + spread));
            const rotation = (Math.random() - .5) * 60;

            particle.className = "reaction-particle";
            particle.append(emoji.cloneNode(true));
            particle.style.fontSize = size + "px";
            burstLayer.append(particle);

            const animation = particle.animate([
                { transform: `translate(${startX}px, ${startY}px) scale(.35)`, opacity: 0, offset: 0 },
                { transform: `translate(${startX + spread * .35}px, ${startY - 70}px) scale(1)`, opacity: 1, offset: .18 },
                { transform: `translate(${endX}px, ${startY * .4}px) rotate(${rotation / 2}deg)`, opacity: 1, offset: .65 },
                { transform: `translate(${endX}px, ${-size - 24}px) rotate(${rotation}deg) scale(.8)`, opacity: 0, offset: 1 }
            ], {
                duration: 1100 + (index % 4) * 100 + Math.random() * 180,
                delay: Math.random() * 100,
                easing: "ease-out",
                fill: "forwards"
            });
            animations.push(animation.finished.then(() => particle.remove(), () => particle.remove()));
        }

        return Promise.all(animations);
    }

    reactionBar.addEventListener("click", async (event) => {
        const button = event.target.closest(".reaction-button");
        if (isEditing() || !button || button.disabled || reacting || !reactionNames.includes(button.dataset.reaction)) return;
        const currentQuestion = state.currentQuestion + 1;
        const nextState = {
            ...state,
            currentQuestion,
            phase: currentQuestion === questions.length ? "complete" : "question",
            responses: state.responses.map((response, index) =>
                index === state.currentQuestion ? { ...response, reaction: button.dataset.reaction } : response
            )
        };

        if (!saveJourney(nextState)) return;
        reacting = true;
        reactionButtons.forEach((reaction) => { reaction.disabled = true; });
        button.classList.add("is-selected");
        button.setAttribute("aria-pressed", "true");

        try {
            await createReactionBurst(button);
        } finally {
            burstLayer.replaceChildren();
            navigateJourney(nextState);
        }
    });

    window.addEventListener("pageshow", (event) => {
        if (event.persisted) renderReveal();
    });

    renderReveal();
})();
