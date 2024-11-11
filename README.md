project-root/
├── src/                           // Main application source code
│   ├── config/                    // Configuration files
│   │   ├── db.js                  // Database connection and configuration
│   │   ├── encryption.js          // Data encryption utilities
│   │   └── emailConfig.js         // Email service configuration
│   ├── controllers/               // Logic for handling API requests
│   │   ├── productController.js   // Handles product browsing, search, and details
│   │   ├── cartController.js      // Manages cart operations (add, update, delete) and checkout
│   │   ├── orderController.js     // Handles orders, purchase history, order status, and tracking
│   │   ├── authController.js      // Manages user authentication (login, registration, session handling)
│   │   ├── couponController.js    // Manages coupon generation and validation
│   │   ├── learningController.js  // Handles learning-related functionalities (if any)
│   │   └── wishlistController.js  // Manages user wishlist functionality
│   ├── middleware/                // Middleware functions
│   │   ├── authMiddleware.js      // Verifies user authentication status
│   │   └── validationError.js     // Handles validation errors and responses
│   ├── models/                    // Mongoose models (schemas for MongoDB)
│   │   ├── User.js                // User schema (handles user profile and data)
│   │   ├── Coupon.js              // Coupon schema (for storing coupon codes and validation)
│   │   ├── Purchase.js            // Purchase schema (tracks completed orders)
│   │   ├── TemporaryOrder.js      // Temporary order schema (if applicable for orders in progress)
│   │   ├── Wishlist.js            // Wishlist schema (for user saved products)
│   │   ├── Product.js             // Product schema (product details and specifications)
│   │   ├── Order.js               // Order schema (contains order details and history)
│   │   └── Cart.js                // Cart schema (stores items in a user's cart)
│   ├── routes/                    // API routes and endpoint mappings
│   │   ├── productRoutes.js       // Routes related to product browsing and details
│   │   ├── cartRoutes.js          // Routes for cart operations and checkout
│   │   ├── orderRoutes.js         // Routes for order history and tracking
│   │   ├── authRoutes.js          // Routes for user authentication
│   │   ├── couponRoutes.js        // Routes for coupon management
│   │   ├── learningRoutes.js      // Routes for learning-related features
│   │   └── wishlistRoutes.js      // Routes for managing wishlist functionality
│   ├── utils/                     // Utility functions and helpers
│   │   ├── apiResponse.js         // Standard API response handler
│   │   └── sendEmail.js           // Handles sending email (order confirmation, promotions, etc.)
│   ├── templates/                 // Email templates and other templates
│   │   └── orderConfirmationEmail.js // Order confirmation email template
│   |---index.js                    // Main server file for starting the application (Express setup)
|   |---app.js 
├── .gitignore                     // Git ignore file (to avoid pushing sensitive files and node_modules to version control)
├── package.json                   // Project dependencies and npm scripts
├── package-lock.json              // Lock file for npm dependencies
|
└── .env                           // Environment variables (sensitive data like DB connection strings, API keys)
└── README.md                      // Project documentation (setup, usage instructions)
//schema digram
