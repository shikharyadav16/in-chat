const errorHandler = (err, req, res, next) => {

    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong";

    res.status(errorStatus).json({
        success: false,
        status: errorStatus,
        message: errorMessage,
    }) 
}

module.exports = errorHandler;