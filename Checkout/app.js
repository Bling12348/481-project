const cartContainer = document.querySelector(".cart");

displayCart();

function displayCart(){
    let inventory = [];
    let cart = [];
    inventory = JSON.parse(sessionStorage.getItem("productData"))
    cart = JSON.parse(sessionStorage.getItem("cart"))

    cart.forEach(element => {
        console.log(element)
    });
    
    const cartContainer = document.querySelector(".cart");

    cartContainer.innerHTML = ""; 

    cart.forEach((item, index) => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
        <div class="item-entry row g-4 align-items-center">
            <div class="foodname p-4 col-sm text-center mr-3">${item.name}</div>
            <div class="price col-sm align-self-center mr-3">${item.price}</div>
        </div>
        `;
        cartContainer.appendChild(cartItem);
    });
}


