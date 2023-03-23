const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { sendMail } = require("../middleware/general");
const User = require("../models/User");
const MainCategory = require("../models/MainCategory");
const ProductCategory = require("../models/ProductCategory");
const SubCategory = require("../models/SubCategory");
const Trending = require("../models/Trending");
const StoreType = require("../models/StoreType");
const Stores = require("../models/Stores");
const ItemSchema = require("../models/ItemCategory");
const ItemList = require("../models/ItemList");

/////////////   common
//create
exports.register = (req, res, next) => {
  console.log(req.body);
  // return;
  const { name, email, password, phone } = req.body;
  let _d = { name, email, password, phone };
  User.find({
    $or: [{ email: req.body.email }, { phone: req.body.phone }],
  }).exec((err, result) => {
    if (err) {
      console.log(err);
      return res.status(409).json({
        error: true,
        message: "Registration Failed. Please try again",
        err,
      });
    }
    if (result.length > 0) {
      // console.log(result);
      return res.status(409).json({
        error: true,
        message:
          "Registration Failed. Account with same credentials already exists",
      });
    }
    // return;
    bcrypt.hash(password, 10, (_err, hash) => {
      if (_err) {
        return res.status(409).json({
          error: true,
          message: "Registration Failed. Hash Error",
          err: _err,
        });
      } else {
        _d.password = hash;
        const _v = new User(_d);
        _v.save((error, user) => {
          if (error || user.length === 0) {
            console.log({ error, user });
            return res.status(409).json({
              error: true,
              message: "Registration Failed",
              err: error,
            });
          }
          let link = `https://jijji.com/activate/${jwt.sign(
            email,
            user.password + user.email
          )}`;
          console.log(link);
          sendMail(email, `Registration Successful: Activate your account`, {
            name,
            title: "Congratulations!!!",
            content:
              "Welcome to Farmland. Your account has been successfully created.\b\n Click on the following link to verify your email",
            label: "Verify Email Account",
            link,
          });
          let ret = user;
          ret.password = null;
          ret.registeredOn = null;
          return res.status(201).json({
            message: "Registration Successful",
            user: ret,
          });
        });
      }
    });
  });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  User.find({
    email,
  }).exec((err, user) => {
    // console.log("err", { err, user });
    if (err || !user) {
      return res.status(409).json({
        error: true,
        message: "Login Failed.",
        err,
        user,
      });
    }

    if (user.length < 1) {
      // console.log("no users", { user });
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
      ret.type = "user";
      ret.password = null;
      ret.registeredOn = null;
      let _ret = {
        ...ret,
        type: "user",
        password: null,
        registeredOn: null,
      };
      // console.log(_ret);
      return res.status(201).json({
        message: "Login Successful",
        data: {
          token: jwt.sign({ user: ret }, "McDan on Jijji.", {
            expiresIn: "1000d",
          }),
        },
      });
    });
  });
};

exports.updatePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  User.find({
    _id: req.headers.user,
  }).exec((err, user) => {
    if (err || !user) {
      return res.status(300).json({
        error: true,
        message: "Password Update Failed.",
        err,
      });
    }

    if (user.length < 1) {
      return res.status(404).json({
        error: true,
        message: "Password Update Failed",
        err,
      });
    }

    if (user[0].lastPasswordChange > 0 && user[0].passwordUpdates > 3) {
      if (Date.now() - user[0].lastPasswordChange < 1000 * 60 * 60 * 24 * 14) {
        return res.status(422).json({
          error: true,
          message:
            "Password Update Failed. You can attempt changing again after two weeks",
          err,
        });
      }
    }
    console.log({ newPassword, oldPassword });
    bcrypt.compare(oldPassword, user[0].password, function (err, result) {
      if (err || !result) {
        console.log("bcrypt", { err, result });
        return res.status(404).json({
          error: true,
          message: "Password Update Failed",
          err: err,
        });
      }
      bcrypt.hash(newPassword, 10, (_err, hash) => {
        if (_err) {
          return res.status(422).json({
            error: true,
            message: "Password Update Failed. Hash Error",
            err: _err,
          });
        } else {
          User.findOneAndUpdate(
            { _id: req.headers.user },
            { password: hash },
            function (err, doc) {
              if (err) {
                return res.status(409).json({
                  error: true,
                  message: "Password Update Failed. Hash Error",
                  err: _err,
                });
              }
              return res.status(201).json({
                error: false,
                message: "Password Update Successful",
              });
            }
          );
        }
      });
    });
  });
};

exports.activate = (req, res, next) => {
  const { email, code } = req.body;

  User.findOne({
    email,
  }).exec((err, user) => {
    // console.log({ ...req.body });
    // console.log(user);
    // console.log("err", { err, user });
    if (err || !user || user.length < 1) {
      return res.status(409).json({
        error: true,
        message: "Verification Failed.",
        err,
      });
    }
    try {
      // console.log(code);
      data = jwt.verify(code, user.password + email);
      if (data === email) {
        console.log("success");
        User.findOneAndUpdate(
          { email },
          { verified: true },
          { new: true },
          function (err, doc) {
            if (err) {
              console.error("err", err);
              return res.status(500).json({
                error: true,
                err,
                message: "Account Verification failed",
              });
            } else {
              console.log(doc);
              return res.status(201).json({
                message: "Account Verified Successfully",
              });
            }
          }
        );
      } else {
        console.log("error");
      }
    } catch (error) {
      return res.status(403).json({
        message: "Verification Failed",
        error,
      });
    }
  });
};

/////////////   common

exports.category = async (req, res, next) => {
  const { title, image } = req.body;
  MainCategory.find({ title }).exec((err, result) => {
    if (err || !result) {
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
  });
};

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

exports.subcategories = async (req, res, next) => {
  const { category, title, image, enabled } = req.body;

  SubCategory.find({
    title,
  }).exec((err, result) => {
    if (err || result.length > 0) {
      console.log(result);
      return res.status(409).json({
        error: true,
        message: "Action Failed. Sub-category with same title already exists",
        err,
      });
    }

    const _d = { category, title, image, enabled };

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
  });
};

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

exports.Productcategory = async (req, res, next) => {
  const {
    name,
    image,
    category,
    subcategory,
    price,
    description,
    condition,
    type,
    brand,
    phone,
    breed,
    region,
    location,
    model,
    year,
    storage,
    fuel,
    transmission,
    meter,
    color,
  } = req.body;
  const { user } = req.headers;

  const _d = {
    name,
    image,
    category,
    subcategory,
    price,
    description,
    condition,
    type,
    brand,
    phone,
    breed,
    region,
    location,
    model,
    year,
    storage,
    fuel,
    transmission,
    meter,
    color,
    request_by: user,
  };

  const subcategorys = new ProductCategory(_d);

  try {
    await subcategorys.save();
    res.status(200).send(subcategorys);
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
};

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
  });
};

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
  });
};

exports.getSubdetails = (req, res, next) => {
  let q = {};

  if (req.params.cat) {
    q.category = req.params.cat;
  }

  if (req.params.sub) {
    q.subcategory = req.params.sub;
  }

  console.log(q);
  console.log(req.params);
  ProductCategory.find(q).exec((err, profiles) => {
    if (err || !profiles) {
      return res.status(409).json({
        error: true,
        message: "No subs Found",
        err,
      });
    }

    if (profiles.length < 1) {
      return res.status(404).json({
        error: true,
        message: "No subs Found",
        err,
      });
    }

    return res.status(201).json({
      message: "Your subs",
      profiles,
    });
  });
};

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
  });
};

exports.Mainstore = async (req, res, next) => {
  const { category, name, image, location } = req.body;
  Stores.find({ name }).exec((err, result) => {
    if (err || !result) {
      console.log(result);
      return res.status(409).json({
        error: true,
        message:
          "Category Addition Failed. Category with same title already exists",
        err,
      });
    }
    const { category, name, image, location } = req.body;
    const { user } = req.headers;
    const _cat = {
      category,
      name,
      image,
      location,
      request_by: user,
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
    const _v = new Stores(_cat);
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
  });
};

exports.getStores = (req, res, next) => {
  // console.log(req.headers.admin)
  let q = { enabled: true };
  if (req.params.filter) {
    q.category = req.params.filter;
  }
  Stores.find(q).exec((err, stores) => {
    if (err || !stores) {
      return res.status(409).json({
        error: true,
        message: "No stores Found",
        err,
      });
    }

    if (stores.length < 1) {
      console.log(stores);
      return res.status(404).json({
        error: true,
        message: "No stores Found",
        err,
      });
    }
    return res.status(201).json({
      message: "All stores",
      stores,
    });
  });
};

//items page filter display
exports.getItemCat = function (req, res, next) {
  let q = { enabled: true };
  if (req.params.filter) {
    q.category = req.params.filter;
  }
  ItemSchema.find(q).exec((err, store) => {
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
  });
};

exports.items = function (req, res, next) {
  const { user } = req.headers;
  const { category, subcategory, store, name, image, price } = req.body;

  const _cat = {
    category,
    subcategory,
    store,
    name,
    image,
    price,
    item_by: user,
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
  const _v = new ItemList(_cat);
  _v.save((error, item) => {
    if (error || item.length > 0) {
      return res.status(409).json({
        error: true,
        message: "Action Failed",
        err: error,
      });
    }
    return res.status(201).json({
      message: "Action Successful",
      item,
    });
  });
};

exports.allstoreitems = async function(req, res, next) {
  
  ItemList.find({}).exec((err, items) => {
    if (err || !items) {
      return res.status(409).json({
        error: true,
        message: "No items Found",
        err,
      });
    }
    if (items.length < 1) {
      console.log(items);
      return res.status(404).json({
        error: true,
        message: "No items Found",
        err,
      });
    }
    return res.status(201).json({
      message: "All category types",
      items,
    });
  });
}

exports.allstorespecifics = async function(req, res, next) {
  
  let q = {};

  if (req.params.cat) {
    q.category = req.params.cat;
  }

  if (req.params.store) {
    q.store = req.params.store;
  }

  console.log(q);
  console.log(req.params);
  ItemList.find(q).exec((err, items) => {
    if (err || !items) {
      return res.status(409).json({
        error: true,
        message: "No subs Found",
        err,
      });
    }

    if (items.length < 1) {
      return res.status(404).json({
        error: true,
        message: "No subs Found",
        err,
      });
    }

    return res.status(201).json({
      message: "Your subs",
      items,
    });
  });
}

exports.filteredstores = async function(req, res, next) {
  
  let q = {};

  if (req.params.cat) {
    q.category = req.params.cat;
  }

  if (req.params.sub) {
    q.subcategory = req.params.sub;
  }

  if (req.params.store) {
    q.store = req.params.store;
  }

  console.log(q);
  console.log(req.params);
  ItemList.find(q).exec((err, items) => {
    if (err || !items) {
      return res.status(409).json({
        error: true,
        message: "No subs Found",
        err,
      });
    }

    if (items.length < 1) {
      return res.status(404).json({
        error: true,
        message: "No subs Found",
        err,
      });
    }

    return res.status(201).json({
      message: "Your subs",
      items,
    });
  });
}