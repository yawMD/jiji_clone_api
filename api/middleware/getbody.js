const jwt = require("jsonwebtoken");

module.exports.body = (req, res, next) => {
  let code = parseInt(new Date().valueOf() / 10000);
  let phrase = "McDan on Jijji.";
  let secret = phrase;
  const token = req.body.token.replace(/"/g, "");
  // console.log(token);
  try {
    data = jwt.verify(token, secret);
    req.body = data;
    next();
  } catch (error) {
    // console.log(error);
    return res.status(403).json({
      message: "Request Failed",
      error,
    });
  }
};
