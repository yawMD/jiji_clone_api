const Admin = require('../models/Admin')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require('../models/User')
const MainCategory = require('../models/MainCategory')
const ProductCategory = require('../models/ProductCategory')
const SubCategory = require('../models/SubCategory');
const Trending = require('../models/Trending');
const StoreType = require('../models/StoreType');
const ItemSchema = require('../models/ItemCategory');
const ItemList = require('../models/ItemList');

// Create
exports.register = (req, res, next) => {
    //   console.log(req.body);
    Admin.find({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    }).exec((err, result) => {
      if (err || result.length > 0) {
        console.log(result);
        return res.status(409).json({
          error: true,
          message:
            "Registration Failed. Account with same credentials already exists",
          err,
        });
      }
      const { name, email, password, phone } = req.body;
      bcrypt.hash(password, 10, (_err, hash) => {
        if (_err) {
          return res.status(409).json({
            error: true,
            message: "Registration Failed. Hash Error",
            err: _err,
          });
        } else {
          const _v = new Admin({
            name,
            email,
            password: hash,
            phone,
          });
          _v.save((error, user) => {
            if (error || user.length > 0) {
              return res.status(409).json({
                error: true,
                message: "Registration Failed",
                err: error,
              });
            }
            let ret = user;
            ret.password = null;
            ret.registeredOn = null;
            ret.userType = "user";
            return res.status(201).json({
              message: "Registration Successful",
              user: ret,
            });
          });
        }
      });
    });
  };

  // Reads
exports.login = (req, res, next) => {
    // const { name, email, password, business, type, phone } = req.body
    // console.log({ name, email, password, business, type, phone })
    // console.log(req.body);
    // return
    const { email, password } = req.body;
    Admin.find({
      email,
    }).exec((err, user) => {
      if (err || !user) {
        console.log("err", { err, user });
        return res.status(409).json({
          error: true,
          message: "Login Failed.",
          err,
          user,
        });
      }
  
      if (user.length < 1) {
        console.log("no users", { user });
        return res.status(404).json({
          error: true,
          message: "Login Failed",
          err,
        });
      }
      bcrypt.compare(password, user[0].password, function (err, result) {
        if (err || !result) {
          console.log("bcrypt", { err, result });
          return res.status(422).json({
            error: true,
            message: "Login Failed",
            err: err,
          });
        }
        let ret = user[0]._doc;
        ret.type = "admin";
        ret.password = null;
        ret.registeredOn = null;
        let _ret = {
          ...ret,
          type: "admin",
          password: null,
          registeredOn: null,
        };
        console.log(_ret);
        return res.status(201).json({
          message: "Login Successful",
          data: {
            token: jwt.sign({ user: ret }, "McDan on Jijji.", {
              expiresIn: "1d",
            }),
          },
        });
      });
    });
  };

  exports.checkAuth = (req, res, next) => {
    Admin.find().exec((err, user) => {
      if (err) {
        console.log("err", { err, user });
        return res.status(409).json({
          error: true,
          message: "Auth Failed.",
          err,
          user,
        });
      }
  
      if (user.length > 0) {
        return res.status(404).json({
          error: true,
          new: false,
          user,
          message: "Auth Failed",
          err,
        });
      } else {
        return res.status(201).json({
          new: true,
          message: "Auth Failed",
        });
      }
    });
  };

  exports.users = (req, res) => {
    User.find({}).exec((err, users) => {
      if (err || !users) {
        console.log("err", { err, users });
        return res.status(409).json({
          error: true,
          message: "Error Fetching Users.",
          err,
        });
      }
  
      if (users.length < 1) {
        console.log("no users", { users });
        return res.status(404).json({
          error: true,
          message: "0 Registered Users Found",
          err,
        });
      }
  
      return res.status(201).json({
        message: "All Registered Users",
        users,
      });
    });
  };
  
  exports.category = async(req, res, next) => {
    const { title, image } = req.body
    MainCategory.find({title}).exec((err, result)=>{
        if(err || !result){
            console.log(result);
            return res.status(409).json({
              error: true,
              message:
                "Category Addition Failed. Category with same title already exists",
              err,
            });
        }
        const { title, image } = req.body;
    const { user } = req.headers;
    const _cat = {
      title,
      image,
      request_by: user,
      enabled: false,
      slug: encodeURI(
        title
          .toLowerCase()
          .replace(/\s/g, "-")
          .replace(/\?/g, "")
          .replace(/&/g, "")
          .replace(/\$/g, "")
          .replace(/\(/g, "")
          .replace(/\)/g, "")
          .replace(/[-]+/g, "-")
          .replace(/'/g, "")
          .replace(/"/g, "")
      ),
    };
    console.log(_cat);
    const _v = new MainCategory(_cat);
    _v.save((error, service) => {
      if (error || service.length > 0) {
        return res.status(409).json({
          error: true,
          message: "Action Failed",
          err: error,
        });
      }
      return res.status(201).json({
        message: "Action Successful",
        service,
      });
    });
    })
  }

  exports.getCategories = (req, res, next) => {
    // console.log(req.headers.admin)
    MainCategory.find({}).exec((err, categories) => {
      if (err || !categories) {
        return res.status(409).json({
          error: true,
          message: "No Categories Found",
          err,
        });
      }
  
      if (categories.length < 1) {
        console.log(categories);
        return res.status(404).json({
          error: true,
          message: "No Categories Found",
          err,
        });
      }
  
      return res.status(201).json({
        message: "All Categories",
        categories,
      });
    });
  };

  exports.subcategories = async(req, res, next)=>{
    const {category, title, image, enabled} = req.body
  

    SubCategory.find({ 
      title
    }).exec((err, result) => {
      if (err || result.length > 0) {
      console.log(result);
      return res.status(409).json({
        error: true,
        message: "Action Failed. Sub-category with same title already exists",
        err,
      });
    }

    const _d = {category, title, image, enabled}

    const _v = new SubCategory(_d);
    _v.save((error, subcategories) => {
      if (error || subcategories.length > 0) {
        return res.status(409).json({
          error: true,
          message: "Action Failed",
          err: error,
        });
      }
      return res.status(201).json({
        message: "Action Successful",
        subcategories,
      });
    });

    })
    
  }

  exports.getSubcategories = (req, res, next) => {
    let q = { enabled: true };
    if (req.params.filter) {
      q.category = req.params.filter;
    }
    SubCategory.find(q).exec((err, subcategory) => {
      if (err || !subcategory) {
        return res.status(409).json({
          error: true,
          message: "No subcategory Found",
          err,
        });
      }
  
      if (subcategory.length < 1) {
        console.log(subcategory);
        return res.status(404).json({
          error: true,
          message: "No subcategory Found",
          err,
        });
      }
      return res.status(201).json({
        message: "All subcategory",
        subcategory,
      });
    });
  };


  exports.Productcategory = async(req, res, next)=>{
    const {name, image, category, subcategory, price, description, condition, type, brand, phone, color} = req.body
    const {user} = req.headers

    const _d = {name, image, category, subcategory, price, description, condition, type, brand, phone, color, request_by:user}

    const subcategorys = new ProductCategory(_d)
    
    try{
      await subcategorys.save()
      res.status(200).send(subcategorys)
    }catch(err){
      console.log(err)
      res.status(404).send(err)
    }
  }



  exports.getProductcategory = (req, res, next) => {
    // console.log(req.headers.admin)
    let q = { enabled: true };
    if (req.params.filter) {
      q.category = req.params.filter;
    }
    ProductCategory.find(q).exec((err, subcategory) => {
      if (err || !subcategory) {
        return res.status(409).json({
          error: true,
          message: "No subcategory Found",
          err,
        });
      }
  
      if (subcategory.length < 1) {
        console.log(subcategory);
        return res.status(404).json({
          error: true,
          message: "No subcategory Found",
          err,
        });
      }
      return res.status(201).json({
        message: "All subcategory",
        subcategory,
      });
    });
  };

  exports.getAllProducts = function (req, res, next) {
    ProductCategory.find({}).exec((err, products) => {
      if (err || !products) {
        return res.status(409).json({
          error: true,
          message: "No products Found",
          err,
        });
      }
      if (products.length < 1) {
        console.log(products);
        return res.status(404).json({
          error: true,
          message: "No products Found",
          err,
        });
      }
      return res.status(201).json({
        message: "All products",
        products,
      });
    })
  }

  exports.trending = async function(req, res, next) {
    const {name, image, category, subcategory, price, description, condition, type, brand, phone, color} = req.body
    const {user} = req.headers

    const __d = {name, image, category, subcategory, price, description, condition, type, brand, phone, color,user}

    try{
      const trending = new Trending(__d)
      await trending.save()
      res.status(200).send(trending)
    }catch(err){
      console.log(err)
      res.status(404).send(err)
    }
  }

  exports.getTrending = function (req, res, next) {
    Trending.find({}).exec((err, products) => {
      if (err || !products) {
        return res.status(409).json({
          error: true,
          message: "No products Found",
          err,
        });
      }
      if (products.length < 1) {
        console.log(products);
        return res.status(404).json({
          error: true,
          message: "No products Found",
          err,
        });
      }
      return res.status(201).json({
        message: "All products",
        products,
      });
    })
  }

  exports.storetype = async(req, res, next) => {
    const { name, image } = req.body
    StoreType.find({name}).exec((err, result)=>{
        if(err || !result){
            console.log(result);
            return res.status(409).json({
              error: true,
              message:
                "Store Type Addition Failed. Category with same title already exists",
              err,
            });
        }
        const { name, image } = req.body;
    const { user } = req.headers;
    const _cat = {
      name,
      image,
      request_by: user,
      enabled: false,
      slug: encodeURI(
        name
          .toLowerCase()
          .replace(/\s/g, "-")
          .replace(/\?/g, "")
          .replace(/&/g, "")
          .replace(/\$/g, "")
          .replace(/\(/g, "")
          .replace(/\)/g, "")
          .replace(/[-]+/g, "-")
          .replace(/'/g, "")
          .replace(/"/g, "")
      ),
    };
    console.log(_cat);
    const _v = new StoreType(_cat);
    _v.save((error, store) => {
      if (error || store.length > 0) {
        return res.status(409).json({
          error: true,
          message: "Action Failed",
          err: error,
        });
      }
      return res.status(201).json({
        message: "Action Successful",
        store,
      });
    });
    })
  }

  exports.getStoretype = function (req, res, next) {
    StoreType.find({}).exec((err, store) => {
      if (err || !store) {
        return res.status(409).json({
          error: true,
          message: "No Store type Found",
          err,
        });
      }
      if (store.length < 1) {
        console.log(store);
        return res.status(404).json({
          error: true,
          message: "No Store type Found",
          err,
        });
      }
      return res.status(201).json({
        message: "All store types",
        store,
      });
    })
  }

  exports.itemCategory = function(req, res, next) {
      const {category, name, image } = req.body
      ItemSchema.find({name}).exec((err, result)=>{
          if(err || !result){
              console.log(result);
              return res.status(409).json({
                error: true,
                message:
                  "Store Type Addition Failed. Category with same title already exists",
                err,
              });
          }
          const { category,name, image } = req.body;
      const { user } = req.headers;
      const _cat = {
        category,
        name,
        image,
        slug: encodeURI(
          name
            .toLowerCase()
            .replace(/\s/g, "-")
            .replace(/\?/g, "")
            .replace(/&/g, "")
            .replace(/\$/g, "")
            .replace(/\(/g, "")
            .replace(/\)/g, "")
            .replace(/[-]+/g, "-")
            .replace(/'/g, "")
            .replace(/"/g, "")
        ),
      };
      console.log(_cat);
      const _v = new ItemSchema(_cat);
      _v.save((error, store) => {
        if (error || store.length > 0) {
          return res.status(409).json({
            error: true,
            message: "Action Failed",
            err: error,
          });
        }
        return res.status(201).json({
          message: "Action Successful",
          store,
        });
      });
      })
  }

  exports.getItemCat = function (req, res, next) {
    ItemSchema.find({}).exec((err, store) => {
      if (err || !store) {
        return res.status(409).json({
          error: true,
          message: "No category type Found",
          err,
        });
      }
      if (store.length < 1) {
        console.log(store);
        return res.status(404).json({
          error: true,
          message: "No category type Found",
          err,
        });
      }
      return res.status(201).json({
        message: "All category types",
        store,
      });
    })
  }

