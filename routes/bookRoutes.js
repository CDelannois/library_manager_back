const express = require('express');
const bookController = require('../controllers/bookController');
const auth = require('../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(auth.protect, bookController.getAllBooks)
    .post(auth.protect, bookController.createBook)


router
    .route('/:id')
    .delete(auth.protect, bookController.deleteBook)
    .patch(auth.protect, bookController.updateBook)

module.exports = router;

