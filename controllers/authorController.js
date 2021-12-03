const Author = require('./../models/authorModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getAllAuthors = catchAsync(async (req, res, next) => {
    const authors = await Author.find();

    res.status(200).json({
        status: "succes",
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