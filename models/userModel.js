const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const hash = require('./../utils/passwordHash');
const { ObjectId } = require('bson');

const booksSchema = new mongoose.Schema({
    book: {
        type: ObjectId,
        required: [true, 'Book ID required']
    },
    note: {
        type: Number,
        validate: function (noteInput) {
            let noteInputStr = noteInput.toString();
            return validator.isInt(noteInputStr, { min: 0, max: 10 });
        }
    },
    lentTo: {
        type: String,
        validate: function (lentToInput) {
            if (lentToInput.length > 0) {
                return validator.isAlpha(lentToInput, 'fr-FR', { ignore: ' -' })
            } else {
                return true
            }
        }
    }
})

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
            return validator.isEmail(mailInput)
        },
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'User password required'],
        select: false,
    },
    books: {
        type: [booksSchema]
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date
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

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    this.passwordResetExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;