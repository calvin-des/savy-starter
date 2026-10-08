(() => {
    "use strict";

    /* Copy: Old_Mutual_Savvy_Starters_Pages_6-14.md, source PDF pages 6-12.
       Question order follows the homepage and progress icons. */
    const questions = [
        {
            topic: "Income loss",
            icon: "assets/icons/income-loss-icon.svg",
            headerImage: "assets/images/question-headers-imgs/q1-income-loss-runway.webp",
            headerPosition: "50% 42%",
            prompt: "If your income stopped tomorrow, how long could you comfortably cover your essential expenses?",
            options: [
                "Six months or more",
                "Three to under six months",
                "One to under three months",
                "Less than one month or I am not sure"
            ],
            intro: "Here's what working South Africans told us in the 2026 Old Mutual Savings & Investment Monitor.",
            stats: [
                {
                    value: "1 in 2",
                    copy: "working South Africans say their money would last three months or less if they lost their income."
                },
                {
                    value: "53%",
                    copy: "are constantly worried about losing their income."
                }
            ]
        },
        {
            topic: "Extra income",
            icon: "assets/icons/extra-income-icons.svg",
            headerImage: "assets/images/question-headers-imgs/q2-poly-jobbers.webp",
            prompt: "Extra income lands from a side hustle, freelance job or bonus. What do you do first?",
            options: [
                "Give it a job: emergency savings, debt or a future goal",
                "Save a set portion and use the rest",
                "Use it to cover regular monthly expenses",
                "Treat it as extra spending money"
            ],
            stats: [
                {
                    value: "61%",
                    copy: "of working South Africans earn additional income through side hustles, freelancing or after-hours work."
                },
                {
                    value: "6 in 10",
                    copy: "Poly-Jobbers say their side-hustle income grew in the last year."
                }
            ]
        },
        {
            topic: "Consistent saving",
            icon: "assets/icons/consistent-saving-icon.svg",
            headerImage: "assets/images/question-headers-imgs/q3-saving.webp",
            prompt: "How does saving usually happen in a normal month?",
            options: [
                "An automatic transfer goes out just after payday",
                "I manually save a set amount most months",
                "I save whatever is left at the end of the month",
                "I am not saving at the moment"
            ],
            stats: [
                {
                    value: "Only 44%",
                    copy: "strongly agree that they save consistently as part of their financial plan."
                },
                {
                    value: "22%",
                    copy: "Savings account for 22% of reported household spending."
                }
            ]
        },
        {
            topic: "Unexpected expenses",
            icon: "assets/icons/unexpected-expense-icon.svg",
            headerImage: "assets/images/question-headers-imgs/q4-unexpected-expense.webp",
            prompt: "An unexpected expense lands in a tight month. What do you do first?",
            options: [
                "Review my budget and cut non-essential spending",
                "Use emergency savings and make a plan to rebuild them",
                "Use credit, an overdraft or borrow money",
                "Move money around or delay a debit order"
            ],
            stats: [
                {
                    value: "62%",
                    copy: "When money is tight, 62% cut spending, 42% use savings and 22% borrow."
                },
                {
                    value: "46%",
                    copy: "say they move money around to delay or avoid debit orders."
                }
            ]
        },
        {
            topic: "Retirement",
            icon: "assets/icons/retirement-icon.svg",
            headerImage: "assets/images/question-headers-imgs/q5-retirement.webp",
            prompt: "Which best describes your retirement plan?",
            options: [
                "I know my target, contribute regularly and review it",
                "I contribute, but I have not calculated how much I will need",
                "I plan to start when I earn more",
                "I have not thought about it yet"
            ],
            stats: [
                {
                    value: "43%",
                    copy: "are not confident they have enough retirement savings; only 30% are very confident."
                },
                {
                    value: "46%",
                    copy: "Among people saving for retirement, 46% say they are on track or have nearly achieved their goal."
                }
            ]
        },
        {
            topic: "Managing debt",
            icon: "assets/icons/debt-management.svg",
            headerImage: "assets/images/question-headers-imgs/q6-debt-management.webp",
            prompt: "Your debt payments are becoming difficult to manage. What is your first move?",
            options: [
                "Contact my creditors early and agree on a repayment plan",
                "Speak to a registered debt counsellor and build a formal plan",
                "Take a consolidation loan immediately without comparing the total cost",
                "Miss the payments and deal with them later"
            ],
            stats: [
                {
                    value: "38%",
                    copy: "approached a creditor to change repayments; 14% applied for debt review or counselling."
                },
                {
                    value: "50%",
                    copy: "often or always worry about debt."
                }
            ]
        },
        {
            topic: "Online tools",
            icon: "assets/icons/online-tools-icon.svg",
            headerImage: "assets/images/question-headers-imgs/q7-online-tools.webp",
            prompt: "An online tool or AI gives you financial guidance. What do you do next?",
            options: [
                "Check it against an official source or qualified adviser",
                "Use it to explore options, then verify the important figures and fees",
                "Act on the first answer that sounds convincing",
                "I prefer guidance from a qualified person or trusted source"
            ],
            stats: [
                {
                    value: "48%",
                    copy: "use general AI chatbots for financial planning; 38% use personal-finance chatbots."
                },
                {
                    value: "27%",
                    copy: "use none of these online planning tools."
                }
            ]
        }
    ];

    /* State is kept in this tab. There is no score calculation here. */
    const storageKey = "savvy-starters-journey";
    // Reset stored answers when questions or answer order changes.
    const journeyVersion = 3;
    const reactionNames = ["surprised", "concerned", "thoughtful", "prepared"];

    function newJourney() {
        return {
            version: journeyVersion,
            currentQuestion: 0,
            phase: "question",
            responses: questions.map(() => ({ answer: null, reaction: null }))
        };
    }

    function isValidJourney(state) {
        if (!state || state.version !== journeyVersion || !Number.isInteger(state.currentQuestion)) return false;
        if (state.currentQuestion < 0 || state.currentQuestion > questions.length) return false;
        if (!["question", "reveal", "complete"].includes(state.phase)) return false;
        if (!Array.isArray(state.responses) || state.responses.length !== questions.length) return false;
        if ((state.currentQuestion === questions.length) !== (state.phase === "complete")) return false;

        return state.responses.every((response, index) => {
            if (!response || typeof response !== "object") return false;
            const answered = Number.isInteger(response.answer)
                && response.answer >= 0 && response.answer < questions[index].options.length;
            const reacted = reactionNames.includes(response.reaction);

            if (index < state.currentQuestion) return answered && reacted;
            if (index === state.currentQuestion && state.phase === "reveal") {
                return answered && response.reaction === null;
            }
            return response.answer === null && response.reaction === null;
        });
    }

    function loadJourney() {
        try {
            const state = JSON.parse(sessionStorage.getItem(storageKey));
            return isValidJourney(state) ? state : newJourney();
        } catch {
            return newJourney();
        }
    }

    function saveJourney(state) {
        try {
            sessionStorage.setItem(storageKey, JSON.stringify(state));
            return true;
        } catch {
            const message = document.getElementById("journey-error");
            message.textContent = "Your progress could not be saved. Please allow site storage and try again.";
            message.hidden = false;
            return false;
        }
    }

    function nextPage(state) {
        if (state.phase === "complete") return "results.html";
        return state.phase === "reveal" ? "stat-reveal.html" : "questions.html";
    }

    /* Replace the current entry so the journey does not create back/revisit steps. */
    function navigateJourney(state) {
        if (isEditing()) return;
        window.location.replace(nextPage(state));
    }

    function isCurrentPage(state, phase) {
        if (isEditing()) return false;
        if (state.phase === phase) return true;
        navigateJourney(state);
        return false;
    }

    /* Pinegrow marks editable DOM nodes and adds pgedit to editor URLs. */
    function isEditing() {
        return new URLSearchParams(window.location.search).has("pgedit")
            || document.documentElement.hasAttribute("data-pg-id")
            || document.body?.hasAttribute("data-pg-id");
    }

    /* Classic scripts also load in local-file and builder previews. */
    window.SavvyJourney = {
        questions, storageKey, reactionNames, loadJourney, saveJourney,
        nextPage, navigateJourney, isCurrentPage, isEditing
    };
})();
