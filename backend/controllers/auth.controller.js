const User = require("../models/User.js");
const asyncHandler = require("../utils/asyncHandler");
const OTP = require("../models/OTP.js");
const argon = require("argon2");
const sendMail = require("../services/nodemailer.service.js");
const UserValidator = require("../validators/validations/UserValidator.js");
const jwt = require("jsonwebtoken");
const generateKey = require("../services/keyGenerate.service.js");
const idGenerate = require("../services/idGenerate.service.js");


require('dotenv').config();

const handlePostSignup = asyncHandler(async (req, res) => {

    // Handle user signup by validating input,
    // checking for existing email
    // generating OTP, and sending it to the user's email.

    const { username, email, password } = req.body;

    const validationResponse = UserValidator.validateUserData({ username, email, password });
    if (!validationResponse.status) return res.status(400).json({ success: false, message: validationResponse.message })

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const html = `<h2>Your OTP : ${otp}</h2>`;
    const text = `Your OTP for In-Chat signup is: ${otp}`;
    console.log("Generated OTP:", otp);

    await OTP.deleteMany({ email });

    const otpRecord = new OTP({
        email,
        username,
        password: await argon.hash(password),
        otp
    });

    await otpRecord.save();

    // await sendMail({ to: email, subject: "Your OTP", text, html });
    return res.status(200).json({ success: true, message: "OTP sent to your email", redirectedTo: "verify-otp" });

});


const verifySignupOTP = asyncHandler(async (req, res, next) => {

    // Verify the OTP entered by the user during signup
    // create the user account 
    // generate JWT tokens, and send them as cookies.

    let { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp: otp.toString().trim() });

    if (!otpRecord) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    const { username, password } = otpRecord;

    const { publicKey, privateKey } = generateKey();
    const userId = idGenerate("user");

    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    const user = new User({
        username,
        email,
        password,
        publicKey,
        userId,
        lastSeen: (new Date).toISOString(),
        refreshToken
    });

    res.cookie('access-token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    await user.save();
    await otpRecord.deleteOne();

    return res.status(200).json({ success: true, message: "User registered successfully", privateKey, token: accessToken });
});

const handlePostLogin = asyncHandler(async (req, res) => {

    // Handle user login by validating input
    // checking credentials
    // generating JWT tokens, and sending them as cookies.

    const { email, password } = req.body;
    const emailValidateResponse = UserValidator.validateEmail(email);
    const passwordValidateResponse = UserValidator.validatePassword(password);

    if (!emailValidateResponse.status) return res.status(400).json({ success: false, message: emailValidateResponse.message });
    if (!passwordValidateResponse.status) return res.status(400).json({ success: false, message: passwordValidateResponse.message });

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await argon.verify(user.password, password);

    if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    const refreshToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const accessToken = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.cookie('access-token', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie('refresh-token', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({ success: true, message: "Login successful", redirectedTo: "/chat", token: accessToken });
});

const handleRefreshToken = asyncHandler(async (req, res) => {

    // Handle token refresh by validating the refresh token
    // generating new JWT tokens, and sending them as cookies.

    const refreshToken = req?.cookies?.["refresh-token"];

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "No refresh token",
            redirectedTo: "/login"
        });
    }

    let decoded;

    try {
        decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch {
        return res.status(403).json({
            success: false,
            message: "Expired or invalid refresh token",
            redirectedTo: "/login"
        });
    }

    const user = await User.findOne({ userId: decoded.userId });

    if (!user || user.refreshToken !== refreshToken) {
        return res.status(403).json({
            success: false,
            message: "Refresh token mismatch",
            redirectedTo: "/login"
        });
    }

    const newAccessToken = jwt.sign(
        { userId: user.userId },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    const newRefreshToken = jwt.sign(
        { userId: user.userId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('access-token', newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 24 * 60 * 60 * 1000
    });

    res.cookie('refresh-token', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'None',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
        success: true,
        message: "Token refreshed"
    });
});

const checkAuth = asyncHandler(async (req, res) => {

    // Check user authentication by validating the access token 
    // and returning the decoded user information.

    const accesstoken = req?.cookies?.["access-token"];
    if (!accesstoken) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(accesstoken, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
        return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    return res.status(200).json({ success: true, user: decoded, token: accesstoken })
});

const handleLogout = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies["refresh-token"];

    if (refreshToken) {
        await User.updateOne(
            { refreshToken },
            { $unset: { refreshToken: "" } }
        );
    }

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    };

    res.clearCookie("access-token", cookieOptions);
    res.clearCookie("refresh-token", cookieOptions);

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
        redirectedTo: "/login"
    });
});

const handleResetPassword = asyncHandler(async (req, res) => {

    // Handle password reset by validating the email, 
    // generating OTP, and sending it to the user's email.

    const { email } = req.body;
    const emailValidateResponse = UserValidator.validateEmail(email);
    if (!emailValidateResponse.status) return res.status(400).json({ success: false, message: emailValidateResponse.message });

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const html = `<h2>Your OTP : ${otp}</h2>`;
    const text = `Your OTP for In-Chat signup is: ${otp}`;
    await OTP.deleteMany({ email });

    const otpRecord = new OTP({
        email,
        username: user.username,
        otp,
        isUsed: false
    });
    await otpRecord.save();

    // await sendMail({ to: email, subject: "Your OTP", text, html });
    console.log(otp)
    return res.status(200).json({ success: true, message: "OTP sent to your email", redirectedTo: "verify-reset-otp" });
});

const handleVerifyResetOTP = asyncHandler(async (req, res) => {

    // Verify the OTP entered by the user during password reset,
    // update the user's password, and mark the OTP as used.

    let { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp: otp.toString().trim(), isUsed: false });

    if (!otpRecord) {
        return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await otpRecord.updateOne({ isUsed: true });

    return res.status(200).json({ success: true, message: "Password reset successful", redirectedTo: "/login" });
});

const handleSetNewPassword = asyncHandler(async (req, res) => {
    // Set a new password for the user after verifying the old password and validating the new password.

    const { email, newPassword } = req.body;

    const emailValidateResponse = UserValidator.validateEmail(email);
    const passwordValidateResponse = UserValidator.validatePassword(newPassword);

    if (!emailValidateResponse.status) return res.status(400).json({ success: false, message: emailValidateResponse.message });
    if (!passwordValidateResponse.status) return res.status(400).json({ success: false, message: passwordValidateResponse.message });

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord || !otpRecord.isUsed) {
        return res.status(400).json({ success: false, message: "OTP not verified" });
    }

    const hashedPassword = await argon.hash(newPassword);
    await User.updateOne({ email }, { password: hashedPassword });

    return res.status(200).json({ success: true, message: "Password updated successfully", redirectedTo: "/login" });

})


module.exports = {
    handlePostSignup,
    verifySignupOTP,
    handlePostLogin,
    handleRefreshToken,
    checkAuth,
    handleLogout,
    handleResetPassword,
    handleVerifyResetOTP,
    handleSetNewPassword
};

