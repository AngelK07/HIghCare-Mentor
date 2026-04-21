function startQuiz() {
    const subject = document.getElementById("subject").value;
    const num = document.getElementById("num").value;
    const username = document.getElementById("username").value || "Anonymous";

    if (!subject || !num) {
        alert("Select subject and number of questions");
        return;
    }

    // 🔥 Generate or reuse user_id
    let user_id = localStorage.getItem("user_id");

    if (!user_id) {
        user_id = "user_" + Date.now();
        localStorage.setItem("user_id", user_id);
    }

    // save data
    localStorage.setItem("subject", subject);
    localStorage.setItem("num", num);
    localStorage.setItem("username", username);

    window.location.href = "src/pages/test.html";
}