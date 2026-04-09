const response = require('../Response.js');

class UserValidator {
    static validateUserData(payload) {

        const { username, email, password } = payload;

        if (!username || username.trim() === '' || username.length < 3 || username.length > 30) {
            return response(false, 'Username is required and must be between 3 and 30 characters');
        }

        if (!email || email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return response(false, 'Email is required and must be a valid email address');
        }

        if (!password || password.trim() === '' || password.length < 6 || password.length > 100) {
            return response(false, 'Password is required and must be between 6 and 100 characters');
        }

        return response(true);
    }

    static validateUsernme(username) {
        if (!username || username.trim() === '' || username.length < 3 || username.length > 30) {
            return response(false, 'Username is required and must be between 3 and 30 characters');
        }
        return response(true);
    }

    static validateEmail(email) {
        if (!email || email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return response(false, 'Email is required and must be a valid email address');
        }
        return response(true);
    }

    static validatePassword(password) {
        if (!password || password.trim() === '' || password.length < 6 || password.length > 100) {
            return response(false, 'Password is required and must be between 6 and 100 characters');
        }
        return response(true);
    }
}
module.exports =  UserValidator;