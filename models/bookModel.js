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
            let noteInputStr = noteInput.toString();
            return validator.isInt(noteInputStr, { min: 0, max: 10 });
        }
    },
    belongsTo: {
        type: ObjectId
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
}, {
    collection: 'books',
    versionKey: false
});

const Book = mongoose.model('Book', bookModel);

module.exports = Book;