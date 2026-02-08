const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controller/authController');
const { validateUserRegistration, validateUserLogin } = require('../middlewares/validation');
const validateRequest = require('../middlewares/validate');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', 
    validateUserRegistration,
    validateRequest,
    registerUser
);

router.post('/login', 
    validateUserLogin,
    validateRequest,
    loginUser
);

router.get('/profile', protect, getProfile);

module.exports = router;