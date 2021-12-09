const User = require('./../models/userModel');
const Book = require('./../models/bookModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { ObjectId } = require('bson');


const pipe = [{
    $unwind: {
        path: '$books'
    }
}, {
    $lookup: {
        from: 'books',
        localField: 'books.book',
        foreignField: '_id',
        as: 'books.book'
    }
}, {
    $unwind: {
        path: '$books.book'
    }
}, {
    $addFields: {
        'books.book': '$books.book.title'
    }
}, {
    $group: {
        _id: '$_id',
        books: {
            $push: '$books'
        }
    }
}, {
    $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
    }
}, {
    $unwind: {
        path: '$user'
    }
}, {
    $addFields: {
        'user.books': '$books'
    }
}, {
    $replaceRoot: {
        newRoot: '$user'
    }
}]

exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.aggregate(pipe);

    res.status(200).json({
        status: "success",
        results: users.length,
        data: {
            users
        }
    });
});

exports.getOneUser = catchAsync(async (req, res, next) => {
    matchPipe = [{
        $match: {
            _id: ObjectId(req.params.id)
        }
    },].concat(pipe);

    const user = await User.aggregate(matchPipe);

    if (!user) {
        return next(new AppError('This user does not exist.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

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
    const book = await Book.findById(req.body.book);
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

    const book = await User.find({ "books._id": req.params.id });
    if (book.length < 1) {
        return next(new AppError("This copie does not exist.", 404));
    }

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

    const book = await User.find({ "books._id": req.params.id });
    if (book.length < 1) {
        return next(new AppError("This copie does not exist.", 404));
    }

    const { note, lentTo } = req.body;

    let newInfo;
    if (note && lentTo && lentTo != " ") {
        newInfo = { $set: { "books.$.note": note, "books.$.lentTo": lentTo } }
    } else if (note && (lentTo == " " || !lentTo)) {
        newInfo = { $set: { "books.$.note": note } }
    } else if (lentTo != " ") {
        newInfo = { $set: { "books.$.lentTo": lentTo } }
    } else {
        return next(new AppError('You must specify a note and/or a person.', 400))
    }

    if (lentTo === " ") {
        newInfo.$unset = { "books.$.lentTo": " " }
    }

    const updatedUserBook = await User.findOneAndUpdate({ 'books._id': req.params.id }, newInfo, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'updated',
        data: updatedUserBook
    })
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