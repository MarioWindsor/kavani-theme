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
		const wishlistContainer = document.getElementById('wishlist-items-container');
		// MODIFIED: Query for the empty message directly from the document
		const emptyMessage = document.querySelector('.empty-wishlist-message');

		if (!wishlistContainer) {
			return; // Not on the wishlist page, so do nothing
		}

		const items = this.getWishlistItems();

		// Clear existing content in the product items container
		wishlistContainer.innerHTML = '';

		if (items.length > 0) {
			// If there are items, hide the empty message
			if (emptyMessage) {
				emptyMessage.style.display = 'none';
			}

			items.forEach(item => {
				const productCardHtml = `

					<style>
					.product-card { position: relative; }

					.product-card .thumbnail {
						position: relative;
						padding-top: 125%;
						background-size: cover;
						background-repeat: no-repeat;
						background-position: center center;
					}
					.product-card .thumbnail .second-image {
						position: absolute;
						padding-top: 125%;
						background-size: cover;
						background-repeat: no-repeat;
						background-position: center center;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						opacity: 0;
						transition: .3s ease-out;
					}

					.product-card:hover .thumbnail .second-image,
					.product-card:focus-within .thumbnail .second-image {
						opacity: 1;
					}

					.product-card .wishlist {
						position: absolute;
						top: var(--space-50);
						right: var(--space-50);
					}
					.product-card .wishlist .icon-button {
						cursor: pointer;
						position: relative;
						width: var(--space-175);
						height: var(--space-175);
						border-radius: 100%;
						background-color: rgba(var(---white), 0.666);
						font-size: 0;
						padding: 0;
					}


					/* CSS for the wishlist button state */
					.wishlist-button.in-wishlist i.bx-heart {
					    display: none; /* Hide empty heart when in wishlist */
					}
					.wishlist-button.in-wishlist i.bxs-heart {
					    display: block; /* Show filled heart when in wishlist */
					}
					.wishlist-button i.bxs-heart {
					    display: none; /* Hide filled heart by default (only show if .in-wishlist) */
					}


					.product-card .wishlist .icon-button * { pointer-events: none; }

					.product-card .wishlist .icon-button i {
						font-size: var(--h3);
						position: absolute;
						top: 50%;
						left: 50%;
						transform: translate(-50%, -46%);
					}

					@media( min-width: 640px )  {}
					@media( min-width: 1040px ) {
						.product-card .wishlist .icon-button {
							width: var(--space-125);
							height: var(--space-125);
						}
						.product-card .wishlist .icon-button i {
							font-size: var(--h5);
						}
					}
					@media( min-width: 1480px ) {}
					</style>

					<div class="card-grid-item">
					
						<div class="card product-card fill-white no-overflow">
							<a class="block" href="${item.url}">
								${item.image ? `
								<div class="thumbnail block no-whitespace" style="background-image: url('{{ product.featured_image | img_url: 'large' }}');"></div>
								` : ''}
								<div class="text-center space-75">
									<div class="title label text-uppercase space-min-bottom no-overflow-text">${item.title}</div>
									<div class="price small text-red strong">${item.price}/-</div>
								</div>
							</a>
							<div class="wishlist">
								<button
									type="button"
									class="wishlist-button icon-button"
									tabindex="0"
									data-product-id="${item.id }"
									data-product-handle="${item.handle}"
									data-product-title="${item.title}"
									data-product-image="${item.image}"
									data-product-price="${item.price}"
									data-product-url="${item.url}"
									aria-label="Add to wishlist"
								>
									<i class='bx bx-heart text-red'></i> {# Empty Heart #}
									<i class='bx bxs-heart text-red'></i> {# Filled Heart #}
									<span class="visuallyhidden">Toggle Wishlist</span>
								</button>
							</div>
						</div>

					</div>
				`;
				wishlistContainer.insertAdjacentHTML('beforeend', productCardHtml);
			});

			// No longer re-appending emptyMessage, as it's outside the container
			// The emptyMessage.style.display is handled at the beginning/end of this block
			
			// After rendering, re-initialize buttons to attach event listeners to new elements
			this.initButtons();
		} else {
			// If wishlist is empty, show the empty message
			if (emptyMessage) {
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