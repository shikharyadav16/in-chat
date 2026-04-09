const express = require("express");
const router = express.Router();

const { handlePostSignup, verifySignupOTP, handlePostLogin, handleRefreshToken, checkAuth,  handleLogout, handleResetPassword, handleVerifyResetOTP, handleSetNewPassword } = require('../controllers/auth.controller')

router
    .post("/signup", handlePostSignup)
    .post("/verify-otp", verifySignupOTP)

router
    .post("/login", handlePostLogin);

router
    .get('/me', checkAuth)
    .post("/refresh", handleRefreshToken);

router
    .post("/logout", handleLogout)
    .post("/reset-password", handleResetPassword)
    .post("/verify-reset-otp", handleVerifyResetOTP)
    .post("/set-new-password", handleSetNewPassword);

module.exports = router;
