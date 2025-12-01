function displayCart(){
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    
    const cartContainer = document.querySelector(".cart-container");
    const cartName = document.querySelector(".row g-4 align-items-center");

    cart.forEach((item, index) => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
         <div class="row g-4 align-items-center">
            <div class="p-4 col-sm text-center mr-3">"${item.name}"</div>
            <div class="col-sm align-self-center mr-3">"${item.price}"</div>
            <div class="col-sm align-self-center mr-3">
                <button class="btn btn-dark btn-sm" data-add>Remove Item</button>
            </div>
        </div>
        `;
        cartContainer.appendChild(cartItem);
    });
}