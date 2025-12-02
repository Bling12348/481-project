let productData = []

initApp()

function initApp() {
  let initCart = []
  fetch("/Cart/items.json")
  .then(response => response.json())
  .then(data => {
    productData = data;
    sessionStorage.setItem('productData', JSON.stringify(productData))

    const oldData = sessionStorage.getItem("cart")
    if (oldData) {
      sessionStorage.setItem('cart', JSON.stringify(newData));
    } else {
      sessionStorage.setItem('cart', JSON.stringify(initCart))
    }
    console.log("Initalized!")
  });
}

function addToCart(itemId) {
  let inventory = JSON.parse(sessionStorage.getItem("productData"))
  let cart = JSON.parse(sessionStorage.getItem("cart"))
  console.log(cart)
  
  sessionStorage.setItem('cart', JSON.stringify(cart))
  
  index = cart.length

  cart.push(inventory[itemId-1])
  sessionStorage.setItem('cart', JSON.stringify(cart))
  index++
}


/* Tiny cart badge demo using localStorage per-page key */
(function(){
  const key = location.pathname.split('/').pop() || 'index.html';
  const badge = document.getElementById('cart-badge');

  function getCount(){ return parseInt(localStorage.getItem('cart:' + key) || '0', 10); }
  function setCount(n){ localStorage.setItem('cart:' + key, String(n)); if (badge) badge.textContent = n; }

  setCount(getCount());

  // Delegate add buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if(!btn) return;
    const n = getCount() + 1;
    setCount(n);
    // Show a toast if available
    const toastEl = document.getElementById('addToast');
    if(toastEl){
      const toast = new bootstrap.Toast(toastEl);
      toast.show();
    }
  });
})();