// assets/wishlist.js

class Wishlist {
    constructor() {
        this.wishlistKey = 'shopify_wishlist'; // Key for local storage
        this.wishlist = this.loadWishlist(); // Load existing wishlist from local storage
        this.initButtons(); // Initialize buttons on product/collection pages
        this.updateWishlistCount(); // Update global count
    }

    loadWishlist() {
        try {
            const storedWishlist = localStorage.getItem(this.wishlistKey);
            return storedWishlist ? JSON.parse(storedWishlist) : [];
        } catch (e) {
            console.error('Error loading wishlist from local storage:', e);
            return [];
        }
    }

    saveWishlist() {
        try {
            localStorage.setItem(this.wishlistKey, JSON.stringify(this.wishlist));
        } catch (e) {
            console.error('Error saving wishlist to local storage:', e);
        }
    }

    // Initialize all "Add to Wishlist" buttons on the page (product cards, product page)
    initButtons() {
        const buttons = document.querySelectorAll('.wishlist-button');
        buttons.forEach(button => {
            const productId = button.dataset.productId;
            if (this.isInWishlist(productId)) {
                this.setButtonActive(button, true);
            } else {
                this.setButtonActive(button, false); // Ensure correct initial state
            }
            // Ensure the event listener is only added once
            if (!button.dataset.listenerAdded) {
                button.addEventListener('click', this.toggleWishlist.bind(this));
                button.dataset.listenerAdded = 'true'; // Mark as having listener
            }
        });
    }

    // Check if a product is in the wishlist
    isInWishlist(productId) {
        return this.wishlist.some(item => item.id === productId);
    }

    // Set button state (active/inactive) - ADAPTED FOR BOXICONS
    setButtonActive(button, isActive) {
        const emptyHeart = button.querySelector('.bx.bx-heart');
        const filledHeart = button.querySelector('.bx.bxs-heart');
        const visuallyHiddenText = button.querySelector('.visuallyhidden');

        if (isActive) {
            button.classList.add('in-wishlist');
            if (emptyHeart) emptyHeart.style.display = 'none';
            if (filledHeart) filledHeart.style.display = 'block';
            if (visuallyHiddenText) visuallyHiddenText.textContent = 'Remove from Wishlist';
            button.setAttribute('aria-label', 'Remove from wishlist');
        } else {
            button.classList.remove('in-wishlist');
            if (emptyHeart) emptyHeart.style.display = 'block';
            if (filledHeart) filledHeart.style.display = 'none';
            if (visuallyHiddenText) visuallyHiddenText.textContent = 'Add to Wishlist';
            button.setAttribute('aria-label', 'Add to wishlist');
        }
    }

    // Toggle product in/out of wishlist
    toggleWishlist(event) {
        const button = event.currentTarget;
        const productId = button.dataset.productId; // Get ID from data attribute

        if (this.isInWishlist(productId)) {
            this.removeFromWishlist(productId);
            this.setButtonActive(button, false);
            console.log(`Product ${productId} removed from wishlist.`);
        } else {
            const product = {
                id: productId,
                handle: button.dataset.productHandle,
                title: button.dataset.productTitle,
                image: button.dataset.productImage,
                price: button.dataset.productPrice,
                url: button.dataset.productUrl
            };
            this.addToWishlist(product);
            this.setButtonActive(button, true);
            console.log(`Product ${productId} added to wishlist.`);
        }
        this.updateWishlistCount();
    }

    addToWishlist(product) {
        // Ensure product is not already added (e.g., if multiple rapid clicks)
        if (!this.isInWishlist(product.id)) {
            this.wishlist.push(product);
            this.saveWishlist();
        }
    }

    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(item => item.id !== productId);
        this.saveWishlist();
    }

    // Update the count displayed somewhere on the site (e.g., header icon)
    updateWishlistCount() {
        const countElements = document.querySelectorAll('[data-wishlist-count]');
        countElements.forEach(element => {
            element.textContent = this.wishlist.length;
        });
    }

    // Get all wishlist items (useful for rendering the wishlist page)
    getWishlistItems() {
        return this.wishlist;
    }
}

// Initialize the wishlist on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Check if the Wishlist class has already been instantiated to prevent duplicates
    if (!window.wishlistInstance) {
        window.wishlistInstance = new Wishlist();
    }
});

// Important: When dynamically adding content (like on the wishlist page),
// you'll need to call `window.wishlistInstance.initButtons()` again
// to attach event listeners to the new buttons.