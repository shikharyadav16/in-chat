const User = require("../models/User.js");
const asyncHandler = require("../utils/asyncHandler");
const OTP = require("../models/OTP.js");
const argon = require("argon2");
const sendMail = require("../services/nodemailer.service.js");
const UserValidator = require("../validators/validations/UserValidator.js");
const jwt = require("jsonwebtoken");
const generateKey = require("../services/keyGenerate.service.js");
const idGenerate = require("../services/idGenerate.service.js");
const { isAuthenticated } = require("../middlewares/auth.middleware.js")

require('dotenv').config();

const handlePostSignup = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;
    
    UserValidator.validateUserData({ username, email, password });
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
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

    await sendMail({ to: email, subject: "Your OTP", text, html });
    return res.status(200).json({ message: "OTP sent to your email" });

});


const verifySignupOTP = asyncHandler(async (req, res, next) => {

    let { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email, otp: otp.toString().trim() });

    if (!otpRecord) {
        return res.status(400).json({ message: "Invalid OTP" });
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
        secure: true,
        samesite: 'strcit',
        maxAge: 24 * 60 * 60 * 1000
    });

    await user.save();
    await otpRecord.deleteOne();
    
    return res.status(200).json({ message: "User registered successfully", privateKey });
});

const handlePostLogin = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    console.log(email, password)
    UserValidator.validateEmail(email);
    UserValidator.validatePassword(password);
    
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }
    
    const isPasswordValid = await argon.verify(user.password, password);
    
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }
    
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, {
        httpOnly: true,
        // secure: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    })

    return res.status(200).json({ message: "Login successful", redirectedTo: "/chat" });

});

module.exports = {
    handlePostSignup,
    verifySignupOTP,
    handlePostLogin
};

