const Book = require('./../models/bookModel');
const Author = require('./../models/authorModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllBooks = catchAsync(async (req, res, next) => {
    const books = await Book.find();

    res.status(200).json({
        status: "succes",
        results: books.length,
        data: {
            books
        }
    })
});

exports.createBook = catchAsync(async (req, res, next) => {
    const authorExist = await Author.findById(req.body.author);
    if (!authorExist) {
        return next(new AppError('This author does not exist.', 404));
    }
    req.body.belongsTo = req.user._id;
    const newBook = await Book.create(req.body);

    res.status(201).json({
        status: "Book created.",
        data: {
            newBook
        }
    });
});

exports.updateBook = catchAsync(async (req, res, next) => {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'updated',
        data: updatedBook
    });
});

exports.deleteBook = catchAsync(async (req, res, next) => {
    const deletedBook = await Book.findByIdAndDelete(req.params.id);

    if (!deletedBook) {
        return next(new AppError("This book does not exist.", 404));
    }

    res.status(204).json({
        status: 'success'
    });
});