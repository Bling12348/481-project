var allOrders = [];
var currentFilter = 'all';

function loadOrders() {
  showLoading();

  try {
    const raw = localStorage.getItem('orders');
    allOrders = raw ? JSON.parse(raw) : [];

    updateOrderCounts();
    renderOrders();
  } catch (error) {
    console.error('Error loading orders:', error);
    showError('Could not load orders.');
  }
}

function showError(message) {
  const container = document.getElementById('orders-list');
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');

  loadingState.classList.add('d-none');
  emptyState.classList.add('d-none');

  container.innerHTML =
    '<div class="alert alert-danger text-center">' + message + '</div>';
}

function showLoading() {
  document.getElementById('loading-state').classList.remove('d-none');
  document.getElementById('empty-state').classList.add('d-none');
  document.getElementById('orders-list').innerHTML = '';
}

function updateOrderCounts() {
  document.getElementById('count-all').textContent       = allOrders.length;
  document.getElementById('count-pending').textContent   = allOrders.filter(o => o.status === 'pending').length;
  document.getElementById('count-confirmed').textContent = allOrders.filter(o => o.status === 'confirmed').length;
  document.getElementById('count-preparing').textContent = allOrders.filter(o => o.status === 'preparing').length;
  document.getElementById('count-ready').textContent     = allOrders.filter(o => o.status === 'ready').length;
  document.getElementById('count-delivered').textContent = allOrders.filter(o => o.status === 'delivered').length;
}

function filterOrders(status) {
  currentFilter = status;

  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-filter') === status) {
      btn.classList.add('active');
    }
  });

  renderOrders();
}

function renderOrders() {
  const container = document.getElementById('orders-list');
  const loadingState = document.getElementById('loading-state');
  const emptyState = document.getElementById('empty-state');

  loadingState.classList.add('d-none');

  const ordersToShow =
    currentFilter === 'all'
      ? allOrders
      : allOrders.filter(order => order.status === currentFilter);

  if (!ordersToShow.length) {
    emptyState.classList.remove('d-none');
    container.innerHTML = '';
    return;
  }

  emptyState.classList.add('d-none');

  ordersToShow.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  let html = '';
  for (let i = 0; i < ordersToShow.length; i++) {
    html += createOrderCard(ordersToShow[i]);
  }
  container.innerHTML = html;
}

function createOrderCard(order) {
  const timeAgo = getTimeAgo(order.created_at);

  let itemsHtml = '';
  if (order.items && order.items.length > 0) {
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const itemTotal = (item.price * item.quantity).toFixed(2);
      itemsHtml +=
        '<li><span class="item-quantity">' +
        item.quantity +
        'x</span> ' +
        item.item_name +
        ' <span class="text-muted">$' +
        itemTotal +
        '</span></li>';
    }
  }

  const actionsHtml = getActionButtons(order);

  let cardHtml =
    '<div class="order-card status-' +
    order.status +
    '" data-order-id="' +
    order.id +
    '" data-status="' +
    order.status +
    '">';

  cardHtml += '<div class="order-header">';
  cardHtml +=
    '<div><span class="order-number">Order #' +
    order.id +
    '</span>' +
    '<span class="order-time ms-2">' +
    timeAgo +
    '</span></div>';
  cardHtml +=
    '<span class="status-badge status-' +
    order.status +
    '">' +
    formatStatus(order.status) +
    '</span></div>';

  cardHtml += '<div class="customer-info">';
  cardHtml +=
    '<span class="customer-name">' +
    (order.student_name || 'Customer') +
    '</span>';
  cardHtml += '</div>';

  if (order.delivery_address) {
    cardHtml +=
      '<div class="delivery-address"><strong>Deliver to:</strong> ' +
      order.delivery_address +
      '</div>';
  }

  cardHtml +=
    '<div class="order-items"><h6>Order Items</h6><ul class="item-list">' +
    itemsHtml +
    '</ul></div>';

  cardHtml +=
    '<div class="order-total">Total: $' +
    order.total_amount.toFixed(2) +
    '</div>';

  cardHtml += '<div class="action-buttons">' + actionsHtml + '</div>';
  cardHtml += '</div>';

  return cardHtml;
}

function getActionButtons(order) {
  switch (order.status) {
    case 'pending':
      return (
        '<button class="action-btn btn-confirm" onclick="updateStatus(' +
        order.id +
        ", 'confirmed')\">Confirm Order</button>" +
        '<button class="action-btn btn-cancel" onclick="updateStatus(' +
        order.id +
        ", 'cancelled')\">Cancel</button>"
      );
    case 'confirmed':
      return (
        '<button class="action-btn btn-prepare" onclick="updateStatus(' +
        order.id +
        ", 'preparing')\">Start Preparing</button>" +
        '<button class="action-btn btn-cancel" onclick="updateStatus(' +
        order.id +
        ", 'cancelled')\">Cancel</button>"
      );
    case 'preparing':
      return (
        '<button class="action-btn btn-ready" onclick="updateStatus(' +
        order.id +
        ", 'ready')\">Mark Ready</button>" +
        '<button class="action-btn btn-cancel" onclick="updateStatus(' +
        order.id +
        ", 'cancelled')\">Cancel</button>"
      );
    case 'ready':
      return (
        '<button class="action-btn btn-deliver" onclick="updateStatus(' +
        order.id +
        ", 'delivered')\">Mark Delivered</button>"
      );
    case 'delivered':
    case 'cancelled':
      return '<span class="text-muted">No actions available</span>';
    default:
      return '';
  }
}

function updateStatus(orderId, newStatus) {
  const raw = localStorage.getItem('orders');
  const orders = raw ? JSON.parse(raw) : [];
  const idNum = Number(orderId);

  const idx = orders.findIndex(o => Number(o.id) === idNum);
  if (idx === -1) {
    alert('Order not found');
    return;
  }

  orders[idx].status = newStatus;
  localStorage.setItem('orders', JSON.stringify(orders));

  allOrders = orders;
  updateOrderCounts();
  renderOrders();
  showToast('Order status updated to ' + formatStatus(newStatus));
}

function formatStatus(status) {
  const statusMap = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return statusMap[status] || status;
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return diffMins + ' min ago';

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24)
    return diffHours + ' hour' + (diffHours > 1 ? 's' : '') + ' ago';

  const diffDays = Math.floor(diffHours / 24);
  return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
}

function showToast(message) {
  const el = document.getElementById('statusToast');
  const body = document.getElementById('toast-message');
  if (!el || !body) return;

  body.textContent = message;
  const toast = new bootstrap.Toast(el);
  toast.show();
}

function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = '../Homepage/vendor_login.html';
}

function checkAuth() {
  const loggedIn = localStorage.getItem('loggedIn');
  if (loggedIn !== 'yes') {
    alert('Please log in to access this page');
    window.location.href = '../Homepage/vendor_login.html';
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', function () {
  if (checkAuth()) {
    loadOrders();

    setInterval(function () {
      loadOrders();
    }, 30000);
  }
});
