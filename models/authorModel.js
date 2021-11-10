import mongoose, { model } from 'mongoose';
import validator from 'validator';

const authorModel = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Author name required'],
        validate: function (nameInput) {
            return (
                validator.isAlpha(nameInput, 'fr-Fr', { ignore: ' -' }) &&
                validator.isLength(nameInput, { min: 2 })
            )
        },
        unique: true
    }
});

const Author = mongoose.model('Author', authorModel);

model.exports = Author;