const cartContainer = document.querySelector(".cart");
const priceContainer = document.querySelector(".price-container");

displayCart();
displayTotal()

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

function displayTotal(){
    let cart = [];
    let subtotal=0.0;
    let tax=0.0;
    let total=0.0;
    cart = JSON.parse(sessionStorage.getItem("cart"))

    priceContainer.innerHTML = ""; 

    cart.forEach((item, index) => {
        //console.log(item.price)
        subtotal = subtotal + item.price
        //console.log(subtotal)
    });

    tax = subtotal * 0.06;
    total = tax + subtotal;

    const price = document.createElement("div");
    price.classList.add("price");
    price.innerHTML = `
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax: ${tax.toFixed(2)}</p>
            <h3>Total: ${total.toFixed(2)}</h3>
        `;
    priceContainer.appendChild(price);
}