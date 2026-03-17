const User = require("../models/User.js");
const asyncHandler = require("../utils/asyncHandler");
const OTP = require("../models/OTP.js");
const argon = require("argon2");
const sendMail = require("../services/nodemailer.service.js");
const UserValidator = require("../validators/validations/UserValidator.js");
const jsonwebtoken = require("jsonwebtoken");
const generateKey = require("../services/keyGenerate.service.js");

require('dotenv').config();

const handlePostSignup = asyncHandler(async (req, res) => {

    const { username, email, password } = req.body;
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const html = `<h2>Your OTP : ${otp}</h2>`;
    const text = `Your OTP for In-Chat signup is: ${otp}`;

    UserValidator.validateUserData({ username, email, password });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
    }

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


const verifySignupOTP = asyncHandler(async (req, res) => {

    const { email, otp } = req.body;
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
        return res.status(400).json({ message: "Invalid OTP" });
    }
    const { username, password } = otpRecord;

    const user = new User({
        username,
        email,
        password: await argon.hash(password),
        publicKey
    });

    await user.save();
    await otpRecord.remove();

    return res.status(200).json({ message: "User registered successfully" });
});

const handlePostLogin = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    UserValidator.validateLogin({ email, password });

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await argon.verify(user.password, password);

    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({ message: "Login successful", userId: user._id });

});

module.exports = {
    handlePostSignup,
    verifySignupOTP,
    handlePostLogin
};

