import { ObjectId } from 'bson';
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
    },
    author: {
        type: ObjectId,
        required: [true, 'Author ID required']
    },
    note: {
        type: Number,
        validate: function (noteInput) {
            return validator.isInt(noteInput, { min: 0, max: 5 });
        }
    },
    lentTo: {
        type: String,
        validate: function (lentToInput) {
            return validator.isAlpha(lentToInput, 'fr-Fr', { ignore: ' -' }) &&
                validator.isLength(lentToInput, { min: 2 })
        }
    }
});

const Book = mongoose.model('Book', bookModel);

model.exports = Book;