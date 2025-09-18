// Menu functionality
class Menu {
    constructor() {
        this.items = [];
        this.currentCategory = 'all';
        this.init();
    }

    init() {
        this.bindEvents();
        this.filterItems('all');
    }

    bindEvents() {
        // Category filter buttons
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.filterItems(category);
                this.updateActiveCategory(e.target);
            });
        });

        // Add to cart buttons
        const addToCartBtns = document.querySelectorAll('.btn-add-to-cart');
        addToCartBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const item = {
                    name: e.target.getAttribute('data-item'),
                    price: parseInt(e.target.getAttribute('data-price'))
                };
                this.addToCart(item, e.target);
            });
        });

        // View cart button
        const viewCartBtn = document.getElementById('viewCartBtn');
        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => {
                window.location.href = 'cart.html';
            });
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', app.debounce((e) => {
                this.searchItems(e.target.value);
            }, 300));
        }
    }

    filterItems(category) {
        const menuItems = document.querySelectorAll('.menu-item');
        
        menuItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block';
                app.fadeIn(item, 300);
            } else {
                app.fadeOut(item, 300);
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
        
        this.currentCategory = category;
    }

    updateActiveCategory(activeBtn) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    searchItems(query) {
        const menuItems = document.querySelectorAll('.menu-item');
        const searchTerm = query.toLowerCase();
        
        menuItems.forEach(item => {
            const itemName = item.querySelector('h3').textContent.toLowerCase();
            const itemDescription = item.querySelector('p').textContent.toLowerCase();
            
            if (itemName.includes(searchTerm) || itemDescription.includes(searchTerm)) {
                item.style.display = 'block';
                app.fadeIn(item, 300);
            } else {
                app.fadeOut(item, 300);
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });
    }

    addToCart(item, button) {
        // Add visual feedback
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Added';
        button.classList.add('added');
        button.disabled = true;
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('added');
            button.disabled = false;
        }, 2000);
        
        // Add item to cart (cart.js handles this)
        if (window.cart) {
            window.cart.addItem(item);
        } else {
            // Fallback if cart is not loaded
            const cart = app.storage.get('cart', []);
            const existingItem = cart.find(cartItem => cartItem.name === item.name);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    name: item.name,
                    price: item.price,
                    quantity: 1
                });
            }
            
            app.storage.set('cart', cart);
            app.updateCartCount();
            app.showToast(`${item.name} added to cart!`, 'success');
        }
    }

    // Method to dynamically add menu items (for future use)
    addMenuItem(item) {
        const menuGrid = document.querySelector('.menu-grid');
        if (!menuGrid) return;
        
        const menuItemHTML = `
            <div class="menu-item" data-category="${item.category}">
                <div class="menu-item-image">
                    <i class="${item.icon}"></i>
                </div>
                <div class="menu-item-content">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <div class="menu-item-price">₹${item.price}</div>
                    <button class="btn btn-add-to-cart" data-item="${item.name}" data-price="${item.price}">
                        <i class="fas fa-plus"></i>
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        
        menuGrid.insertAdjacentHTML('beforeend', menuItemHTML);
        
        // Re-bind events for new item
        const newItem = menuGrid.lastElementChild;
        const addToCartBtn = newItem.querySelector('.btn-add-to-cart');
        addToCartBtn.addEventListener('click', (e) => {
            this.addToCart({
                name: item.name,
                price: item.price
            }, e.target);
        });
    }

    // Method to remove menu items
    removeMenuItem(itemName) {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const name = item.querySelector('h3').textContent;
            if (name === itemName) {
                app.fadeOut(item, 300);
                setTimeout(() => {
                    item.remove();
                }, 300);
            }
        });
    }

    // Method to update menu item
    updateMenuItem(itemName, updates) {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const name = item.querySelector('h3').textContent;
            if (name === itemName) {
                if (updates.name) item.querySelector('h3').textContent = updates.name;
                if (updates.description) item.querySelector('p').textContent = updates.description;
                if (updates.price) {
                    item.querySelector('.menu-item-price').textContent = `₹${updates.price}`;
                    item.querySelector('.btn-add-to-cart').setAttribute('data-price', updates.price);
                }
                if (updates.icon) item.querySelector('.menu-item-image i').className = updates.icon;
            }
        });
    }

    // Method to get menu statistics
    getMenuStats() {
        const menuItems = document.querySelectorAll('.menu-item');
        const stats = {
            total: menuItems.length,
            categories: {},
            priceRange: { min: Infinity, max: -Infinity }
        };
        
        menuItems.forEach(item => {
            const category = item.getAttribute('data-category');
            const price = parseInt(item.querySelector('.btn-add-to-cart').getAttribute('data-price'));
            
            stats.categories[category] = (stats.categories[category] || 0) + 1;
            stats.priceRange.min = Math.min(stats.priceRange.min, price);
            stats.priceRange.max = Math.max(stats.priceRange.max, price);
        });
        
        return stats;
    }
}

// Initialize menu when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.menu = new Menu();
});
