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
        `;
    priceContainer.appendChild(price);
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('checkout-btn');
  if (btn) {
    btn.addEventListener('click', handleCheckout);
  }
});

function buildOrderItemsFromCart() {
  const rawCart = sessionStorage.getItem('cart');
  const cart = rawCart ? JSON.parse(rawCart) : [];
  const itemsById = {};

  cart.forEach(item => {
    if (!item || typeof item !== 'object') return;
    const id = item.id;

    if (!itemsById[id]) {
      itemsById[id] = {
        id: id,
        item_name: item.name,
        price: Number(item.price),
        quantity: 0
      };
    }
    itemsById[id].quantity += 1;
  });

  return Object.values(itemsById);
}

function handleCheckout(e) {
  e.preventDefault();

  const items = buildOrderItemsFromCart();
  if (!items.length) {
    alert('Your cart is empty.');
    return;
  }
  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const address1  = document.getElementById('inputAddress').value.trim();
  const address2  = document.getElementById('inputAddress2')?.value.trim() || '';
  const city      = document.getElementById('inputCity').value.trim();
  const state     = document.getElementById('inputState').value.trim();
  const zip       = document.getElementById('inputZip').value.trim();

  if (!firstName || !lastName || !address1 || !city || !state || !zip) {
    alert('Please complete the billing address form.');
    return;
  }

  const fullAddress = `${address1}${address2 ? ', ' + address2 : ''}, ${city}, ${state} ${zip}`;
  const studentName = `${firstName} ${lastName}`;

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const tax = subtotal * 0.06;
  const total = subtotal + tax;

  const order = {
    id: Date.now(), 
    created_at: new Date().toISOString(),
    status: 'pending',
    student_name: studentName,
    delivery_address: fullAddress,
    notes: '',
    items: items,
    total_amount: Number(total.toFixed(2))
  };

  const rawOrders = localStorage.getItem('orders');
  const orders = rawOrders ? JSON.parse(rawOrders) : [];
  orders.unshift(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  sessionStorage.removeItem('cart');

  alert(`Thanks ${studentName}! Your order has been placed.\n\nConfirmation #${order.id}`);
  window.location.href = '../index.html'; 
}
