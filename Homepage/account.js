// Load current vendor info into the fields
window.onload = function () {

    let vendor = JSON.parse(localStorage.getItem("vendorInfo"));

    if (vendor) {
        document.getElementById("vendorName").value = vendor.name;
        document.getElementById("vendorEmail").value = vendor.email;
        document.getElementById("vendorPassword").value = vendor.password;
    }
};

// Save updated account settings
function saveAccount() {

    let name = document.getElementById("vendorName").value.trim();
    let email = document.getElementById("vendorEmail").value.trim();
    let password = document.getElementById("vendorPassword").value.trim();
    let msg = document.getElementById("saveMsg");

    if (name === "" || email === "" || password === "") {
        msg.style.color = "red";
        msg.innerText = "Please fill out all fields.";
        return;
    }

    // Save to localStorage
    localStorage.setItem("vendorInfo", JSON.stringify({
        name: name,
        email: email,
        password: password
    }));

    msg.style.color = "green";
    msg.innerText = "Account updated successfully!";
}

function logout() {
    localStorage.setItem("loggedIn", "no");
    window.location.href = "login.html";
}
