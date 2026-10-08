(() => {
    "use strict";

    const { questions, loadJourney, saveJourney, isCurrentPage, navigateJourney, isEditing } = window.SavvyJourney;

    // Leave static markup and navigation untouched inside Pinegrow.
    if (isEditing()) return;

    const form = document.getElementById("quiz-form");
    const questionTitle = document.getElementById("quiz-question");
    const headerImage = document.getElementById("question-header");
    const answerList = document.getElementById("quiz-answers");
    const progress = document.getElementById("quiz-progress");
    const nextButton = document.getElementById("quiz-next");
    let state;
    let submitting = false;

    function renderProgress() {
        const fragment = document.createDocumentFragment();

        questions.forEach((question, index) => {
            const item = document.createElement("li");
            const step = document.createElement("span");
            const icon = document.createElement("img");
            const tick = document.createElement("img");
            const status = index < state.currentQuestion ? "complete"
                : index === state.currentQuestion ? "current" : "upcoming";

            item.className = "is-" + status;
            step.className = "quiz-step";
            step.setAttribute("role", "img");
            step.setAttribute("aria-label", `Question ${index + 1}: ${question.topic}, ${status}`);
            step.title = question.topic + " (" + status + ")";
            if (status === "current") step.setAttribute("aria-current", "step");

            icon.className = "quiz-step-image";
            icon.src = question.icon;
            icon.alt = "";
            tick.className = "quiz-step-tick";
            tick.src = "assets/icons/completed-tick.svg";
            tick.alt = "";
            step.append(icon, tick);
            item.append(step);
            fragment.append(item);
        });

        progress.replaceChildren(fragment);
        progress.style.gridTemplateColumns = questions.map((_, index) =>
            index === state.currentQuestion ? "minmax(0, 2fr)" : "minmax(0, 1fr)"
        ).join(" ");
    }

    function renderQuestion() {
        state = loadJourney();
        if (!isCurrentPage(state, "question")) return;
        submitting = false;
        const question = questions[state.currentQuestion];
        const fragment = document.createDocumentFragment();

        headerImage.src = question.headerImage;
        headerImage.style.objectPosition = question.headerPosition || "";
        questionTitle.textContent = question.prompt;
        question.options.forEach((copy, index) => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            const text = document.createElement("span");

            label.className = "quiz-answer";
            input.className = "quiz-answer-input";
            input.type = "radio";
            input.name = "answer";
            input.value = String(index);
            input.required = true;
            text.className = "quiz-answer-copy";
            text.textContent = copy;
            label.append(input, text);
            fragment.append(label);
        });

        answerList.replaceChildren(fragment);
        nextButton.disabled = true;
        document.getElementById("quiz-status").textContent = `Question ${state.currentQuestion + 1} of ${questions.length}`;
        renderProgress();
    }

    form.addEventListener("change", () => {
        if (isEditing()) return;
        nextButton.disabled = !form.querySelector("input[name=answer]:checked");
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        if (isEditing() || submitting || !form.reportValidity()) return;
        const answer = Number(new FormData(form).get("answer"));
        const nextState = {
            ...state,
            phase: "reveal",
            responses: state.responses.map((response, index) =>
                index === state.currentQuestion ? { answer, reaction: null } : response
            )
        };

        if (!saveJourney(nextState)) return;
        submitting = true;
        nextButton.disabled = true;
        navigateJourney(nextState);
    });

    window.addEventListener("pageshow", (event) => {
        if (event.persisted) renderQuestion();
    });

    renderQuestion();
})();
