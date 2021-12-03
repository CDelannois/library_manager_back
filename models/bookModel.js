const { ObjectId } = require('bson');
const mongoose = require('mongoose');
const validator = require('validator');

const bookModel = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title required'],
        validate: function (titleInput) {
            return validator.isLength(titleInput, { min: 2 });
        },
        unique: true
    },
    author: {
        type: ObjectId,
        required: [true, 'Author ID required.']
    },
    note: {
        type: Number,
        validate: function (noteInput) {
            return validator.isInt(noteInput, { min: 0, max: 5 });
        }
    },
    belongsTo: {
        type: ObjectId,
        required: [true, 'Owner required.']
    },
    lentTo: {
        type: String,
        validate: function (lentToInput) {
            return validator.isAlpha(lentToInput, 'fr-Fr', { ignore: ' -' }) &&
                validator.isLength(lentToInput, { min: 2 })
        }
    }
}, {
    collection: 'books',
    versionKey: false
});

const Book = mongoose.model('Book', bookModel);

module.exports = Book;