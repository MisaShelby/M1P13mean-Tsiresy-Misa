const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controller/clientController/authController');
const { validateUserRegistration, validateUserLogin, validateBoutiqueRegistration, validateBoutiqueLogin } = require('../middlewares/validation');
const validateRequest = require('../middlewares/validate');
const { protect } = require('../middlewares/auth.middleware');
const { registerBoutique, loginBoutique } = require('../controller/boutiqueController/authBoutiqueController');
const { registerAdmin, loginAdmin } = require('../controller/adminController/authAdminController');

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

router.post('/register-boutique',
    validateBoutiqueRegistration,
    validateRequest,
    registerBoutique
);

router.post('/login-boutique',
    validateBoutiqueLogin,
    validateRequest,
    loginBoutique
);

router.post('/register-admin', 
    validateUserRegistration,
    validateRequest,
    registerAdmin
);

router.post('/login-admin', 
    validateUserLogin,
    validateRequest,
    loginAdmin
);

router.get('/profile', protect, getProfile);

module.exports = router;