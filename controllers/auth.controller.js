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

    const { username, email, password } = req.body;
    
    const validationResponse = UserValidator.validateUserData({ username, email, password });
    if (!validationResponse.status) return res.status(400).json({ success: false, message: validationResponse.message })
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({success: false, message: "Email already in use" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Generated OTP:", otp);
    const html = `<h2>Your OTP : ${otp}</h2>`;
    const text = `Your OTP for In-Chat signup is: ${otp}`;

    await OTP.deleteMany({ email });

    const otpRecord = new OTP({
        email,
        username,
        password: await argon.hash(password),
        otp
    });

    await otpRecord.save();

    // await sendMail({ to: email, subject: "Your OTP", text, html });
    return res.status(200).json({success: true, message: "OTP sent to your email", redirectedTo: "verify-otp" });

});


const verifySignupOTP = asyncHandler(async (req, res, next) => {

    let { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp: otp.toString().trim() });

    if (!otpRecord) {
        return res.status(400).json({success: false, message: "Invalid OTP" });
    }
    const { username, password } = otpRecord;

    const { publicKey, privateKey } = generateKey();
    const userId = idGenerate("user");

    const user = new User({
        username,
        email,
        password,
        publicKey,
        userId
    });

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        // secure: true,
        samesite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    });

    await user.save();
    await otpRecord.deleteOne();
    
    return res.status(200).json({success:false, message: "User registered successfully", privateKey });
});

const handlePostLogin = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    const emailValidateResponse = UserValidator.validateEmail(email);
    const passwordValidateResponse = UserValidator.validatePassword(password);

    if (!emailValidateResponse.status) return res.status(400).json({success: false, message: emailValidateResponse.message});
    if (!passwordValidateResponse.status) return res.status(400).json({success: false, message: passwordValidateResponse.message});
    
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({success: false, message: "Invalid email or password" });
    }
    
    const isPasswordValid = await argon.verify(user.password, password);
    
    if (!isPasswordValid) {
        return res.status(400).json({success: false, message: "Invalid email or password" });
    }
    
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        // secure: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    })

    return res.status(200).json({success: true, message: "Login successful", redirectedTo: "/chat" });

});

const checkAuth = asyncHandler(async (req, res) => {

    const token = req?.cookies?.token;
    
    if (!token) {
        return res.status(401).json({status:false, message: "Unauthorized" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
        return res.status(401).json({status: false, message: "Invalid token payload" });
    }

    return res.status(200).json({status: true, user: decoded })

})

module.exports = {
    handlePostSignup,
    verifySignupOTP,
    handlePostLogin,
    checkAuth
};

