document.addEventListener("DOMContentLoaded", function() {
    const registerForm = document.querySelector("form");
    const loginForm = document.querySelector("#loginForm");

    // Handle Registration
    if (registerForm && !loginForm) {
        registerForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            const username = registerForm.querySelector('input[type="text"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;

            const response = await fetch("http://localhost:3000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();
            alert(data.message);
        });
    }

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener("submit", async function(event) {
            event.preventDefault();

            const username = loginForm.querySelector('#loginUsername').value;
            const password = loginForm.querySelector('#loginPassword').value;

            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", username);
                window.location.href = "managing.html"; // Redirect to management page
            } else {
                alert("Invalid username or password.");
            }
        });
    }
});
