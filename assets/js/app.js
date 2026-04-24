const navbar = document.querySelector(".navbar");
const navCollapse = document.querySelector(".navbar-collapse");
const navLinks = document.querySelectorAll(".navbar .nav-link");

const planPrices = {
    monthly: 24,
    yearly: 240
};

const retentionRates = {
    monthly: {
        charity: 0.18,
        prize: 0.62
    },
    yearly: {
        charity: 0.18,
        prize: 0.62
    }
};

const charityCatalog = [
    {
        name: "Junior Greens Access Fund",
        theme: "Youth access",
        event: "Community short-course day in Newcastle",
        description: "Helps young players access lessons, range time, and equipment support in underfunded local programs.",
        gradient: "linear-gradient(135deg, rgba(126, 243, 218, 0.95), rgba(67, 200, 255, 0.75))"
    },
    {
        name: "Open Fairways Mental Health Trust",
        theme: "Mental wellbeing",
        event: "Peer support golf walk fundraiser",
        description: "Funds mental-health outreach and community-safe spaces built around sport, conversation, and recovery.",
        gradient: "linear-gradient(135deg, rgba(255, 143, 112, 0.9), rgba(255, 211, 110, 0.78))"
    },
    {
        name: "Community Golf for All",
        theme: "Accessibility",
        event: "Adaptive golf introduction weekend",
        description: "Supports inclusive coaching, adaptive equipment access, and transport for disabled players and families.",
        gradient: "linear-gradient(135deg, rgba(67, 200, 255, 0.88), rgba(126, 243, 218, 0.68))"
    },
    {
        name: "Women on Course Foundation",
        theme: "Equity in sport",
        event: "Scholarship series for new women golfers",
        description: "Creates scholarship pathways, first-club kits, and coaching support for women entering the game.",
        gradient: "linear-gradient(135deg, rgba(255, 126, 182, 0.92), rgba(255, 211, 110, 0.72))"
    }
];

const drawPool = [
    { name: "Mia Dalton", scores: [17, 22, 29, 31, 38] },
    { name: "Callum Reed", scores: [4, 11, 17, 28, 38] },
    { name: "Priya Nair", scores: [6, 11, 17, 29, 38] },
    { name: "Lucas Hart", scores: [4, 12, 17, 29, 33] },
    { name: "Eva Sloan", scores: [3, 11, 16, 29, 38] },
    { name: "Zara Quinn", scores: [4, 11, 14, 17, 29] },
    { name: "Theo Marsh", scores: [8, 11, 17, 27, 38] },
    { name: "Nina Patel", scores: [4, 11, 17, 29, 38] }
];

const state = {
    plan: "monthly",
    charity: charityCatalog[0].name,
    contribution: 18,
    independentDonation: 12,
    renewalDate: "2026-05-14",
    rollover: 1200,
    publishedDraw: false,
    lastSimulation: null,
    scores: [
        { date: "2026-04-18", value: 29 },
        { date: "2026-04-12", value: 34 },
        { date: "2026-04-05", value: 27 },
        { date: "2026-03-28", value: 26 },
        { date: "2026-03-21", value: 28 }
    ]
};

const subscriptionForm = document.querySelector("#subscriptionForm");
const scoreForm = document.querySelector("#scoreForm");
const scoreList = document.querySelector("#scoreList");
const scoreMessage = document.querySelector("#scoreMessage");
const cancelEditButton = document.querySelector("#cancelEdit");
const editingDateInput = document.querySelector("#editingDate");
const scoreDateInput = document.querySelector("#scoreDate");
const scoreValueInput = document.querySelector("#scoreValue");
const contributionRange = document.querySelector("#contributionRange");
const contributionValue = document.querySelector("#contributionValue");
const charitySelect = document.querySelector("#charitySelect");
const independentDonationInput = document.querySelector("#independentDonation");
const charitySearch = document.querySelector("#charitySearch");
const charityGrid = document.querySelector("#charityGrid");
const adminMessage = document.querySelector("#adminMessage");

const syncNavbarState = () => {
    if (!navbar) {
        return;
    }

    navbar.classList.toggle("is-scrolled", window.scrollY > 12);
};

const formatCurrency = (value) => `£${Number(value).toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
})}`;

const formatCompactCurrency = (value) => `£${Number(value).toLocaleString("en-GB", {
    maximumFractionDigits: 0
})}`;

const formatDate = (isoDate) => {
    const date = new Date(`${isoDate}T00:00:00`);
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
};

const sortScores = () => {
    state.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    state.scores = state.scores.slice(0, 5);
};

const setMessage = (element, text, type = "ok") => {
    element.textContent = text;
    element.classList.toggle("is-error", type === "error");
};

const getAverageScore = () => {
    if (!state.scores.length) {
        return 0;
    }

    const total = state.scores.reduce((sum, score) => sum + score.value, 0);
    return (total / state.scores.length).toFixed(1);
};

const getContributionBreakdown = () => {
    const price = planPrices[state.plan];
    const charityAmount = price * (state.contribution / 100);
    const prizeAmount = price * retentionRates[state.plan].prize;
    return {
        price,
        charityAmount,
        prizeAmount
    };
};

const renderScoreList = () => {
    sortScores();
    if (!state.scores.length) {
        scoreList.innerHTML = `
            <article class="score-item">
                <div class="score-main">
                    <strong>No scores stored yet</strong>
                    <small>Add a dated Stableford result to join the next draw cycle.</small>
                </div>
            </article>
        `;
    } else {
        scoreList.innerHTML = state.scores.map((score) => `
        <article class="score-item">
            <div class="score-main">
                <strong>${score.value} Stableford points</strong>
                <small>${formatDate(score.date)}</small>
            </div>
            <div class="score-actions">
                <button type="button" class="ghost-action" data-action="edit" data-date="${score.date}">Edit</button>
                <button type="button" class="ghost-action" data-action="delete" data-date="${score.date}">Delete</button>
            </div>
        </article>
    `).join("");
    }

    document.querySelector("#scoreCountBadge").textContent = `${state.scores.length} stored`;
    document.querySelector("#drawEntriesLabel").textContent = `${state.scores.length} valid scores entered`;
    document.querySelector("#averageScoreLabel").textContent = getAverageScore();
};

const renderSubscriptionSummary = () => {
    const breakdown = getContributionBreakdown();
    const planLabel = state.plan === "monthly" ? "Monthly Plan" : "Yearly Plan";
    const renewalLabel = state.plan === "monthly" ? "Renews every 30 days" : "Renews annually";
    const donationValue = Number(state.independentDonation || 0);

    document.querySelector("#subscriptionLabel").textContent = planLabel;
    document.querySelector("#accessLabel").textContent = renewalLabel;
    document.querySelector("#chosenCharityLabel").textContent = state.charity;
    document.querySelector("#charityPercentLabel").textContent = `${state.contribution}% from subscription`;
    document.querySelector("#renewalDateLabel").textContent = formatDate(state.renewalDate);
    document.querySelector("#prizeContributionLabel").textContent = formatCurrency(breakdown.prizeAmount);
    document.querySelector("#charityContributionLabel").textContent = formatCurrency(breakdown.charityAmount);
    document.querySelector("#independentDonationLabel").textContent = formatCurrency(donationValue);
    document.querySelector("#contributionValue").textContent = `${state.contribution}%`;

    const activeSubscribers = Number(document.querySelector("#activeSubscribers").value);
    const monthlyRevenue = Number(document.querySelector("#monthlyRevenue").value);
    const charityTotal = monthlyRevenue * 0.212;
    const prizePool = monthlyRevenue * 0.3;

    document.querySelector("#heroSubscribers").textContent = activeSubscribers.toLocaleString("en-GB");
    document.querySelector("#heroCharity").textContent = formatCompactCurrency(charityTotal);
    document.querySelector("#heroPrize").textContent = formatCompactCurrency(prizePool);
    document.querySelector("#reportSubscribers").textContent = activeSubscribers.toLocaleString("en-GB");
    document.querySelector("#reportCharity").textContent = formatCompactCurrency(charityTotal);
    document.querySelector("#reportPrizePool").textContent = formatCompactCurrency(prizePool);
};

const renderCharities = (filter = "") => {
    const term = filter.trim().toLowerCase();
    const filteredCharities = charityCatalog.filter((charity) => {
        const haystack = `${charity.name} ${charity.theme} ${charity.description} ${charity.event}`.toLowerCase();
        return haystack.includes(term);
    });

    charityGrid.innerHTML = filteredCharities.map((charity) => `
        <article class="charity-card" data-name="${charity.name}">
            <div class="charity-visual" style="background:${charity.gradient};"></div>
            <span class="charity-tag">${charity.theme}</span>
            <strong class="mt-3">${charity.name}</strong>
            <p>${charity.description}</p>
            <div class="charity-meta">
                <small>Upcoming event</small>
                <span>${charity.event}</span>
            </div>
        </article>
    `).join("");
};

const buildWeightedNumbers = () => {
    const counts = new Map();

    drawPool.concat([{ name: "Current subscriber", scores: state.scores.map((entry) => entry.value) }]).forEach((entry) => {
        entry.scores.forEach((score) => {
            counts.set(score, (counts.get(score) || 0) + 1);
        });
    });

    const rankedScores = [...counts.entries()]
        .sort((a, b) => b[1] - a[1] || a[0] - b[0])
        .slice(0, 5)
        .map(([score]) => score);

    return rankedScores.sort((a, b) => a - b);
};

const buildRandomNumbers = () => {
    const numbers = new Set();
    while (numbers.size < 5) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }
    return [...numbers].sort((a, b) => a - b);
};

const computeWinners = (numbers) => {
    const pool = drawPool.concat([{ name: "You", scores: state.scores.map((entry) => entry.value) }]);

    return pool.map((entry, index) => {
        const matches = entry.scores.filter((score) => numbers.includes(score)).length;
        let tier = null;
        if (matches >= 5) {
            tier = 5;
        } else if (matches === 4) {
            tier = 4;
        } else if (matches === 3) {
            tier = 3;
        }

        const proofStatus = index % 2 === 0 ? "Pending review" : "Approved";
        const payoutStatus = tier === 4 && index % 2 === 1 ? "Paid" : "Pending";

        return {
            name: entry.name,
            tier,
            matches,
            proofStatus,
            payoutStatus
        };
    }).filter((entry) => entry.tier);
};

const renderWinners = (simulation) => {
    const winnerList = document.querySelector("#winnerList");

    if (!simulation.winners.length) {
        winnerList.innerHTML = `
            <article class="winner-card">
                <div>
                    <strong>No winners reached a prize tier in this run.</strong>
                    <small>The 5-match jackpot rolls into the next month.</small>
                </div>
            </article>
        `;
        return;
    }

    winnerList.innerHTML = simulation.winners.map((winner) => `
        <article class="winner-card">
            <div>
                <strong>${winner.name}</strong>
                <small>${winner.tier}-number match • ${winner.matches} total matches</small>
            </div>
            <div>
                <strong>${winner.proofStatus}</strong>
                <small>Payout: ${winner.payoutStatus}</small>
            </div>
            <div class="winner-actions">
                <button type="button">Approve proof</button>
                <button type="button" class="secondary">Mark paid</button>
            </div>
        </article>
    `).join("");
};

const renderSimulation = (simulation, isPublished = false) => {
    document.querySelector("#drawNumbers").innerHTML = simulation.numbers
        .map((number) => `<span>${String(number).padStart(2, "0")}</span>`)
        .join("");

    document.querySelector("#drawExplanation").textContent = simulation.explanation;
    document.querySelector("#jackpotValue").textContent = formatCompactCurrency(simulation.distribution.five);
    document.querySelector("#fourMatchValue").textContent = formatCompactCurrency(simulation.distribution.four);
    document.querySelector("#threeMatchValue").textContent = formatCompactCurrency(simulation.distribution.three);
    document.querySelector("#fiveWinnerCount").textContent = String(simulation.counts.five);
    document.querySelector("#fourWinnerCount").textContent = String(simulation.counts.four);
    document.querySelector("#threeWinnerCount").textContent = String(simulation.counts.three);
    document.querySelector("#reportRollover").textContent = formatCompactCurrency(simulation.nextRollover);
    document.querySelector("#publishStatus").innerHTML = isPublished
        ? '<i class="ri-checkbox-circle-fill"></i> Published to subscribers'
        : '<i class="ri-flask-line"></i> Simulation ready for review';

    renderWinners(simulation);
};

const runSimulation = () => {
    const drawMode = document.querySelector("#drawMode").value;
    const monthlyRevenue = Number(document.querySelector("#monthlyRevenue").value);
    const basePool = monthlyRevenue * 0.3;
    const numbers = drawMode === "weighted" ? buildWeightedNumbers() : buildRandomNumbers();
    const winners = computeWinners(numbers);
    const counts = {
        five: winners.filter((winner) => winner.tier === 5).length,
        four: winners.filter((winner) => winner.tier === 4).length,
        three: winners.filter((winner) => winner.tier === 3).length
    };

    let fivePool = basePool * 0.4 + state.rollover;
    let nextRollover = state.rollover;

    if (!counts.five) {
        nextRollover = fivePool;
    } else {
        nextRollover = 0;
    }

    const simulation = {
        numbers,
        explanation: drawMode === "weighted"
            ? "Weighted mode selected the most frequent score values across current score histories."
            : "Random mode generated five unique draw numbers between 1 and 45.",
        winners,
        counts,
        distribution: {
            five: counts.five ? fivePool / counts.five : fivePool,
            four: counts.four ? (basePool * 0.35) / counts.four : basePool * 0.35,
            three: counts.three ? (basePool * 0.25) / counts.three : basePool * 0.25
        },
        nextRollover
    };

    state.lastSimulation = simulation;
    state.publishedDraw = false;
    renderSimulation(simulation, false);
    setMessage(adminMessage, "Simulation completed. Review counts and publish when ready.");
};

const renderAll = () => {
    renderScoreList();
    renderSubscriptionSummary();
    renderCharities(charitySearch ? charitySearch.value : "");
};

window.addEventListener("scroll", syncNavbarState);
window.addEventListener("load", syncNavbarState);
syncNavbarState();

if (window.bootstrap) {
    new bootstrap.ScrollSpy(document.body, {
        target: ".navbar",
        offset: 90
    });
}

navLinks.forEach((link) => {
    link.addEventListener("click", () => {
        if (!navCollapse || !navCollapse.classList.contains("show") || !window.bootstrap) {
            return;
        }

        bootstrap.Collapse.getOrCreateInstance(navCollapse).hide();
    });
});

if (window.AOS) {
    AOS.init({
        duration: 800,
        once: true,
        offset: 60
    });
}

subscriptionForm.addEventListener("change", (event) => {
    const planInput = subscriptionForm.querySelector('input[name="plan"]:checked');
    state.plan = planInput ? planInput.value : state.plan;
    state.charity = charitySelect.value;
    state.contribution = Number(contributionRange.value);
    state.independentDonation = Number(independentDonationInput.value || 0);
    renderSubscriptionSummary();
});

contributionRange.addEventListener("input", () => {
    state.contribution = Number(contributionRange.value);
    renderSubscriptionSummary();
});

charitySelect.addEventListener("change", () => {
    state.charity = charitySelect.value;
    renderSubscriptionSummary();
});

independentDonationInput.addEventListener("input", () => {
    state.independentDonation = Number(independentDonationInput.value || 0);
    renderSubscriptionSummary();
});

scoreForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const scoreDate = scoreDateInput.value;
    const scoreValue = Number(scoreValueInput.value);
    const editingDate = editingDateInput.value;

    if (!scoreDate) {
        setMessage(scoreMessage, "Choose a score date before saving.", "error");
        return;
    }

    if (!Number.isInteger(scoreValue) || scoreValue < 1 || scoreValue > 45) {
        setMessage(scoreMessage, "Stableford scores must be whole numbers between 1 and 45.", "error");
        return;
    }

    const duplicate = state.scores.find((entry) => entry.date === scoreDate && entry.date !== editingDate);
    if (duplicate) {
        setMessage(scoreMessage, "Only one score entry is allowed per date. Edit or delete the existing score instead.", "error");
        return;
    }

    if (editingDate) {
        state.scores = state.scores.map((entry) => (
            entry.date === editingDate ? { date: editingDate, value: scoreValue } : entry
        ));
        setMessage(scoreMessage, `Score for ${formatDate(editingDate)} updated.`);
    } else {
        const previousCount = state.scores.length;
        state.scores.push({ date: scoreDate, value: scoreValue });
        sortScores();
        setMessage(scoreMessage, previousCount >= 5
            ? "New score saved. The oldest score was removed to keep only the latest five."
            : "New score saved and included in the next draw."
        );
    }

    editingDateInput.value = "";
    scoreDateInput.disabled = false;
    scoreForm.reset();
    contributionRange.value = state.contribution;
    charitySelect.value = state.charity;
    independentDonationInput.value = state.independentDonation;
    cancelEditButton.classList.add("hidden");
    renderAll();
});

cancelEditButton.addEventListener("click", () => {
    editingDateInput.value = "";
    scoreDateInput.disabled = false;
    scoreForm.reset();
    contributionRange.value = state.contribution;
    charitySelect.value = state.charity;
    independentDonationInput.value = state.independentDonation;
    cancelEditButton.classList.add("hidden");
    setMessage(scoreMessage, "Edit cancelled.");
});

scoreList.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) {
        return;
    }

    const { action, date } = trigger.dataset;
    const score = state.scores.find((entry) => entry.date === date);

    if (!score) {
        return;
    }

    if (action === "delete") {
        state.scores = state.scores.filter((entry) => entry.date !== date);
        renderAll();
        setMessage(scoreMessage, `Score for ${formatDate(date)} deleted.`);
        return;
    }

    editingDateInput.value = score.date;
    scoreDateInput.value = score.date;
    scoreValueInput.value = score.value;
    scoreDateInput.disabled = true;
    cancelEditButton.classList.remove("hidden");
    setMessage(scoreMessage, `Editing score for ${formatDate(date)}. Date changes are locked per PRD rules.`);
});

document.querySelector("#simulateDraw").addEventListener("click", () => {
    runSimulation();
});

document.querySelector("#publishDraw").addEventListener("click", () => {
    if (!state.lastSimulation) {
        setMessage(adminMessage, "Run a simulation before publishing results.", "error");
        return;
    }

    state.rollover = state.lastSimulation.nextRollover;
    state.publishedDraw = true;
    renderSimulation(state.lastSimulation, true);
    setMessage(adminMessage, "Results published. Winner verification and payout review can proceed.");
});

document.querySelector("#activeSubscribers").addEventListener("input", renderSubscriptionSummary);
document.querySelector("#monthlyRevenue").addEventListener("input", renderSubscriptionSummary);

charitySearch.addEventListener("input", (event) => {
    renderCharities(event.target.value);
});

renderAll();
const defaultNumbers = [4, 11, 17, 29, 38];
const defaultWinners = computeWinners(defaultNumbers);

renderSimulation({
    numbers: defaultNumbers,
    explanation: "Default preview shown before the first admin run.",
    winners: defaultWinners,
    counts: {
        five: defaultWinners.filter((winner) => winner.tier === 5).length,
        four: defaultWinners.filter((winner) => winner.tier === 4).length,
        three: defaultWinners.filter((winner) => winner.tier === 3).length
    },
    distribution: {
        five: 5242,
        four: 3536,
        three: 2526
    },
    nextRollover: 1200
}, false);
