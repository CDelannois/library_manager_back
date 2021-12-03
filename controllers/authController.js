const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.login = catchAsync(async (req, res, next) => {

    const { email, password } = req.body;
    //Vérification: l'utilisateur a-t-il entré son email et son mot de passe?
    if (!email || !password) {
        return next(new AppError('Please provide email and password.', 400));
    }

    //Vérification: le nom d'utilisateur et le mot de passe correspondent-ils?
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password.', 401));
    }

    //Renvoi du token vers le client
    const token = signToken(user._id);
    res.status(200).json({
        status: "success",
        token
    });
});

exports.protect = catchAsync(async (req, res, next) => {

    let token;
    //Récupération du token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError(`You're not logged in!`, 401));
    }

    //Vérification du token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //L'utilisateur existe-t-il encore après la création du token?
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('This user no longer exists.', 401));
    }

    //L'utilisateur a-t-il modifié son mot de passe après la création du token?
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('Password recently modified. Log in again.', 401)
        );
    };
    req.user = freshUser;
    next();
});

exports.restrictTo = (...person) => {
    return async (req, res, next) => {
        if (!person.includes(req.user.email)) {
            return next(new AppError(`You are not allowed to do that! `, 403));
        }
        next();
    }
};