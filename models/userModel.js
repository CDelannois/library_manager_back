const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const hash = require('./../utils/passwordHash');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'User name required.'],
        validate: function (nameInput) {
            return validator.isAlpha(nameInput, 'fr-FR', { ignore: ' -' }) &&
                validator.isLength(nameInput, { min: 2 })
        }
    },
    email: {
        type: String,
        required: [true, 'User email required.'],
        unique: true,
        validate: function (mailInput) {
            validator.isEmail(mailInput)
        },
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'User password required'],
        select: false,
    },
    passwordChangedAt: Date
}, {
    collection: 'users',
    versionKey: false
});

userSchema.pre('save', function (next) {
    //Si on crée/modifie le mot de passe, il est hashé. Sinon rien ne se passe au niveau du hash.
    if (!this.isModified('password')) {
        return next();
    }
    this.password = hash(this.password);
    next();
})

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        return JWTTimestamp < changedTimestamp;
    }

    return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;