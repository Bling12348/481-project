
let signupBtn = document.getElementById("signupBtn");
let signinBtn = document.getElementById("signinBtn");


let nameField = document.getElementById("nameField");
let title = document.getElementById("title");


let nameInput = document.getElementById("name");
let emailInput = document.getElementById("email");
let passwordInput = document.getElementById("password");


let nameError = document.getElementById("nameError");
let emailError = document.getElementById("emailError");
let passwordError = document.getElementById("passwordError");


let users = JSON.parse(localStorage.getItem("users")) || [];


function clearErrors() {
    nameError.innerText = "";
    emailError.innerText = "";
    passwordError.innerText = "";
}


signinBtn.onclick = function () {
    clearErrors();
    nameField.style.maxHeight = "0";
    title.innerHTML = "Sign In";
    signupBtn.classList.add("disable");
    signinBtn.classList.remove("disable");
};

signupBtn.onclick = function () {
    clearErrors();
    nameField.style.maxHeight = "60px";
    title.innerHTML = "Sign Up";
    signupBtn.classList.remove("disable");
    signinBtn.classList.add("disable");
};

/* ---------- SIGN UP ---------- */
signupBtn.addEventListener("click", function () {
    if (signupBtn.classList.contains("disable")) return;

    clearErrors();

    let name = nameInput.value.trim();
    let email = emailInput.value.trim();
    let password = passwordInput.value.trim();

    let hasError = false;

    if (!name) {
        nameError.innerText = "Name is required";
        hasError = true;
    }

    if (!email) {
        emailError.innerText = "Email is required";
        hasError = true;
    }

    if (!password) {
        passwordError.innerText = "Password is required";
        hasError = true;
    }

    if (hasError) return;

    let exists = users.find(u => u.email === email);
    if (exists) {
        emailError.innerText = "Account already exists";
        return;
    }

    users.push({ name, email, password });
    localStorage.setItem("users", JSON.stringify(users));

    clearErrors();
    nameInput.value = "";
    emailInput.value = "";
    passwordInput.value = "";

    
    emailError.style.color = "green";
    emailError.innerText = "Account created successfully!";
    setTimeout(() => emailError.style.color = "red", 1500);
});


signinBtn.addEventListener("click", function () {
    if (signinBtn.classList.contains("disable")) return;

    clearErrors();

    let email = emailInput.value.trim();
    let password = passwordInput.value.trim();

    let hasError = false;

    if (!email) {
        emailError.innerText = "Email is required";
        hasError = true;
    }

    if (!password) {
        passwordError.innerText = "Password is required";
        hasError = true;
    }

    if (hasError) return;

    let user = users.find(
        u => u.email === email && u.password === password
    );

    if (!user) {
        emailError.innerText = "Invalid email or password";
        return;
    }

    localStorage.setItem("loggedInVendor", JSON.stringify(user));
    window.location.href = "vendor_home.html";
});
