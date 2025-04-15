document.addEventListener('DOMContentLoaded', () => {
    const quantityInputs = document.querySelectorAll('.cart__quantity-input');
    const quantityMinusButtons = document.querySelectorAll('.cart__quantity-button--minus');
    const quantityPlusButtons = document.querySelectorAll('.cart__quantity-button--plus');
    const cartSubtotalAmount = document.querySelector('.cart__subtotal-amount');

    const updateCart = (itemId, quantity) => {
      console.log('Updating cart:', itemId, quantity);
      fetch('/cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: itemId,
          quantity: quantity
        })
      })
      .then(response => {
        console.log('Response:', response);
        return response.json();
      })
      .then(data => {
        console.log('Data received:', data); // Log the entire data object

        const itemRow = document.querySelector(`.cart__item[data-item-key="${itemId}"]`);
        if (itemRow) {
          const itemTotalPrice = itemRow.querySelector('.cart__total');
          if (itemTotalPrice) {
            const updatedItem = data.items.find(item => item.key === itemId);
            if (updatedItem) {
              itemTotalPrice.textContent = Shopify.formatMoney(updatedItem.final_line_price, theme.moneyFormat);
              console.log('Updated item total:', itemTotalPrice.textContent); // Log the updated value
            } else {
              console.warn('Item not found in updated data:', itemId);
            }
          } else {
            console.warn('Could not find item total element for:', itemId);
          }
        } else {
          console.warn('Could not find item row for:', itemId);
        }

        if (cartSubtotalAmount) {
          cartSubtotalAmount.textContent = Shopify.formatMoney(data.total_price, theme.moneyFormat);
          console.log('Updated subtotal:', cartSubtotalAmount.textContent); // Log the updated subtotal
        } else {
          console.warn('Could not find cart subtotal element');
        }

        const cartItemCount = document.querySelector('.cart-item-count');
        if (cartItemCount && data.item_count !== undefined) {
          cartItemCount.textContent = data.item_count;
          console.log('Updated cart item count:', cartItemCount.textContent);
        }
      })
      .catch((error) => {
        console.error('Error updating cart:', error);
      });
    };

    quantityMinusButtons.forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.id;
        const input = document.querySelector(`#updates_${itemId}`);
        let quantity = parseInt(input.value);
        if (quantity > 0) {
          quantity--;
          input.value = quantity;
          updateCart(itemId, quantity);
        }
      });
    });

    quantityPlusButtons.forEach(button => {
      button.addEventListener('click', () => {
        const itemId = button.dataset.id;
        const input = document.querySelector(`#updates_${itemId}`);
        let quantity = parseInt(input.value);
        quantity++;
        input.value = quantity;
        updateCart(itemId, quantity);
      });
    });

    quantityInputs.forEach(input => {
      input.addEventListener('change', () => {
        const itemId = input.dataset.id;
        const quantity = parseInt(input.value);
        if (!isNaN(quantity) && quantity >= 0 && parseInt(input.defaultValue) !== quantity) {
          updateCart(itemId, quantity);
        }
      });
    });
  });