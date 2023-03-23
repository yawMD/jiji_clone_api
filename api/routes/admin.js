const express = require('express');
const router = express.Router();
const { body } = require("../middleware/getbody");
const auth = require('../middleware/auth');
const { 
    register,
    login,
    checkAuth,
    users,
    category,
    subcategories,
    Productcategory,
    getCategories,
    getAllProducts,
    getSubcategories,
    getProductcategory,
    trending,
    getTrending,
    storetype,
    itemCategory,
    getItemCat
} = require("../controllers/admin")

router.post("/register", register);
router.post("/isAuth", checkAuth);
router.post("/login", login);
router.post('/category', auth, category);
router.post('/subcategories', auth, subcategories);
router.post('/product', auth, Productcategory);
router.post('/trending', auth, trending);
router.post('/storetype', auth, storetype);
router.post('/itemcategory',auth,itemCategory)

router.get("/customers", auth, users);
router.get('/category', getCategories);
router.get('/all',getAllProducts)
router.get('/subcategories/:filter', getSubcategories);
router.get('/products/:filter', getProductcategory);
router.get('/itemcat/:filter', getItemCat);
router.get("/trending", auth, getTrending);


module.exports = router;
