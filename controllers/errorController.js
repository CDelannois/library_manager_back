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
        sendErrorProd(err, res);
    }
}