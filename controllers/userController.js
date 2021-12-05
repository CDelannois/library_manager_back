const User = require('./../models/userModel');
const Book = require('./../models/bookModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users
        }
    });
});

exports.createUser = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    res.status(201).json({
        status: "User created.",
        data: {
            newUser
        }
    });
});

exports.addBookToUser = catchAsync(async (req, res, next) => {
    const book = await Book.findById(req.body.bookId);
    if (!book) {
        return next(new AppError('This book does not exist.', 404));
    }

    const bookList = await User.findByIdAndUpdate(req.user._id, { $push: { books: [req.body] } }, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: bookList
    });
});

exports.removeBookFromUser = catchAsync(async (req, res, next) => {

    // const book = await Book.findById(req.params.id);
    // if (!book) {
    //     return next(new AppError('This book does not exist.', 404));
    // }

    const removedBook = await User.findByIdAndUpdate(req.user._id, {
        $pull: {
            books: {
                _id: req.params.id
            }
        }
    }, { new: true });

    res.status(201).json({
        status: 'book removed',
        data: removedBook
    })
});

exports.updateUser = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(req.user._id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'updated',
        data: updatedUser
    });
});

exports.updateUserBook = catchAsync(async (req, res, next) => {

});

exports.deleteUser = catchAsync(async (req, res, next) => {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
        return next(new AppError("This user does not exist.", 404));
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success'
    });
});