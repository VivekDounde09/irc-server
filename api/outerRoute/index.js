const express = require('express');
const sanitizeRequest = require('express-sanitize-middleware')({ body: true });

const upload = require('../../services/multer.config');

const outerController = require('./outerController');
const AuthenticateSession = require('../middlewares/AuthenticateSession');
const ParseData = require('../middlewares/ParseData');

const router = express.Router();

const outer = new outerController;

/* Static HTML */
router.get('/', outer.welcome);

/* Logs */
router.get('/errors', outer.errors);
router.get('/logs', outer.logs);

/* Register And Sign-in */
router.post('/register', outer.registerUser);
router.post('/signin', outer.signIn);

// Forgot Password
router.post('/forgot-password', outer.forgotPassword);
router.get('/reset-password/:id/:token', outer.resetPassword);
router.post('/change-password/:id', outer.changePassword);


// Verification
router.get('/verify-mail/:id/:token', outer.verifyEmail);
router.get('/google-login', outer.gLogin);


//GET PROPERTIES
router.get('/get-properties', outer.getProperties);
router.get('/get-all-properties', outer.getAllProperties);
router.get('/get-property-details/:id', outer.getPropertyDetail)


// MailChimp NewsLetter
router.post('/subscribe-mail', outer.subscribeMail)

router.post('/calculate-gas-fee', outer.calculateGasFee);

router.post('/calculate-ira-value', outer.calculateIRAValue);

router.post('/purchase-ira-token', outer.purchaseIRAToken);

router.post('/get-transactions', outer.getTransactions);

router.get('/get-exchange-value', outer.getExchangeValue);


module.exports = router;