<div id="quiz-config-bar" style="display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap; background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 25px; border: 1px solid #e0e0e0;">
    <div style="flex: 4; min-width: 300px;">
        <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 5px;">Select Chapter:</label>
        <select id="chapter-select" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
            <option value="../data/chapter-01-quiz.json">Chapter 01: Introduction to Research Analyst Profession</option>
            <option value="../data/chapter-02-quiz.json">Chapter 02: Introduction to Securities Market</option>
            <option value="../data/chapter-08-quiz.json">Chapter 08: Company Analysis - Fundamentals</option>
        </select>
    </div>
    <div style="flex: 1; min-width: 100px;">
        <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 5px;">Questions:</label>
        <select id="limit-select" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
            <option value="10">10</option>
            <option value="25" selected>25</option>
            <option value="50">50</option>
            <option value="999">All</option>
        </select>
    </div>
    <div style="flex: 1; min-width: 100px;">
        <label style="display: block; font-size: 0.85em; font-weight: bold; margin-bottom: 5px;">Time:</label>
        <select id="time-select" style="width: 100%; padding: 10px; border-radius: 5px; border: 1px solid #ccc;">
            <option value="30">30 Mins</option>
            <option value="60" selected>60 Mins</option>
            <option value="90">90 Mins</option>
            <option value="120">120 Mins</option>
        </select>
    </div>
    <button onclick="startQuiz()" style="flex: 1.5; min-width: 120px; padding: 11px; background: #0277bd; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Start Exam</button>
</div>

<div id="quiz-results-banner" style="display:none; padding: 20px; background: #fff; border: 2px solid #2196f3; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
    <div style="display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap; gap: 15px;">
        <div><small style="color: #666;">Correct</small><div id="stat-correct" style="font-size: 1.5em; color: #2e7d32; font-weight: bold;">0</div></div>
        <div><small style="color: #666;">Wrong</small><div id="stat-wrong" style="font-size: 1.5em; color: #c62828; font-weight: bold;">0</div></div>
        <div><small style="color: #666;">Unattempted</small><div id="stat-skipped" style="font-size: 1.5em; color: #f9a825; font-weight: bold;">0</div></div>
        <div style="border-left: 1px solid #ddd; padding-left: 20px;">
            <small style="color: #666;">NISM Weighted Score</small>
            <div id="stat-score" style="font-size: 1.5em; color: #0d47a1; font-weight: bold;">0.00 / 0.00</div>
        </div>
    </div>
    <div id="time-taken-display" style="margin-top:15px; text-align:center; font-size: 0.9em; font-weight: bold; color: #555; border-top: 1px solid #eee; padding-top: 10px;"></div>
</div>

<div id="timer-line" style="text-align: right; font-family: monospace; font-size: 1.2em; margin-bottom: 10px; display:none; color: #d32f2f; font-weight: bold;"></div>
<div id="quiz-wrapper">
    <div style="text-align: center; padding: 40px; color: #888; border: 2px dashed #ddd; border-radius: 10px;">
        Configure your exam settings above and click "Start Exam" to begin.
    </div>
</div>

<div id="nav-controls" style="display:none; justify-content: space-between; align-items: center; margin-top: 20px; max-width: 600px; margin-left: auto; margin-right: auto;">
    <button id="btn-prev" onclick="changeQuestion(-1)" style="padding: 12px 25px; background: #607d8b; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">&laquo; Previous</button>
    <div id="question-counter" style="font-weight: bold; font-size: 1.1em;"></div>
    <button id="btn-next" onclick="changeQuestion(1)" style="padding: 12px 25px; background: #607d8b; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Next &raquo;</button>
</div>

<div id="submit-container" style="display:none; text-align: center; margin: 40px 0;">
    <button onclick="submitQuiz()" style="padding: 15px 60px; background: #1b5e20; color: white; border: none; border-radius: 35px; cursor: pointer; font-size: 1.2em; font-weight: bold; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">Submit Final Answers</button>
</div>

<script>
let localQuestions = [];
let currentIdx = 0;
const selectedAnswers = {};
let quizSubmitted = false;
let timerInterval;
let secondsElapsed = 0;
let estimatedSeconds = 0;

function formatTime(sec) {
    const hrs = Math.floor(sec / 3600).toString().padStart(2, '0');
    const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const secs = (sec % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}

function startTimer() {
    secondsElapsed = 0;
    clearInterval(timerInterval);
    const timerLine = document.getElementById('timer-line');
    timerLine.style.display = 'block';
    timerInterval = setInterval(() => {
        secondsElapsed++;
        timerLine.innerText = "Time Elapsed: " + formatTime(secondsElapsed);
    }, 1000);
}

async function startQuiz() {
    const jsonUrl = document.getElementById('chapter-select').value;
    const limit = parseInt(document.getElementById('limit-select').value);
    estimatedSeconds = parseInt(document.getElementById('time-select').value) * 60;

    currentIdx = 0;
    quizSubmitted = false;
    Object.keys(selectedAnswers).forEach(key => delete selectedAnswers[key]);
    document.getElementById('quiz-results-banner').style.display = 'none';

    try {
        const res = await fetch(jsonUrl);
        if(!res.ok) throw new Error();
        const data = await res.json();
        
        // Randomize and Slice
        localQuestions = data.sort(() => 0.5 - Math.random()).slice(0, limit);
        
        document.getElementById('nav-controls').style.display = 'flex';
        document.getElementById('submit-container').style.display = 'block';
        startTimer();
        showQuestion(0);
    } catch (err) {
        alert("Failed to load quiz data. Please check the file path.");
    }
}

function showQuestion(index) {
    const wrapper = document.getElementById('quiz-wrapper');
    const item = localQuestions[index];
    
    let htmlContent = `
    <div class="q-card" style="background: #fff; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <span style="background: #333; color: #fff; padding: 4px 12px; border-radius: 5px; font-size: 0.85em; font-weight: bold;">Q${index + 1}</span>
            <span style="font-size: 0.8em; color: #888; font-weight: bold; text-transform: uppercase;">NISM-RA</span>
        </div>
        
        <p style="font-size: 1.2em; font-weight: 500; line-height: 1.6; margin-bottom: 15px;">${item.question}</p>
        
        <div style="margin-bottom: 20px; padding: 6px 12px; border-left: 4px solid #0277bd; background: #f1f8ff; border-radius: 0 4px 4px 0;">
            <small style="display: block; color: #01579b; font-weight: 700;">Topic: ${item.topic}</small>
        </div>

        <div class="options-container">
            ${item.options.map((option, optIdx) => {
                const isChecked = selectedAnswers[index] === optIdx ? 'checked' : '';
                const isDisabled = quizSubmitted ? 'disabled' : '';
                let bg = "transparent", border = "1px solid #eee";
                
                if (quizSubmitted) {
                    if (optIdx === item.correctAnswerIndex) { 
                        bg = "#e8f5e9"; border = "2px solid #2e7d32"; 
                    } else if (selectedAnswers[index] === optIdx) { 
                        bg = "#ffebee"; border = "2px solid #c62828"; 
                    }
                }

                return `
                <label style="display: block; position: relative; padding: 14px 15px 14px 45px; margin-bottom: 10px; border: ${border}; background: ${bg}; border-radius: 8px; cursor: pointer; transition: 0.2s;">
                    <input type="radio" name="q-${index}" value="${optIdx}" ${isChecked} ${isDisabled}
                           style="position: absolute; left: 15px; top: 18px;" onclick="trackSelection(${index}, ${optIdx})">
                    <span style="font-size: 1em;">${option}</span>
                </label>`;
            }).join('')}
        </div>
        
        ${quizSubmitted ? `
            <div style="margin-top: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 5px solid #607d8b;">
                <strong style="color: #455a64;">Rationale:</strong>
                <div style="margin-top: 8px; line-height: 1.5; color: #333;">${item.rationale}</div>
            </div>` : ''}
    </div>`;
    
    wrapper.innerHTML = htmlContent;
    document.getElementById('question-counter').innerText = `Q ${index + 1} / ${localQuestions.length}`;
    document.getElementById('btn-prev').disabled = (index === 0);
    document.getElementById('btn-next').disabled = (index === localQuestions.length - 1);
}

function trackSelection(qIdx, optIdx) { if(!quizSubmitted) selectedAnswers[qIdx] = optIdx; }

function changeQuestion(step) {
    currentIdx += step;
    showQuestion(currentIdx);
}

function submitQuiz() {
    quizSubmitted = true;
    clearInterval(timerInterval);
    
    let correct = 0, wrong = 0, unattempted = 0;
    localQuestions.forEach((item, idx) => {
        if (selectedAnswers[idx] === undefined) unattempted++;
        else if (selectedAnswers[idx] === item.correctAnswerIndex) correct++;
        else wrong++;
    });

    // NISM Scoring Logic
    const finalScore = (correct * 1) - (wrong * 0.25);
    const maxMarks = localQuestions.length;
    
    document.getElementById('stat-correct').innerText = correct;
    document.getElementById('stat-wrong').innerText = wrong;
    document.getElementById('stat-skipped').innerText = unattempted;
    
    // Weighted Decimal Display (e.g., 2.75 / 10.00)
    document.getElementById('stat-score').innerText = 
        `${finalScore.toFixed(2)} / ${maxMarks.toFixed(2)}`;
    
    document.getElementById('time-taken-display').innerText = 
        `Time Performance: ${formatTime(secondsElapsed)} / ${formatTime(estimatedSeconds)} (Taken / Estimated)`;

    document.getElementById('quiz-results-banner').style.display = 'block';
    document.getElementById('submit-container').style.display = 'none';
    document.getElementById('timer-line').style.display = 'none';
    
    currentIdx = 0;
    showQuestion(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>