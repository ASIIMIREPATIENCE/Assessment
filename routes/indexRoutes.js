const express = require("express");
const router = express.Router();
const Registration = require('../models/Signup');
const Product = require('../models/Product');
const passport = require('passport');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
        return res.status(400).send('Only images allowed');
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET routes
router.get('/register', (req, res) => {
    res.render('signup');
});

router.get('/login', (req, res) => {
    res.render('login');
});

// POST routes
router.post('/signup', async (req, res) => {
    const { fullname, email, phone, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.render('signup', { 
            error: 'Passwords do not match' 
        });
    }

    try {
        const user = new Registration({ fullname, email, phone });
        await Registration.register(user, password);
        
        // Show success message on signup page
        res.render('signup', { 
            success: 'Account created successfully! - Login'
        });
        
    } catch (error) {
        res.render('signup', { 
            error: error.message 
        });
    }
});

router.post('/login', 
    passport.authenticate('local', {
        successRedirect: '/congrat',
        failureRedirect: '/login'
    })
);

router.get('/congrat', (req, res) => {
    res.render('congrat');
});



// Dashboard route
router.get('/dash', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        
        // Calculate total stock value (sum of price × quantity for all products)
        const totalStockValue = products.reduce((sum, product) => {
            return sum + (product.price * product.quantity);
        }, 0);
        
        // Get messages from session and clear them
        const success = req.session.success;
        const error = req.session.error;
        
        // Clear messages after reading
        req.session.success = null;
        req.session.error = null;
        
        res.render('dashboard', { 
            products: products,
            totalStockValue: totalStockValue,
            success: success,
            error: error
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading dashboard');
    }
});

// Add product with image upload
router.post('/add-product', upload.single('productImage'), async (req, res) => {
    const { productName, category, price, quantity, color } = req.body;
    
    let imageUrl = '';
    if (req.file) {
        imageUrl = '/uploads/' + req.file.filename;
    }

    // Validate all fields
    if (!productName || !category || !price || !quantity || !color) {
        req.session.error = 'All fields are required!';
        return res.redirect('/dash');
    }

    try {
        const newProduct = new Product({
            productName,
            category,
            price: Number(price),
            quantity: Number(quantity),
            color: color || 'N/A',
            imageUrl: imageUrl
        });

        await newProduct.save();
        
        // Set success message
        req.session.success = 'Product added successfully!';
        res.redirect('/dash');
        
    } catch (error) {
        console.error(error);
        req.session.error = 'Error saving product: ' + error.message;
        res.redirect('/dash');
    }
});

module.exports = router;