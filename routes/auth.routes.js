const express = require("express");
const router = express.Router();

const { handlePostSignup, verifySignupOTP, handlePostLogin } = require('../controllers/auth.controller')

router
    .post("/signup", handlePostSignup)
    .post("/verify-otp", verifySignupOTP)

router
    .post("/login", handlePostLogin)

// router.get("/signup", (req, res) => {
//     res.send("signup");
// }).post("/signup", handlePostSignup);

// router.get("/login", (req, res) => {
//     res.send("login");
// }).post("/login", handlePostLogin);

// router.get("/forgot-password", (req, r es) => {
//     res.render("forgot-password");
// });

// router.post("/forgot-password", handlePostForgotPassword);

module.exports = router;
