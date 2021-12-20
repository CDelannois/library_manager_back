const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

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

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new AppError('This email adressed is not registered.', 404))
    };

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to ${resetURL}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the mail. Try again later!'), 500);
    }
});


exports.resetPassword = catchAsync(async (req, res, next) => {

});