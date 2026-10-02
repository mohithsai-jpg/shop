/* =====================================
   LOGIN SYSTEM
===================================== */

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const showPassword = document.getElementById("showPassword");
const errorMessage = document.getElementById("errorMessage");
const loginButton = document.querySelector(".login-button");


/* =====================================
   LOGIN DETAILS
===================================== */

const correctUsername = "dad";
const correctPassword = "1234";


/* =====================================
   SHOW / HIDE PASSWORD
===================================== */

showPassword.addEventListener("click", function () {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";
        showPassword.textContent = "🙈";

    } else {

        passwordInput.type = "password";
        showPassword.textContent = "👁";

    }

});


/* =====================================
   CLEAR ERROR WHEN TYPING
===================================== */

usernameInput.addEventListener("input", function () {
    errorMessage.textContent = "";
});

passwordInput.addEventListener("input", function () {
    errorMessage.textContent = "";
});


/* =====================================
   LOGIN
===================================== */

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;


    /* Check login */

    if (
        username === correctUsername &&
        password === correctPassword
    ) {

        /* Save login status */

        sessionStorage.setItem("isLoggedIn", "true");


        /* Disable button */

        loginButton.disabled = true;


        /* Loading animation */

        loginButton.innerHTML =
            'Logging in <span>⏳</span>';

        loginButton.style.opacity = "0.8";


        /* Open dashboard */

        setTimeout(function () {

            window.location.href = "dashboard.html";

        }, 700);


    } else {

        /* Wrong username/password */

        errorMessage.textContent =
            "Invalid username or password";


        /* Shake form */

        loginForm.classList.remove("shake");

        void loginForm.offsetWidth;

        loginForm.classList.add("shake");

    }

});