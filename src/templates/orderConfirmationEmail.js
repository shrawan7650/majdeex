exports.orderConfirmationEmail = (orderId, totalAmount, products) => {
  return `
    <html>
    <head>
      <style>
        .container {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          padding: 20px;
          border-radius: 5px;
          max-width: 600px;
          margin: auto;
        }
        .header {
          background-color: #4CAF50;
          color: white;
          text-align: center;
          padding: 10px 0;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
        }
        .content p, .product {
          line-height: 1.6;
        }
        .order-summary {
          margin: 20px 0;
          padding: 15px;
          background-color: #fff;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        .product {
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .product:last-child {
          border-bottom: none;
        }
        .product-name {
          font-weight: bold;
        }
        .product-details {
          font-size: 14px;
          color: #555;
        }
        .footer {
          text-align: center;
          padding: 10px;
          font-size: 12px;
          color: #555;
        }
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
            ${products.map(product => `
              <div class="product">
                <p class="product-name">${product.name}</p>
                <p class="product-details">Quantity: ${product.quantity}</p>
                <p class="product-details">Price: ₹${product.price.toFixed(2)}</p>
              </div>
            `).join('')}
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
