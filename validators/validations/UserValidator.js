import { UserValidationError } from '../Error.js';

class UserValidator {
    static validateUserData(payload) {

        const { username, email, password } = payload;

        if (!username || username.trim() === '' || username.length < 3 || username.length > 30) {
            throw new UserValidationError('Username is required and must be between 3 and 30 characters');
        }

        if (!email || email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new UserValidationError('Email is required and must be a valid email address');
        }

        if (!password || password.trim() === '' || password.length < 6 || password.length > 100) {
            throw new UserValidationError('Password is required and must be between 6 and 100 characters');
        }

        return true;
    }

    static validateUsernme(username) {
        if (!username || username.trim() === '' || username.length < 3 || username.length > 30) {
            throw new UserValidationError('Username is required and must be between 3 and 30 characters');
        }
        return true;
    }

    static validateEmail(email) {
        if (!email || email.trim() === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new UserValidationError('Email is required and must be a valid email address');
        }
        return true;
    }

    static validatePassword(password) {
        if (!password || password.trim() === '' || password.length < 6 || password.length > 100) {
            throw new UserValidationError('Password is required and must be between 6 and 100 characters');
        }
        return true;
    }
}

export default UserValidator;