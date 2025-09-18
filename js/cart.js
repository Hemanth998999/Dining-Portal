// Cart functionality
class Cart {
    constructor() {
        this.items = this.loadCart();
        this.deliveryFee = 50;
        this.taxRate = 0.05;
        this.init();
    }

    init() {
        this.renderCart();
        this.bindEvents();
        this.updateSummary();
    }

    loadCart() {
        return app.storage.get('cart', []);
    }

    saveCart() {
        app.storage.set('cart', this.items);
        app.updateCartCount();
    }

    addItem(item) {
        const existingItem = this.items.find(cartItem => cartItem.name === item.name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                name: item.name,
                price: item.price,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.renderCart();
        this.updateSummary();
        app.showToast(`${item.name} added to cart!`, 'success');
    }

    removeItem(itemName) {
        this.items = this.items.filter(item => item.name !== itemName);
        this.saveCart();
        this.renderCart();
        this.updateSummary();
        app.showToast('Item removed from cart', 'info');
    }

    updateQuantity(itemName, quantity) {
        const item = this.items.find(cartItem => cartItem.name === itemName);
        if (item) {
            if (quantity > 0) {
                item.quantity = quantity;
            } else {
                this.removeItem(itemName);
                return;
            }
            this.saveCart();
            this.renderCart();
            this.updateSummary();
        }
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTax() {
        return this.getSubtotal() * this.taxRate;
    }

    getTotal() {
        return this.getSubtotal() + this.deliveryFee + this.getTax();
    }

    renderCart() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartEmptyContainer = document.getElementById('cartEmpty');
        const cartSummary = document.getElementById('cartSummary');

        if (!cartItemsContainer) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '';
            if (cartEmptyContainer) cartEmptyContainer.style.display = 'block';
            if (cartSummary) cartSummary.style.display = 'none';
            return;
        }

        if (cartEmptyContainer) cartEmptyContainer.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'block';

        cartItemsContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-item="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-price">₹${item.price}</div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.name}', ${item.quantity - 1})">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn" onclick="cart.updateQuantity('${item.name}', ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="cart.removeItem('${item.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateSummary() {
        const subtotalElement = document.getElementById('subtotal');
        const deliveryFeeElement = document.getElementById('deliveryFee');
        const taxElement = document.getElementById('tax');
        const totalElement = document.getElementById('total');

        if (subtotalElement) subtotalElement.textContent = `₹${this.getSubtotal()}`;
        if (deliveryFeeElement) deliveryFeeElement.textContent = `₹${this.deliveryFee}`;
        if (taxElement) taxElement.textContent = `₹${Math.round(this.getTax())}`;
        if (totalElement) totalElement.textContent = `₹${Math.round(this.getTotal())}`;
    }

    bindEvents() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.checkout());
        }

        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => app.hideModal('checkoutModal'));
        }

        const confirmOrder = document.getElementById('confirmOrder');
        if (confirmOrder) {
            confirmOrder.addEventListener('click', () => this.confirmOrder());
        }

        const cancelOrder = document.getElementById('cancelOrder');
        if (cancelOrder) {
            cancelOrder.addEventListener('click', () => app.hideModal('checkoutModal'));
        }
    }

    checkout() {
        if (this.items.length === 0) {
            app.showToast('Your cart is empty!', 'warning');
            return;
        }

        const orderSummary = document.getElementById('orderSummary');
        if (orderSummary) {
            orderSummary.innerHTML = `
                <div class="order-items">
                    ${this.items.map(item => `
                        <div class="order-item">
                            <span>${item.name} x ${item.quantity}</span>
                            <span>₹${item.price * item.quantity}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    <strong>Total: ₹${Math.round(this.getTotal())}</strong>
                </div>
            `;
        }

        app.showModal('checkoutModal');
    }

    confirmOrder() {
        app.showLoading();
        
        // Simulate order processing
        setTimeout(() => {
            app.hideLoading();
            app.hideModal('checkoutModal');
            
            // Save order to history
            const order = {
                id: Date.now(),
                items: [...this.items],
                total: this.getTotal(),
                date: new Date().toISOString(),
                status: 'confirmed'
            };
            
            const orders = app.storage.get('orders', []);
            orders.push(order);
            app.storage.set('orders', orders);
            
            // Clear cart
            this.items = [];
            this.saveCart();
            this.renderCart();
            this.updateSummary();
            
            app.showToast('Order confirmed! Thank you for your purchase.', 'success', 5000);
            
            // Redirect to home page after a delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }, 2000);
    }

    clearCart() {
        this.items = [];
        this.saveCart();
        this.renderCart();
        this.updateSummary();
        app.showToast('Cart cleared', 'info');
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.cart = new Cart();
});
