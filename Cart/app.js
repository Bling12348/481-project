const cartContainer = document.querySelector(".cart");
const priceContainer = document.querySelector(".price-container");

displayCart();
displayTotal();

function displayCart(){
    let cart = [];
    let inventory = [];
    
    inventory = JSON.parse(sessionStorage.getItem("productData"))
    cart = JSON.parse(sessionStorage.getItem("cart"))
    
    const cartContainer = document.querySelector(".cart");

    cartContainer.innerHTML = ""; 

    cart.forEach((item, index) => {
        if(item != 999){
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
        <div class="item-entry row g-4 align-items-center">
            <div class="foodname p-4 col-sm text-center mr-3">${item.name}</div>
            <div class="price col-sm align-self-center mr-3">${(item.price).toFixed(2)}</div>
            <div class="col-sm align-self-center mr-3">
                <button onClick="removeFromCart(${item.id})" class="rmvbtn btn-dark btn-sm" data-add>Remove Item</button>
            </div>
        </div>
        `;
        cartContainer.appendChild(cartItem);
        }
    });
}

function displayTotal(){
    let cart = [];
    let subtotal=0.0;
    let tax=0.0;
    let total=0.0;
    cart = JSON.parse(localStorage.getItem("cart"))

    priceContainer.innerHTML = ""; 

    cart.forEach((item, index) => {
        subtotal = subtotal + item.price
    });

    tax = subtotal * 0.06;
    total = tax + subtotal;

    const price = document.createElement("div");
    price.classList.add("price");
    price.innerHTML = `
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Tax: ${tax.toFixed(2)}</p>
            <h3>Total: ${total.toFixed(2)}</h3>
            <a href="/Checkout/checkout-page.html" class="btn btn-dark position-relative">Proceed to Checkout</a>
        `;
    priceContainer.appendChild(price);
};

function removeFromCart(id){
    let cart = [];
    cart = JSON.parse(sessionStorage.getItem("cart"))
    console.log(id)

    cart.forEach((item, index) => {
        if(item.id == id){
            if(cart.length <= 1 || index == 0){
                cart.shift()
                sessionStorage.setItem('cart', JSON.stringify(cart))
            } else {
                cart.splice(index,index)
                sessionStorage.setItem('cart', JSON.stringify(cart))
            }
        }
    });

    /*
    cart.forEach((item, index) => {
        if(item.id == id){
            const cartItem = document.createElement("div");
            cartItem.classList.add("cart-item");
            cartItem.innerHTML = ``
        }
    });
    */

    displayCart();
    displayTotal();
}