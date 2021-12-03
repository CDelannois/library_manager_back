const express = require('express');
const userController = require('./../controllers/userController');
const auth = require('./../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(auth.protect, userController.getAllUsers)
    .post(userController.createUser)


router
    .route('/:id')
    .delete(auth.protect, userController.deleteUser)
    .patch(auth.protect, userController.updateUser)

module.exports = router;

