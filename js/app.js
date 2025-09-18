// Global app functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize smooth scrolling
    initSmoothScrolling();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize tooltips
    initTooltips();
    
    // Update cart count on page load
    updateCartCount();
});

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Navigation functionality
function initNavigation() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        // Add scroll effect to navbar
        window.addEventListener('scroll', function() {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
}

// Initialize tooltips
function initTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

// Show tooltip
function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
    
    setTimeout(() => tooltip.classList.add('show'), 10);
}

// Hide tooltip
function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Update cart count in navigation
function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        
        if (totalItems > 0) {
            cartCountElement.style.display = 'inline-block';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
}

// Loading overlay functions
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Form validation utility
function validateForm(formId, rules) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    
    for (const [fieldName, rule] of Object.entries(rules)) {
        const field = form.querySelector(`[name="${fieldName}"]`);
        const errorElement = form.querySelector(`#${fieldName}Error`);
        
        if (field && errorElement) {
            const value = field.value.trim();
            let error = '';
            
            if (rule.required && !value) {
                error = rule.requiredMessage || 'This field is required';
            } else if (value && rule.pattern && !rule.pattern.test(value)) {
                error = rule.patternMessage || 'Invalid format';
            } else if (value && rule.minLength && value.length < rule.minLength) {
                error = rule.minLengthMessage || `Minimum ${rule.minLength} characters required`;
            } else if (value && rule.maxLength && value.length > rule.maxLength) {
                error = rule.maxLengthMessage || `Maximum ${rule.maxLength} characters allowed`;
            }
            
            if (error) {
                errorElement.textContent = error;
                field.classList.add('error');
                isValid = false;
            } else {
                errorElement.textContent = '';
                field.classList.remove('error');
            }
        }
    }
    
    return isValid;
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Local storage utilities
const storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    }
};

// Animation utilities
function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    let start = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            element.style.opacity = progress;
            requestAnimationFrame(animate);
        } else {
            element.style.opacity = '1';
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - start;
        const progress = elapsed / duration;
        
        if (progress < 1) {
            element.style.opacity = 1 - progress;
            requestAnimationFrame(animate);
        } else {
            element.style.opacity = '0';
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

// Event delegation utility
function delegate(parent, selector, event, handler) {
    parent.addEventListener(event, function(e) {
        if (e.target.matches(selector)) {
            handler(e);
        }
    });
}

// Export functions for use in other modules
window.app = {
    showToast,
    showLoading,
    hideLoading,
    showModal,
    hideModal,
    validateForm,
    debounce,
    storage,
    fadeIn,
    fadeOut,
    delegate,
    updateCartCount
};
