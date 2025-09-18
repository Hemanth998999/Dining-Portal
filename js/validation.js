// Form validation utilities
class Validator {
    constructor() {
        this.rules = {
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            phone: {
                pattern: /^[6-9]\d{9}$/,
                message: 'Please enter a valid 10-digit phone number'
            },
            pincode: {
                pattern: /^[1-9][0-9]{5}$/,
                message: 'Please enter a valid 6-digit pincode'
            },
            name: {
                pattern: /^[a-zA-Z\s]{2,50}$/,
                message: 'Name should contain only letters and spaces (2-50 characters)'
            },
            address: {
                pattern: /^[a-zA-Z0-9\s,.-]{5,100}$/,
                message: 'Address should be 5-100 characters long'
            }
        };
        
        this.init();
    }

    init() {
        // Initialize form validation for all forms
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            this.setupFormValidation(form);
        });
    }

    setupFormValidation(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.validateForm(form);
        });

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', app.debounce(() => {
                this.clearError(input);
            }, 300));
        });
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            this.handleFormSubmission(form);
        } else {
            app.showToast('Please fix the errors in the form', 'error');
        }
        
        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldType = field.type;
        const fieldName = field.name;
        let isValid = true;
        let message = '';

        // Clear previous error
        this.clearError(field);

        // Check if field is required
        if (field.hasAttribute('required') && !value) {
            message = 'This field is required';
            isValid = false;
        } else if (value) {
            // Validate based on field type or name
            switch (fieldType) {
                case 'email':
                    if (!this.rules.email.pattern.test(value)) {
                        message = this.rules.email.message;
                        isValid = false;
                    }
                    break;
                case 'tel':
                    if (!this.rules.phone.pattern.test(value)) {
                        message = this.rules.phone.message;
                        isValid = false;
                    }
                    break;
                default:
                    // Validate based on field name
                    if (fieldName === 'pincode' && !this.rules.pincode.pattern.test(value)) {
                        message = this.rules.pincode.message;
                        isValid = false;
                    } else if ((fieldName === 'customerName' || fieldName === 'reviewerName') && !this.rules.name.pattern.test(value)) {
                        message = this.rules.name.message;
                        isValid = false;
                    } else if ((fieldName === 'houseFlatNo' || fieldName === 'streetName') && !this.rules.address.pattern.test(value)) {
                        message = this.rules.address.message;
                        isValid = false;
                    }
                    break;
            }
        }

        if (!isValid) {
            this.showError(field, message);
        }

        return isValid;
    }

    showError(field, message) {
        field.classList.add('error');
        
        // Find or create error element
        const errorId = field.name + 'Error';
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.id = errorId;
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearError(field) {
        field.classList.remove('error');
        
        const errorId = field.name + 'Error';
        const errorElement = document.getElementById(errorId);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    handleFormSubmission(form) {
        const formId = form.id;
        
        switch (formId) {
            case 'loginForm':
                this.handleLogin(form);
                break;
            case 'addressForm':
                this.handleAddress(form);
                break;
            case 'reviewForm':
                this.handleReview(form);
                break;
            case 'newsletterForm':
                this.handleNewsletter(form);
                break;
            default:
                console.log('Form submitted:', formId);
                break;
        }
    }

    handleLogin(form) {
        app.showLoading();
        
        const formData = new FormData(form);
        const loginData = {
            name: formData.get('customerName'),
            phone: formData.get('customerNo'),
            loginTime: new Date().toISOString()
        };
        
        // Simulate API call
        setTimeout(() => {
            app.hideLoading();
            
            // Store user data
            app.storage.set('currentUser', loginData);
            
            app.showToast('Login successful!', 'success');
            
            // Redirect to address page
            setTimeout(() => {
                window.location.href = 'address.html';
            }, 1000);
        }, 1500);
    }

    handleAddress(form) {
        app.showLoading();
        
        const formData = new FormData(form);
        const addressData = {
            houseFlatNo: formData.get('houseFlatNo'),
            streetName: formData.get('streetName'),
            city: formData.get('city'),
            state: formData.get('state'),
            pincode: formData.get('pincode'),
            savedTime: new Date().toISOString()
        };
        
        // Simulate API call
        setTimeout(() => {
            app.hideLoading();
            
            // Store address data
            app.storage.set('userAddress', addressData);
            
            app.showToast('Address saved successfully!', 'success');
            
            // Redirect to menu page
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1000);
        }, 1500);
    }

    handleReview(form) {
        const formData = new FormData(form);
        const reviewData = {
            name: formData.get('reviewerName'),
            rating: parseInt(formData.get('rating')),
            text: formData.get('reviewText'),
            date: new Date().toISOString().split('T')[0]
        };
        
        // Get existing reviews
        const reviews = app.storage.get('reviews', []);
        reviews.unshift(reviewData);
        app.storage.set('reviews', reviews);
        
        // Clear form
        form.reset();
        
        app.showToast('Review submitted successfully!', 'success');
        
        // Trigger review list update if function exists
        if (typeof loadReviews === 'function') {
            loadReviews();
        }
    }

    handleNewsletter(form) {
        const formData = new FormData(form);
        const email = formData.get('email');
        
        // Get existing subscribers
        const subscribers = app.storage.get('subscribers', []);
        
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            app.storage.set('subscribers', subscribers);
            
            form.reset();
            app.showToast('Successfully subscribed to newsletter!', 'success');
        } else {
            app.showToast('You\'re already subscribed!', 'info');
        }
    }

    // Custom validation rules
    addCustomRule(name, pattern, message) {
        this.rules[name] = {
            pattern: pattern,
            message: message
        };
    }

    // Validate specific field types
    validateEmail(email) {
        return this.rules.email.pattern.test(email);
    }

    validatePhone(phone) {
        return this.rules.phone.pattern.test(phone);
    }

    validatePincode(pincode) {
        return this.rules.pincode.pattern.test(pincode);
    }

    validateName(name) {
        return this.rules.name.pattern.test(name);
    }

    // Password validation (for future use)
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        
        return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
            errors: [
                password.length < minLength ? 'Password must be at least 8 characters long' : null,
                !hasUpperCase ? 'Password must contain at least one uppercase letter' : null,
                !hasLowerCase ? 'Password must contain at least one lowercase letter' : null,
                !hasNumbers ? 'Password must contain at least one number' : null,
                !hasSpecialChar ? 'Password must contain at least one special character' : null
            ].filter(error => error !== null)
        };
    }

    // Confirm password validation
    validateConfirmPassword(password, confirmPassword) {
        return password === confirmPassword;
    }
}

// Initialize validator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.validator = new Validator();
});
