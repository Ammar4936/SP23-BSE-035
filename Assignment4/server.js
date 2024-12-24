const express = require("express");
const cookieParser = require('cookie-parser');
const path = require('path');
const { isAuthenticated } = require('./middleware/auth.middleware');
const { isAdmin } = require('./middleware/adminAuth.middleware');
let app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// EJS Layout configuration
var expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "layout"); // Set default layout
app.set("view engine", "ejs");

// Static files
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));
app.use('/bills', express.static(path.join(__dirname, 'public', 'bills')));

// Session configuration
const session = require('express-session');
app.use(session({
    secret: 'authentication',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Apply authentication middleware
app.use(isAuthenticated);
app.use(isAdmin);

// Routes
let userRouter = require("./routes/user.router");
let adminRouter = require("./routes/admin/auth.router");
let productsRouter = require("./routes/admin/products.router");
let shopRouter = require("./routes/products.router");
let ordersRouter = require("./routes/orders.router");
app.use(userRouter);
app.use(adminRouter);
app.use(productsRouter);
app.use(shopRouter);
app.use(ordersRouter);

// Add these routes
app.get('/cart', (req, res) => {
    res.render('pages/Main_Site_pages/cart', {
        layout: false,
        isAuthenticated: res.locals.isAuthenticated,
        isAdmin: res.locals.isAdmin
    });
});

app.get('/checkout', (req, res) => {
    try {
        res.render('pages/Main_Site_pages/checkout', {
            layout: false,
            isAuthenticated: res.locals.isAuthenticated,
            isAdmin: res.locals.isAdmin
        });
    } catch (error) {
        console.error('Error rendering checkout page:', error);
        res.status(500).send('Error loading checkout page');
    }
});

app.get('/order-confirmation', (req, res) => {
    res.render('pages/Main_Site_pages/order-confirmation', {
        layout: false,
        isAuthenticated: res.locals.isAuthenticated,
        isAdmin: res.locals.isAdmin
    });
});

// MongoDB connection
const mongoose = require("mongoose");
let connectionstring = "mongodb://127.0.0.1:27017/Outfitters"
mongoose.connect(connectionstring)
.then(() => {
    console.log(`Connected to ${connectionstring}`)
})
.catch(() => {
    console.log("error")
});

// Landing page route
app.get("/", (req, res) => {
    res.render("pages/Main_Site_pages/landingPage", { 
        layout: false,
        isAuthenticated: res.locals.isAuthenticated,
        isAdmin: res.locals.isAdmin
    });
});

const PORT = process.env.PORT || 5000;

function startServer(port) {
    app.listen(port, () => {
        console.log(`Server started at location: ${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is already in use. Trying ${port}...`);
            startServer(port);
        } else {
            console.error('Server error:', err);
        }
    });
}

startServer(PORT);

// Make sure partials are accessible
app.set('views', path.join(__dirname, 'views'));