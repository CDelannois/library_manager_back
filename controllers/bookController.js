const Book = require('./../models/bookModel');
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
    const newBook = await Book.create(req.body);

    res.status(201).json({
        status: "Book created.",
        data: {
            newBook
        }
    });
});