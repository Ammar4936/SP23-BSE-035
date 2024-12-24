const express = require("express");
const cookieParser = require('cookie-parser');
const { isAuthenticated } = require('./middleware/auth.middleware');
const { isAdmin } = require('./middleware/adminAuth.middleware');
let app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// EJS Layout configuration
var expressLayouts = require("express-ejs-layouts");
app.use(expressLayouts);
app.set("layout", "layout"); // Set default layout
app.set("view engine", "ejs");

// Static files
app.use(express.static("public"));
app.use('/uploads', express.static('uploads')); // Serve uploaded files

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
app.get("/add-to-wishlist/:id",(req,res)=>{
    let wishlist = req.cookies.wishlist; // Read the wishlist cookie
  console.log("Initial Wishlist:", wishlist);
  
  if (wishlist && typeof wishlist === 'string') {
    wishlist = wishlist.trim(); 
    console.log("Trimmed Wishlist:", wishlist);
    try {
      wishlist = JSON.parse(wishlist); // Parse the wishlist JSON
    } catch (err) {
      console.error("Error parsing wishlist JSON:", err.message);
      wishlist = []; // If parsing fails, reset to an empty array
    }
  } else {
    wishlist = []; // Initialize as an empty array if no cookie exists
  }
  
  // Check if the product ID is already in the wishlist
  if (!wishlist.includes(req.params.id)) {
    wishlist.push(req.params.id); // Add the product ID if it's not already in the wishlist
  }
  
  console.log("Updated Wishlist:", wishlist);
  res.cookie("wishlist", JSON.stringify(wishlist)); // Store the updated wishlist back as a cookie
  res.redirect("/"); // Redirect back to the homepage or another relevant page
  });
  
  app.get("/wishlist", async (req, res) => {
    let wishlist = req.cookies.wishlist;
  
    // Parse the wishlist cookie
    if (wishlist && typeof wishlist === 'string') {
      wishlist = wishlist.trim();
      try {
        wishlist = JSON.parse(wishlist);
      } catch (err) {
        console.error("Error parsing wishlist JSON:", err.message);
        wishlist = [];
      }
    } else {
      wishlist = [];
    }
  
    // Fetch product details from the 'category' collection using the product IDs
    let products = await category.find({ _id: { $in: wishlist } });
  
    // Convert Mongoose objects to plain objects for rendering
    let wishlistProducts = products.map((product) => {
      return product.toObject();
    });
  
    console.log("Wishlist Products:", wishlistProducts);
  
    // Render the wishlist page
    return res.render("wishlist", { products: wishlistProducts });
  });
  
  app.get("/remove-from-wishlist/:id", (req, res) => {
    let wishlist = req.cookies.wishlist;
  
    if (wishlist && typeof wishlist === 'string') {
      wishlist = wishlist.trim();
      try {
        wishlist = JSON.parse(wishlist);
      } catch (err) {
        console.error("Error parsing wishlist JSON:", err.message);
        wishlist = [];
      }
    } else {
      wishlist = [];
    }
  
    // Remove the product from the wishlist
    wishlist = wishlist.filter(id => id !== req.params.id);
  
    // Update the cookie
    res.cookie("wishlist", JSON.stringify(wishlist));
  
    // Redirect back to the wishlist page
    res.redirect("/wishlist");
  });
  
  



// Apply authentication middleware
app.use(isAuthenticated);
app.use(isAdmin);

// Routes
let userRouter = require("./routes/user.router");
let adminRouter = require("./routes/admin/auth.router");
let productsRouter = require("./routes/admin/products.router");
let shopRouter = require("./routes/products.router");
app.use(userRouter);
app.use(adminRouter);
app.use(productsRouter);
app.use(shopRouter);

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

app.listen(5004, () => {
    console.log("Server started at location : 5004");
});