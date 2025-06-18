// assets/wishlist.js

class Wishlist {
    constructor() {
        this.wishlistKey = 'shopify_wishlist'; // Key for local storage
        this.wishlist = this.loadWishlist(); // Load existing wishlist from local storage
        this.initButtons(); // Initialize buttons on product/collection pages
        this.updateWishlistCount(); // Update global count
        this.renderWishlistPage(); // NEW: Attempt to render wishlist page if on it
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
        return this.wishlist.some(item => String(item.id) === String(productId)); // Ensure string comparison
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
                price: button.dataset.productPrice, // Price is an integer
                url: button.dataset.productUrl
            };
            this.addToWishlist(product);
            this.setButtonActive(button, true);
            console.log(`Product ${productId} added to wishlist.`);
        }
        this.updateWishlistCount();
        this.renderWishlistPage(); // Re-render wishlist page if on it (to update displayed items)
    }

    addToWishlist(product) {
        // Ensure product is not already added (e.g., if multiple rapid clicks)
        if (!this.isInWishlist(product.id)) {
            this.wishlist.push(product);
            this.saveWishlist();
        }
    }

    removeFromWishlist(productId) {
        this.wishlist = this.wishlist.filter(item => String(item.id) !== String(productId)); // Ensure string comparison
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

    // NEW METHOD: Render the wishlist items on the dedicated page
    renderWishlistPage() {
        // Check if we are on the wishlist page by looking for its container
        const wishlistContainer = document.getElementById('wishlist-items-container');
        if (!wishlistContainer) {
            return; // Not on the wishlist page, so do nothing
        }

        const emptyMessage = wishlistContainer.querySelector('.empty-wishlist-message');
        const items = this.getWishlistItems();

        // Clear existing content to re-render
        wishlistContainer.innerHTML = ''; // Clear everything, including empty message, then re-add

        if (items.length > 0) {
            emptyMessage.style.display = 'none'; // Hide empty message (even though it's cleared, good practice)

            items.forEach(item => {
                const productCardHtml = `
                    <div class="card-grid-item">
                        <div class="card product-card fill-white radius-25 box-shadow-red no-overflow">
                            <a class="block" href="${item.url}">
                                ${item.image ? `
                                <div class="thumbnail block no-whitespace" style="padding-top: 100%; background-size: cover; background-repeat: no-repeat; background-position: center center; background-image: url('${item.image}');"></div>
                                ` : ''}
                                <div class="text-center space-75-top space-75-left-right">
                                    <div class="title h6 text-uppercase no-overflow-text space-min-bottom">${item.title}</div>
                                    <div class="price label text-red strong">${this.formatMoney(item.price, window.Shopify.moneyFormat)}/-</div> {# Use formatMoney helper #}
                                </div>
                            </a>
                            <div class="product-actions row space-25 no-whitespace">
                                <div class="wishlist columns small-6 space-25">
                                    <button
                                        type="button"
                                        class="button block fill-red text-white wishlist-button in-wishlist" {# Force in-wishlist state for remove button #}
                                        tabindex="0"
                                        data-product-id="${item.id}"
                                        data-product-handle="${item.handle}"
                                        data-product-title="${item.title}"
                                        data-product-image="${item.image}"
                                        data-product-price="${item.price}"
                                        data-product-url="${item.url}"
                                        aria-label="Remove from wishlist"
                                    >
                                        <i class='bx bx-heart text-white' style="display: none;"></i> {# Empty heart (hidden) #}
                                        <i class='bx bxs-heart text-white' style="display: block;"></i> {# Filled heart (visible) #}
                                        <span class="visuallyhidden">Remove from Wishlist</span>
                                    </button>
                                </div>
                                <div class="cart columns small-6 space-25">
                                    <form action="/cart/add" method="post" enctype="multipart/form-data">
                                        <input type="hidden" name="id" value="${item.id}"> {# Assuming product ID is also the default variant ID #}
                                        <button class="button block fill-dark text-white box-shadow-black" type="submit">Add to Cart</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                wishlistContainer.insertAdjacentHTML('beforeend', productCardHtml);
            });

            // Re-append the empty message at the end if it exists in the original HTML
            if (emptyMessage) {
                wishlistContainer.appendChild(emptyMessage);
            }

            // After rendering, re-initialize buttons to attach event listeners to new elements
            this.initButtons();
        } else {
            // If wishlist is empty, just show the empty message
            if (emptyMessage) {
                 wishlistContainer.appendChild(emptyMessage); // Ensure it's in the DOM
                 emptyMessage.style.display = 'block';
            }
        }
    }

    // Helper for money formatting (Shopify's default helper might not be global)
    formatMoney(cents, format) {
        if (typeof cents === 'string') {
            cents = cents.replace('.', ''); // Remove any existing decimal from string if it's formatted
        }
        var moneyFormat = format || '{{ shop.money_format }}'; // Fallback to Liquid's global money format if available
        if (typeof Shopify !== 'undefined' && typeof Shopify.formatMoney === 'function') {
            return Shopify.formatMoney(cents, moneyFormat);
        } else {
            // Basic fallback if Shopify.formatMoney is not available
            var dollars = cents / 100;
            return dollars.toLocaleString(undefined, {style: 'currency', currency: 'USD'}); // Adjust currency as needed
        }
    }
}

// Initialize the wishlist on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Check if the Wishlist class has already been instantiated to prevent duplicates
    if (!window.wishlistInstance) {
        window.wishlistInstance = new Wishlist();
    }
});