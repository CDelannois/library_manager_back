const express = require('express');
const authorController = require('../controllers/authorController');
const auth = require('../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(auth.protect, authorController.getAllAuthors)
    .post(auth.protect, authorController.createAuthor)


router
    .route('/:id')
    .delete(auth.protect, authorController.deleteAuthor)
    .patch(auth.protect, authorController.updateAuthor)

module.exports = router;

