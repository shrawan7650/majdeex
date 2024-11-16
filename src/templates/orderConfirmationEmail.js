exports.orderConfirmationEmail = (confirmedOrder) => {
  const { orderId, totalAmount, products } = confirmedOrder;
  console.log("confirmordertemplate", confirmedOrder);
  return `
    <html>
    <head>
      <style>
        /* Styles remain unchanged */
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Order Confirmation</h2>
        </div>
        <div class="content">
          <p>Thank you for your purchase! Your order ID is <strong>${orderId}</strong>.</p>
          <p>Total Amount: ₹${totalAmount.toFixed(2)}</p>
          <div class="order-summary">
            <h3>Order Details</h3>
            ${products
              .map(
                (product) => `
              <div class="product">
                <p class="product-name">${product.name}</p>
                <p class="product-details">Quantity: ${product.quantity}</p>
                <p class="product-details">Price: ₹${product.price.toFixed(2)}</p>
              </div>
            `
              )
              .join("")}
          </div>
          <p>We are currently processing your order and will update you once it ships.</p>
        </div>
        <div class="footer">
          <p>Thank you for shopping with us!</p>
          <p>Contact us for any questions regarding your order.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
