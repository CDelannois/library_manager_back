const Author = require('./../models/authorModel');
const Book = require('./../models/bookModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllAuthors = catchAsync(async (req, res, next) => {
    const authors = await Author.find();

    res.status(200).json({
        status: "success",
        results: authors.length,
        data: {
            authors
        }
    })
});

exports.createAuthor = catchAsync(async (req, res, next) => {
    const newAuthor = await Author.create(req.body);

    res.status(201).json({
        status: "Author created.",
        data: {
            newAuthor
        }
    });
});

exports.updateAuthor = catchAsync(async (req, res, next) => {
    const updatedAuthor = await Author.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedAuthor) {
        return next(new AppError('This author does not exist.', 404));
    }

    res.status(200).json({
        status: 'updated',
        data: updatedAuthor,
    });
});

exports.deleteAuthor = catchAsync(async (req, res, next) => {
    const book = await Book.findOne(
        {
            author: req.params.id
        }
    );

    if (book) {
        return next(new AppError('This author cannot be deleted now, he still has books.', 400));
    }

    const deletedAuthor = await Author.findByIdAndDelete(req.params.id);

    if (!deletedAuthor) {
        return next(new AppError('This author does not exist.', 404));
    }

    res.status(204).json({
        status: 'success'
    });
});