const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = err => {
    const fieldValue = Object.values(err.keyValue)[0];
    const message = `Duplicate field value: ${fieldValue}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400)
}
//Développement
const sendErrorDev = (err, res) => {
    console.log(err)
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    })
}

//Production
const sendErrorProd = (err, res) => {
    //Erreur opérationnelle, le client peut savoir de quoi il s'agit.
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
        //Erreur de programmation ou autre raison inconnue. Le client ne doit pas savoir de quoi il s'agit
    } else {
        console.error('Error ! ', err)

        res.status(500).json({
            status: 'error',
            message: 'Something went wrong.'
        })
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = Object.assign(err);

        if (error.name === 'CastError') {
            error = handleCastErrorDB(error);
        }
        if (error.code === 11000) {
            error = handleDuplicateFieldsDB(error);
        }
        if (error.name === 'ValidationError') {
            error = handleValidationErrorDB(error);
        }

        sendErrorProd(error, res);
    }
}