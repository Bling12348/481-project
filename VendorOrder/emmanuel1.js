var API_URL = 'http://localhost:5000/api';
var allOrders = [];
var currentFilter = 'all';

function getAuthHeaders() {
    var token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? 'Bearer ' + token : ''
    };
}

function loadOrders() {
    showLoading();
    
    fetch(API_URL + '/orders/vendor/orders', {
        method: 'GET',
        headers: getAuthHeaders()
    })
    .then(function(response) {
        if (!response.ok) {
            throw new Error('Failed to load orders');
        }
        return response.json();
    })
    .then(function(data) {
        if (data.error) {
            showError(data.error);
            return;
        }
        allOrders = data;
        updateOrderCounts();
        renderOrders();
    })
    .catch(function(error) {
        console.error('Error:', error);
        showError('Could not load orders. Please make sure you are logged in.');
    });
}

function showLoading() {
    document.getElementById('loading-state').classList.remove('d-none');
    document.getElementById('empty-state').classList.add('d-none');
    document.getElementById('orders-list').innerHTML = '';
}

function showError(message) {
    document.getElementById('loading-state').classList.add('d-none');
    document.getElementById('empty-state').classList.add('d-none');
    document.getElementById('orders-list').innerHTML = '<div class="alert alert-danger">' + message + '</div>';
}

function updateOrderCounts() {
    document.getElementById('count-all').textContent = allOrders.length;
    document.getElementById('count-pending').textContent = allOrders.filter(function(o) { return o.status === 'pending'; }).length;
    document.getElementById('count-confirmed').textContent = allOrders.filter(function(o) { return o.status === 'confirmed'; }).length;
    document.getElementById('count-preparing').textContent = allOrders.filter(function(o) { return o.status === 'preparing'; }).length;
    document.getElementById('count-ready').textContent = allOrders.filter(function(o) { return o.status === 'ready'; }).length;
}

function filterOrders(status) {
    currentFilter = status;
    
    var buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === status) {
            btn.classList.add('active');
        }
    });
    
    renderOrders();
}

function renderOrders() {
    var container = document.getElementById('orders-list');
    var loadingState = document.getElementById('loading-state');
    var emptyState = document.getElementById('empty-state');
    
    loadingState.classList.add('d-none');
    
    var ordersToShow = currentFilter === 'all' 
        ? allOrders 
        : allOrders.filter(function(order) { return order.status === currentFilter; });
    
    if (ordersToShow.length === 0) {
        emptyState.classList.remove('d-none');
        container.innerHTML = '';
        return;
    }
    
    emptyState.classList.add('d-none');
    
    ordersToShow.sort(function(a, b) {
        return new Date(b.created_at) - new Date(a.created_at);
    });
    
    var html = '';
    for (var i = 0; i < ordersToShow.length; i++) {
        html += createOrderCard(ordersToShow[i]);
    }
    container.innerHTML = html;
}

function createOrderCard(order) {
    var timeAgo = getTimeAgo(order.created_at);
    var statusClass = 'status-' + order.status;
    
    var itemsHtml = '';
    if (order.items && order.items.length > 0) {
        for (var i = 0; i < order.items.length; i++) {
            var item = order.items[i];
            itemsHtml += '<li>' + item.quantity + 'x ' + item.item_name + ' - $' + (item.price * item.quantity).toFixed(2) + '</li>';
        }
    }
    
    var actionsHtml = getActionButtons(order);
    var badgeClass = getBadgeClass(order.status);
    
    var html = '<div class="order-card ' + statusClass + '" data-order-id="' + order.id + '">';
    html += '<div class="row g-3 align-items-center">';
    html += '<div class="col-md-12">';
    html += '<div class="d-flex justify-content-between align-items-center mb-2">';
    html += '<h4 class="mb-0 order-title">Order #' + order.id + '</h4>';
    html += '<span class="badge ' + badgeClass + ' status-pill">' + formatStatus(order.status) + '</span>';
    html += '</div>';
    html += '<p class="mb-1 text-muted small">Customer: ' + (order.student_name || 'N/A') + '</p>';
    html += '<p class="mb-1 text-muted small">Ordered: ' + timeAgo + '</p>';
    if (order.delivery_address) {
        html += '<p class="mb-1 text-muted small">Deliver to: ' + order.delivery_address + '</p>';
    }
    html += '<p class="mb-1 fw-semibold">Items:</p>';
    html += '<ul class="mb-2 small item-list">' + itemsHtml + '</ul>';
    html += '<p class="order-total mb-2">Total: $' + order.total_amount.toFixed(2) + '</p>';
    if (order.notes) {
        html += '<p class="mb-2 small"><strong>Notes:</strong> ' + order.notes + '</p>';
    }
    html += '<div class="action-buttons">' + actionsHtml + '</div>';
    html += '</div></div></div>';
    
    return html;
}

function getBadgeClass(status) {
    var classes = {
        'pending': 'bg-warning text-dark',
        'confirmed': 'bg-info',
        'preparing': 'bg-orange',
        'ready': 'bg-success',
        'delivered': 'bg-secondary',
        'cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

function getActionButtons(order) {
    switch (order.status) {
        case 'pending':
            return '<button class="action-btn btn-accept" onclick="updateStatus(' + order.id + ', \'confirmed\')">Confirm Order</button>' +
                   '<button class="action-btn btn-cancel" onclick="updateStatus(' + order.id + ', \'cancelled\')">Cancel</button>';
        case 'confirmed':
            return '<button class="action-btn btn-accept" onclick="updateStatus(' + order.id + ', \'preparing\')">Start Preparing</button>' +
                   '<button class="action-btn btn-cancel" onclick="updateStatus(' + order.id + ', \'cancelled\')">Cancel</button>';
        case 'preparing':
            return '<button class="action-btn btn-complete" onclick="updateStatus(' + order.id + ', \'ready\')">Mark Ready</button>' +
                   '<button class="action-btn btn-cancel" onclick="updateStatus(' + order.id + ', \'cancelled\')">Cancel</button>';
        case 'ready':
            return '<button class="action-btn btn-complete" onclick="updateStatus(' + order.id + ', \'delivered\')">Mark Delivered</button>';
        default:
            return '<span class="text-muted small">No actions available</span>';
    }
}

function updateStatus(orderId, newStatus) {
    fetch(API_URL + '/orders/' + orderId + '/status', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        if (data.error) {
            alert('Error: ' + data.error);
            return;
        }
        showToast('Order updated to ' + formatStatus(newStatus));
        loadOrders();
    })
    .catch(function(error) {
        console.error('Error:', error);
        alert('Failed to update order');
    });
}

function formatStatus(status) {
    var map = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'preparing': 'Preparing',
        'ready': 'Ready',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return map[status] || status;
}

function getTimeAgo(dateString) {
    var date = new Date(dateString);
    var now = new Date();
    var diff = Math.floor((now - date) / 60000);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return diff + ' min ago';
    
    var hours = Math.floor(diff / 60);
    if (hours < 24) return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
    
    var days = Math.floor(hours / 24);
    return days + ' day' + (days > 1 ? 's' : '') + ' ago';
}

function showToast(message) {
    var toastEl = document.getElementById('statusToast');
    var toastMsg = document.getElementById('toast-message');
    if (toastEl && toastMsg) {
        toastMsg.textContent = message;
        var toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../Homepage/login.html';
}

function checkAuth() {
    var token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../Homepage/login.html';
        return false;
    }
    
    var user = localStorage.getItem('user');
    if (user) {
        var userData = JSON.parse(user);
        if (userData.role !== 'vendor') {
            alert('Vendor access required');
            window.location.href = '../Homepage/login.html';
            return false;
        }
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
        loadOrders();
        setInterval(loadOrders, 30000);
    }
});
