const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
require('./api/db/mongoose')


app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const user = require("./api/routes/user");
const admin = require("./api/routes/admin");

app.use("/user", user);
app.use("/admin", admin);

const server = app.listen(process.env.PORT || 4000);