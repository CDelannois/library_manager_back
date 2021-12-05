const Book = require('./../models/bookModel');
const Author = require('./../models/authorModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { ObjectId } = require('bson');

const pipe = [{
    $lookup: {
        from: 'authors',
        localField: 'author',
        foreignField: '_id',
        as: 'author'
    }
}, {
    $unwind: '$author'
}, {
    $addFields: {
        author: '$author.name',
    }
}];

exports.getAllBooks = catchAsync(async (req, res, next) => {
    const books = await Book.aggregate(pipe);

    res.status(200).json({
        status: "success",
        results: books.length,
        data: {
            books
        }
    })
});

exports.getBooksFromAuthor = catchAsync(async (req, res, next) => {

    const author = await Author.findById(req.params.id);

    if (!author) {
        return next(new AppError('This author does not exist.', 404));
    }
    console.log(req.params.id)
    const matchPipe = [{
        $match: {
            author: ObjectId(req.params.id)
        }
    }]
        .concat(pipe)
    const booksFromAuthor = await Book.aggregate(matchPipe);

    res.status(200).json({
        status: "success",
        results: booksFromAuthor.length,
        data: {
            booksFromAuthor
        }
    });
})

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