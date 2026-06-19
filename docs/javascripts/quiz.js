(function () {
    function initQuizzes() {
        const apps = document.querySelectorAll(".quiz-app");

        apps.forEach((app) => {
            if (!app.id) app.id = `quiz-app-${Math.random().toString(36).slice(2)}`;

            const state = {
                questions: [],
                currentIdx: 0,
                selectedAnswers: {},
                submitted: false,
                timerInterval: null,
                secondsElapsed: 0,
                estimatedSeconds: 0,
            };

            app.innerHTML = `
                <div class="quiz-config-bar">
                    <div class="quiz-config-grid">
                        <div class="quiz-field">
                            <label for="${app.id}-limit">Questions</label>
                            <select id="${app.id}-limit">
                                <option value="10">10</option>
                                <option value="25" selected>25</option>
                                <option value="50">50</option>
                                <option value="999">All</option>
                            </select>
                        </div>
                        <div class="quiz-field">
                            <label for="${app.id}-time">Estimated Time</label>
                            <select id="${app.id}-time">
                                <option value="30">30 Mins</option>
                                <option value="60" selected>60 Mins</option>
                                <option value="90">90 Mins</option>
                                <option value="120">120 Mins</option>
                            </select>
                        </div>
                        <button class="quiz-start-button" type="button">Start Quiz</button>
                    </div>
                </div>

                <div class="quiz-results-banner" hidden>
                    <div class="quiz-stats">
                        <div><small>Correct</small><strong class="stat-correct">0</strong></div>
                        <div><small>Wrong</small><strong class="stat-wrong">0</strong></div>
                        <div><small>Unattempted</small><strong class="stat-skipped">0</strong></div>
                        <div class="quiz-score-box"><small>NISM Weighted Score</small><strong class="stat-score">0.00 / 0.00</strong></div>
                    </div>
                    <div class="time-taken-display"></div>
                </div>

                <div class="quiz-stage" hidden>
                    <div class="quiz-wrapper"></div>
                </div>
            `;

            const els = {
                config: app.querySelector(".quiz-config-bar"),
                limit: app.querySelector(`#${app.id}-limit`),
                time: app.querySelector(`#${app.id}-time`),
                start: app.querySelector(".quiz-start-button"),
                results: app.querySelector(".quiz-results-banner"),
                stage: app.querySelector(".quiz-stage"),
                wrapper: app.querySelector(".quiz-wrapper"),
                correct: app.querySelector(".stat-correct"),
                wrong: app.querySelector(".stat-wrong"),
                skipped: app.querySelector(".stat-skipped"),
                score: app.querySelector(".stat-score"),
                timeTaken: app.querySelector(".time-taken-display"),
            };

            function formatTime(sec) {
                const hrs = Math.floor(sec / 3600).toString().padStart(2, "0");
                const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
                const secs = (sec % 60).toString().padStart(2, "0");
                return `${hrs}:${mins}:${secs}`;
            }

            function startTimer() {
                state.secondsElapsed = 0;
                clearInterval(state.timerInterval);
                state.timerInterval = setInterval(() => {
                    state.secondsElapsed++;
                    updateTimer();
                }, 1000);
            }

            function updateTimer() {
                const timer = app.querySelector(".timer-line");
                if (timer) timer.innerText = "Timer: " + formatTime(state.secondsElapsed);
            }

            function shuffleQuestions(data) {
                return [...data].sort(() => 0.5 - Math.random());
            }

            async function startQuiz() {
                const jsonUrl = app.dataset.quizSrc;
                const limit = parseInt(els.limit.value, 10);
                state.estimatedSeconds = parseInt(els.time.value, 10) * 60;
                state.currentIdx = 0;
                state.submitted = false;
                state.selectedAnswers = {};
                els.results.hidden = true;

                try {
                    const res = await fetch(jsonUrl);
                    if (!res.ok) throw new Error("Quiz data request failed.");
                    const data = await res.json();
                    state.questions = shuffleQuestions(data).slice(0, limit);

                    if (!state.questions.length) throw new Error("Quiz data is empty.");

                    els.config.hidden = true;
                    els.stage.hidden = false;
                    showQuestion(0);
                    startTimer();
                    updateTimer();
                } catch (err) {
                    els.wrapper.innerHTML = `<div class="quiz-empty-state quiz-error">Failed to load quiz data. Please check the file path.</div>`;
                    els.stage.hidden = false;
                }
            }

            function showQuestion(index) {
                const item = state.questions[index];
                const options = item.options.map((option, optIdx) => {
                    const isChecked = state.selectedAnswers[index] === optIdx ? "checked" : "";
                    const optionLabel = String.fromCharCode(65 + optIdx);

                    return `
                        <label class="quiz-option">
                            <input type="radio" name="${app.id}-q-${index}" value="${optIdx}" ${isChecked}>
                            <span class="quiz-option-label">${optionLabel}</span>
                            <span>${option}</span>
                        </label>
                    `;
                }).join("");

                els.wrapper.innerHTML = `
                    <div class="q-card">
                        <div class="quiz-meta-row">
                            <span>Question ${index + 1} of ${state.questions.length}</span>
                            <span>${item.chapterName || "Chapter"}</span>
                            <span>${item.topic || "General"}${item.difficultyLevel ? " / " + item.difficultyLevel : ""}</span>
                        </div>
                        <div class="quiz-question-row">${item.question}</div>
                        <div class="options-container">${options}</div>
                        <div class="quiz-control-row">
                            <button class="btn-prev" type="button" ${index === 0 ? "disabled" : ""}>Prev</button>
                            <button class="btn-next" type="button" ${index === state.questions.length - 1 ? "disabled" : ""}>Next</button>
                            <button class="quiz-submit-button" type="button">Submit</button>
                            <span class="timer-line">Timer: ${formatTime(state.secondsElapsed)}</span>
                        </div>
                    </div>
                `;

                els.wrapper.querySelectorAll("input[type='radio']").forEach((input) => {
                    input.addEventListener("click", () => {
                        state.selectedAnswers[index] = parseInt(input.value, 10);
                    });
                });

                els.wrapper.querySelector(".btn-prev").addEventListener("click", () => changeQuestion(-1));
                els.wrapper.querySelector(".btn-next").addEventListener("click", () => changeQuestion(1));
                els.wrapper.querySelector(".quiz-submit-button").addEventListener("click", submitQuiz);
            }

            function changeQuestion(step) {
                const nextIndex = state.currentIdx + step;
                if (nextIndex < 0 || nextIndex >= state.questions.length) return;
                state.currentIdx = nextIndex;
                showQuestion(state.currentIdx);
                updateTimer();
            }

            function submitQuiz() {
                state.submitted = true;
                clearInterval(state.timerInterval);

                let correct = 0;
                let wrong = 0;
                let unattempted = 0;

                state.questions.forEach((item, idx) => {
                    if (state.selectedAnswers[idx] === undefined) unattempted++;
                    else if (state.selectedAnswers[idx] === item.correctAnswerIndex) correct++;
                    else wrong++;
                });

                const finalScore = correct - (wrong * 0.25);
                const maxMarks = state.questions.length;

                els.correct.innerText = correct;
                els.wrong.innerText = wrong;
                els.skipped.innerText = unattempted;
                els.score.innerText = `${finalScore.toFixed(2)} / ${maxMarks.toFixed(2)}`;
                els.timeTaken.innerText = `Time Performance: ${formatTime(state.secondsElapsed)} / ${formatTime(state.estimatedSeconds)} (Taken / Estimated)`;
                els.stage.hidden = true;
                els.results.hidden = false;
                window.scrollTo({ top: 0, behavior: "smooth" });
            }

            els.start.addEventListener("click", startQuiz);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initQuizzes);
    } else {
        initQuizzes();
    }
})();
