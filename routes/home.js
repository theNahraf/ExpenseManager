const express =require("express");
const wrapAsync = require("../utils/wrapAsync");
const User= require("../models/user.js");
const passport = require("passport");
const router = express.Router();
const {savedUrl}= require("../middleware.js")

// Assuming you have a home route like this
router.get("/", (req, res) => {
    res.render("./ui/home.ejs", { successMessages: req.flash("success"), errorMessages: req.flash("error") });
});

module.exports=router;