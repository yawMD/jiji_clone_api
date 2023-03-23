const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");

const {
register,
login,
updatePassword,
activate,
category,
getCategories,
subcategories,
getSubcategories,
Productcategory,
getProductcategory,
getAllProducts,
getTrending,
getSubdetails,
Mainstore,
getStoretype,
getStores,
getItemCat,
allstoreitems,
items,
allstorespecifics,
filteredstores
} = require('../controllers/user')

//post requests
router.post('/users' ,register);
router.post('/activate', activate);
router.post('/login', login);
// router.post('/category', auth, category);
router.post('/mainstore', auth, Mainstore);
router.post('/product', auth, Productcategory);
router.post('/item', auth, items)

// get requests
router.get('/category', getCategories);
router.get('/storetype',getStoretype);
router.get('/all',getAllProducts);
router.get('/stores/:filter',getStores)
router.get('/subcategories/:filter', getSubcategories);
router.get('/products/:filter', getProductcategory);
router.get('/trending', getTrending);
router.get('/itemcat/:filter', getItemCat);
router.get("/products/:cat/:sub", getSubdetails);
router.get('/items', allstoreitems) // all items
router.get("/items/:cat/:store", allstorespecifics)
router.get("/itemfilter/:cat/:sub/:store", filteredstores)


router.patch("/passwordUpdates", updatePassword);

module.exports = router;