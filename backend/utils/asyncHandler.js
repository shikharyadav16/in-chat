module.exports = function asyncHandler(fn) {

    return async function (...args) {
        try {
            await fn(...args);
        } catch (error) {
            console.error(error);
        }
    };
};