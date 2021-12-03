const mongoose = require('mongoose');
const validator = require('validator');

const authorModel = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Author name required'],
        validate: function (nameInput) {
            return (
                validator.isAlpha(nameInput, 'fr-FR', { ignore: ' -' }) &&
                validator.isLength(nameInput, { min: 2 })
            )
        },
        unique: true
    }
}, {
    collection: 'authors',
    versionKey: false
});

const Author = mongoose.model('Author', authorModel);

module.exports = Author;