const SUPABASE_URL = "https://pheuwlzvzvfkfkpwolfj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_6zoRZgubkkIWUD14GFtQew_lymzm_UP";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let questions = [];
let answers = {};
let current = 0;
let timerInterval;
let timeLeft;

const subject = localStorage.getItem("subject");
const num = parseInt(localStorage.getItem("num"));

function getTime() {
    if (num == 50) return 45 * 60;
    if (num == 100) return 90 * 60;
    if (num == 200) return 180 * 60;
}

async function loadQuestions() {
    const { data, error } = await supabaseClient
        .from("mcq")
        .select("*")
        .eq("Subject", subject)
        .limit(num);

    questions = data.sort(() => Math.random() - 0.5);
    init();
}

function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

function init() {
    timeLeft = getTime();
    startTimer();
    renderQ();
    renderPalette();
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById("timer").innerText = formatTime(timeLeft);

        if (timeLeft <= 0) submitQuiz();
    }, 1000);
}

function formatTime(t) {
    let m = Math.floor(t / 60);
    let s = t % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function renderQ() {
    const q = questions[current];

    document.getElementById("qno").innerText =
        `Question ${current + 1} of ${questions.length}`;

    document.getElementById("question").innerText = q.question;

    let opts = ["A", "B", "C", "D"];
    let html = "";

    opts.forEach(o => {
        const qid = String(q.id);
        let selected = answers[qid] === o ? "selected" : "";
        html += `<div class="option ${selected}" onclick="selectAns('${o}')">
      ${o}. ${q["option_" + o.toLowerCase()]}
    </div>`;
    });

    document.getElementById("options").innerHTML = html;

    document.getElementById("nextBtn").innerText =
        current === questions.length - 1 ? "Submit" : "Next";
}

function updateUI() {
    renderQ();
    renderPalette();
}

function selectAns(opt) {
    const qid = String(questions[current].id);

    answers[qid] = opt;

    updateUI();
}

function nextQ() {
    if (current === questions.length - 1) {
        confirmSubmit();
    } else {
        current++;
        updateUI();
    }
}

function prevQ() {
    if (current > 0) {
        current--;
        updateUI();
    }
}

function renderPalette() {
    let html = "";

    questions.forEach((q, i) => {

        let cls = "";

        // force consistent id type safety
        const qid = String(q.id);

        if (i === current) {
            cls = "current";
        }
        else if (answers[qid] !== undefined) {
            cls = "answered";
        }

        html += `<div class="pbox ${cls}" onclick="jump(${i})">${i + 1}</div>`;
    });

    document.getElementById("palette").innerHTML = html;
}

function jump(i) {
    current = i;
    updateUI();
}

function togglePalette() {
    document.getElementById("palette").classList.toggle("show");
}

function confirmSubmit() {
    if (confirm("Submit quiz?")) submitQuiz();
}

async function submitQuiz() {
    clearInterval(timerInterval);

    let correct = 0, wrong = 0;

    questions.forEach(q => {
        const qid = String(q.id);

        if (!answers[qid]) return;

        if (answers[qid] === q.correct_answer) {
            correct++;
        } else {
            wrong++;
        }
    });

    let score = correct - (wrong * 0.25);
    // 👉 STORE RESULT
    localStorage.setItem("result", JSON.stringify({
        score,
        correct,
        wrong
    }));

    // 👉 REDIRECT
    window.location.href = "result.html";
    sendToSupabase(score, correct, wrong);
    async function sendToSupabase(score, correct, wrong) {
        const user_id = localStorage.getItem("user_id");

        const { error } = await supabaseClient
            .from("Quiz_attempts")
            .insert([{
                user_id,
                Subject: subject,
                no_of_questions: num,
                correct_questions: correct,
                time_taken: getTime() - timeLeft,
                score,
                answers
            }]);

        if (error) {
            console.error("Insert failed:", error);
        } else {
            console.log("Saved successfully");
        }
    }
}

loadQuestions();