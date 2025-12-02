// Create default vendor info ONCE if none exists
if (!localStorage.getItem("vendorInfo")) {
    localStorage.setItem("vendorInfo", JSON.stringify({
        name: "Default Vendor",
        email: "vendor",
        password: "1234"
    }));
}

function login() {
    let u = document.getElementById("user").value.trim();
    let p = document.getElementById("pass").value.trim();
    let error = document.getElementById("error");

    if (u === "" || p === "") {
        error.innerText = "Enter username & password.";
        return;
    }

    let vendor = JSON.parse(localStorage.getItem("vendorInfo"));

    if (u === vendor.email && p === vendor.password) {
        localStorage.setItem("loggedIn", "yes");
        window.location.href = "vendor_home.html";
    } else {
        error.innerText = "Incorrect username or password.";
    }
}

// Prevent access if not logged in
if (!window.location.href.includes("login.html")) {
    if (localStorage.getItem("loggedIn") !== "yes") {
        window.location.href = "login.html";
    }
}
