const express = require('express');
const authorController = require('../controllers/authorController');
const auth = require('../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(auth.protect, authorController.getAllAuthors)
    .post(authorController.createAuthor)


/*router
    .route('/:id')
    .delete(auth.protect, userController.deleteUser)
    .patch(auth.protect, userController.updateUser)
*/
module.exports = router;

