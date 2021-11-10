import mongoose, { model } from 'mongoose';
import validator from 'validator';

const bookModel = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Book title required'],
        validate: function (titleInput) {
            return validator.isLength(titleInput, { min: 2 });
        },
        unique: true
    }
});

const Book = mongoose.model('Book', bookModel);

model.exports = Book;