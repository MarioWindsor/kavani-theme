document.addEventListener('DOMContentLoaded', function() {
	const wishlistButtons = document.querySelectorAll('.wishlist-button'); // Use a consistent class for your buttons

	wishlistButtons.forEach(button => {
		button.addEventListener('click', function(event) {
			// console.log(this);
			// event.preventDefault();
			const productId = this.dataset.productId;
			const action = this.dataset.action; // 'add' or 'remove'

			console.log(productId);
			console.log(action);

		});
	});
});