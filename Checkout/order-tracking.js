function formatStatus(status) {
  const map = {
    pending: 'Pending (waiting for vendor)',
    confirmed: 'Confirmed by vendor',
    preparing: 'Being prepared',
    ready: 'Ready for pickup / delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled'
  };
  return map[status] || status || 'Unknown';
}

function getTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return diffMins + ' min ago';

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return diffHours + ' hour' + (diffHours > 1 ? 's' : '') + ' ago';

  const diffDays = Math.floor(diffHours / 24);
  return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
}

function findOrderById(orderIdInput) {
  const raw = localStorage.getItem('orders');
  const orders = raw ? JSON.parse(raw) : [];

  if (!orders.length) return null;

  const trimmed = orderIdInput.trim();
  const numeric = Number(trimmed);

  return orders.find(o =>
    String(o.id) === trimmed ||
    (!Number.isNaN(numeric) && Number(o.id) === numeric)
  );
}

function renderOrder(order) {
  const container = document.getElementById('track-result');
  if (!container) return;

  if (!order) {
    container.innerHTML =
      '<div class="alert alert-danger mt-3">No order found with that number.</div>';
    return;
  }

  const createdAgo = getTimeAgo(order.created_at);
  const statusText = formatStatus(order.status);

  let itemsHtml = '';
  if (order.items && order.items.length) {
    itemsHtml = order.items.map(it => {
      const total = (it.price * it.quantity).toFixed(2);
      return `
        <li class="d-flex justify-content-between">
          <span><strong>${it.quantity}x</strong> ${it.item_name}</span>
          <span class="text-muted">$${total}</span>
        </li>`;
    }).join('');
  }

  container.innerHTML = `
    <div class="border rounded p-3 mt-3 bg-light">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <div class="small text-muted">Order #</div>
          <div class="fw-bold">${order.id}</div>
        </div>
        <span class="badge bg-success text-wrap">
          ${statusText}
        </span>
      </div>

      <div class="small text-muted mb-2">
        Placed ${createdAgo}
      </div>

      ${order.student_name ? `<div><strong>Name:</strong> ${order.student_name}</div>` : ''}

      ${order.delivery_address ? `
        <div class="mt-1">
          <strong>Deliver to:</strong> ${order.delivery_address}
        </div>` : ''}

      <hr>

      <h6 class="mb-2">Items</h6>
      <ul class="list-unstyled mb-2">
        ${itemsHtml || '<li class="text-muted">No items recorded.</li>'}
      </ul>

      <div class="d-flex justify-content-between mt-2">
        <span class="fw-bold">Total</span>
        <span class="fw-bold">$${order.total_amount.toFixed(2)}</span>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('track-order-id');
  const btn = document.getElementById('track-order-btn');

  if (!input || !btn) return;

  btn.addEventListener('click', () => {
    const id = input.value;
    if (!id.trim()) {
      renderOrder(null);
      return;
    }
    const order = findOrderById(id);
    renderOrder(order);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      btn.click();
    }
  });
});
