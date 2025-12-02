let menu = JSON.parse(localStorage.getItem("menuItems")) || [];

// ---------- RENDER MENU ----------
function renderMenu() {
    const list = document.getElementById("menuList");
    list.innerHTML = "";

    menu.forEach((item, index) => {
        list.innerHTML += `
        <div class="list-item">
            <div>
                <strong>${item.name}</strong> - $${item.price}
            </div>

            <div class="item-actions">
                <span class="status-badge ${item.available ? "bg-success" : "bg-danger"}">
                    ${item.available ? "Available" : "Unavailable"}
                </span>

                <button class="btn btn-sm btn-warning" onclick="editItem(${index})">Edit</button>

                <button class="btn btn-sm btn-secondary" onclick="toggleAvailability(${index})">
                    Toggle
                </button>

                <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
            </div>
        </div>`;
    });
}

renderMenu();


// ---------- ADD NEW ITEM ----------
function openAddItemModal() {
    document.getElementById("modalTitle").innerText = "Add Menu Item";
    document.getElementById("itemName").value = "";
    document.getElementById("itemPrice").value = "";
    document.getElementById("saveItemBtn").onclick = saveNewItem;

    $("#itemModal").modal("show");
}
function saveNewItem() {
    const name = itemName.value.trim();
    const price = parseFloat(itemPrice.value);

    if (!name || isNaN(price)) {
        alert("Please fill out all fields correctly.");
        return;
    }
    menu.push({ name, price, available: true });
    localStorage.setItem("menuItems", JSON.stringify(menu));
    $("#itemModal").modal("hide");
    renderMenu();
}
let editIndex = null;

function editItem(index) {
    editIndex = index;

    document.getElementById("modalTitle").innerText = "Edit Menu Item";
    document.getElementById("itemName").value = menu[index].name;
    document.getElementById("itemPrice").value = menu[index].price;
    document.getElementById("saveItemBtn").onclick = saveEditedItem;

    $("#itemModal").modal("show");
}
function saveEditedItem() {
    const name = itemName.value.trim();
    const price = parseFloat(itemPrice.value);

    menu[editIndex].name = name;
    menu[editIndex].price = price;

    localStorage.setItem("menuItems", JSON.stringify(menu));

    $("#itemModal").modal("hide");
    renderMenu();
}
function deleteItem(index) {
    if (confirm("Delete this item?")) {
        menu.splice(index, 1);
        localStorage.setItem("menuItems", JSON.stringify(menu));
        renderMenu();
    }
}
function toggleAvailability(index) {
    menu[index].available = !menu[index].available;
    localStorage.setItem("menuItems", JSON.stringify(menu));
    renderMenu();
}
function goBack() {
    window.location.href = "vendor_home.html";
}
