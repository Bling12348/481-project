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
            throw new Error('Failed to fetch orders');
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
        console.error('Error loading orders:', error);
        showError('Could not load orders. Make sure you are logged in as a vendor.');
    });
}

function showError(message) {
    var container = document.getElementById('orders-list');
    var loadingState = document.getElementById('loading-state');
    var emptyState = document.getElementById('empty-state');
    
    loadingState.classList.add('d-none');
    emptyState.classList.add('d-none');
    
    container.innerHTML = '<div class="alert alert-danger text-center">' + message + '</div>';
}

function updateOrderCounts() {
    document.getElementById('count-all').textContent = allOrders.length;
    document.getElementById('count-pending').textContent = allOrders.filter(function(o) { return o.status === 'pending'; }).length;
    document.getElementById('count-confirmed').textContent = allOrders.filter(function(o) { return o.status === 'confirmed'; }).length;
    document.getElementById('count-preparing').textContent = allOrders.filter(function(o) { return o.status === 'preparing'; }).length;
    document.getElementById('count-ready').textContent = allOrders.filter(function(o) { return o.status === 'ready'; }).length;
    document.getElementById('count-delivered').textContent = allOrders.filter(function(o) { return o.status === 'delivered'; }).length;
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
    
    var itemsHtml = '';
    if (order.items && order.items.length > 0) {
        for (var i = 0; i < order.items.length; i++) {
            var item = order.items[i];
            var itemTotal = (item.price * item.quantity).toFixed(2);
            itemsHtml += '<li><span class="item-quantity">' + item.quantity + 'x</span> ' + item.item_name + ' <span class="text-muted">$' + itemTotal + '</span></li>';
        }
    }
    
    var actionsHtml = getActionButtons(order);
    
    var cardHtml = '<div class="order-card status-' + order.status + '" data-order-id="' + order.id + '" data-status="' + order.status + '">';
    cardHtml += '<div class="order-header">';
    cardHtml += '<div><span class="order-number">Order #' + order.id + '</span>';
    cardHtml += '<span class="order-time ms-2">' + timeAgo + '</span></div>';
    cardHtml += '<span class="status-badge status-' + order.status + '">' + formatStatus(order.status) + '</span></div>';
    
    cardHtml += '<div class="customer-info">';
    cardHtml += '<span class="customer-name">' + (order.student_name || 'Customer') + '</span>';
    if (order.student_phone) {
        cardHtml += '<span class="customer-phone ms-2">' + order.student_phone + '</span>';
    }
    cardHtml += '</div>';
    
    if (order.delivery_address) {
        cardHtml += '<div class="delivery-address"><strong>Deliver to:</strong> ' + order.delivery_address + '</div>';
    }
    
    cardHtml += '<div class="order-items"><h6>Order Items</h6><ul class="item-list">' + itemsHtml + '</ul></div>';
    cardHtml += '<div class="order-total">Total: $' + order.total_amount.toFixed(2) + '</div>';
    
    if (order.notes) {
        cardHtml += '<div class="order-notes"><strong>Notes:</strong> ' + order.notes + '</div>';
    }
    
    cardHtml += '<div class="action-buttons">' + actionsHtml + '</div>';
    cardHtml += '</div>';
    
    return cardHtml;
}

function getActionButtons(order) {
    switch (order.status) {
        case 'pending':
            return '<button class="action-btn btn-confirm" onclick="updateStatus(' + order.id + ', \'confirmed\')">Confirm Order</button>' +
                   '<button class="action-btn btn-cancel" onclick="updateStatus(' + order.id + ', \'cancelled\')">Cancel</button>';
        case 'confirmed':
            return '<button class="action-btn btn-prepare" onclick="updateStatus(' + order.id + ', \'preparing\')">Start Preparing</button>' +
                   '<button class="action-btn btn-cancel" onclick="updateStatus(' + order.id + ', \'cancelled\')">Cancel</button>';
        case 'preparing':
            return '<button class="action-btn btn-ready" onclick="updateStatus(' + order.id + ', \'ready\')">Mark Ready</button>' +
                   '<button class="action-btn btn-cancel" onclick="updateStatus(' + order.id + ', \'cancelled\')">Cancel</button>';
        case 'ready':
            return '<button class="action-btn btn-deliver" onclick="updateStatus(' + order.id + ', \'delivered\')">Mark Delivered</button>';
        case 'delivered':
        case 'cancelled':
            return '<span class="text-muted">No actions available</span>';
        default:
            return '';
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
        showToast('Order status updated to ' + formatStatus(newStatus));
        loadOrders();
    })
    .catch(function(error) {
        console.error('Error updating status:', error);
        alert('Failed to update order status');
    });
}

function formatStatus(status) {
    var statusMap = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'preparing': 'Preparing',
        'ready': 'Ready',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

function getTimeAgo(dateString) {
    var date = new Date(dateString);
    var now = new Date();
    var diffMs = now - date;
    var diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return diffMins + ' min ago';
    
    var diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return diffHours + ' hour' + (diffHours > 1 ? 's' : '') + ' ago';
    
    var diffDays = Math.floor(diffHours / 24);
    return diffDays + ' day' + (diffDays > 1 ? 's' : '') + ' ago';
}

function showLoading() {
    document.getElementById('loading-state').classList.remove('d-none');
    document.getElementById('empty-state').classList.add('d-none');
    document.getElementById('orders-list').innerHTML = '';
}

function showToast(message) {
    document.getElementById('toast-message').textContent = message;
    var toast = new bootstrap.Toast(document.getElementById('statusToast'));
    toast.show();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../Homepage/login.html';
}

function checkAuth() {
    var token = localStorage.getItem('token');
    var user = localStorage.getItem('user');
    
    if (!token) {
        alert('Please log in to access this page');
        window.location.href = '../Homepage/login.html';
        return false;
    }
    
    if (user) {
        var userData = JSON.parse(user);
        if (userData.role !== 'vendor') {
            alert('Access denied. Vendor account required.');
            window.location.href = '../Homepage/login.html';
            return false;
        }
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    if (checkAuth()) {
        loadOrders();
        
        setInterval(function() {
            loadOrders();
        }, 30000);
    }
});
