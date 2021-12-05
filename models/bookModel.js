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
}, {
    collection: 'books',
    versionKey: false
});

const Book = mongoose.model('Book', bookModel);

module.exports = Book;