const express = require('express');
const userController = require('./../controllers/userController');
const auth = require('./../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(auth.protect, userController.getAllUsers)
    .post(userController.createUser)
    .put(auth.protect, userController.addBookToUser)


router
    .route('/:id')
    .get(auth.protect, userController.getOneUser)
    .delete(auth.protect, userController.deleteUser)
    .patch(auth.protect, userController.updateUser)

router
    .route('/removeBook/:id')
    .delete(auth.protect, userController.removeBookFromUser)

router
    .route('/updateCopie/:id')
    .patch(auth.protect, userController.updateUserBook)


module.exports = router;

