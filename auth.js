// Function to handle registration
document.addEventListener("DOMContentLoaded", function() {
    const registerForm = document.querySelector("form");
    const loginForm = document.querySelector("#loginForm");

    // Handle registration
    if (registerForm && !loginForm) {
        registerForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent form from refreshing the page

            // Get username and password input from registration form
            const username = registerForm.querySelector('input[type="text"]').value;
            const password = registerForm.querySelector('input[type="password"]').value;

            // Store them in localStorage (or sessionStorage if you prefer)
            localStorage.setItem('registeredUsername', username);
            localStorage.setItem('registeredPassword', password);

            alert("Registration successful! You can now login.");
        });
    }

    // Handle login
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault(); // Prevent form from refreshing the page

            // Get input from login form
            const username = loginForm.querySelector('#loginUsername').value;
            const password = loginForm.querySelector('#loginPassword').value;

            // Get the registered credentials from localStorage
            const registeredUsername = localStorage.getItem('registeredUsername');
            const registeredPassword = localStorage.getItem('registeredPassword');

            // Check if login credentials match the registered ones
            if (username === registeredUsername && password === registeredPassword) {
                // Redirect to PageGender.html if credentials match
                window.location.href = "index.html";
            } else {
                // Display an alert if the username or password is incorrect
                alert("Invalid username or password. Please try again.");
            }
        });
    }
});
