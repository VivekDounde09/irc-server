const express = require('express');
const upload = require('../../services/multer.config');
const AuthenticateSession = require('../middlewares/AuthenticateSession');
const ParseData = require('../middlewares/ParseData');
const userController = require('../userRoute/userController');
const router = express.Router();

const adminController = require('./adminController');
const admin = new adminController;
const user = new userController;

/* Static HTML */
router.get('/', admin.welcome);


/* Logs */
router.get('/errors', admin.errors);
router.get('/logs', admin.logs);


/* Signin */
router.post('/signin', admin.signIn);

/* Authentication */
router.get('/authenticate/:id/:address', admin.authConsent)
router.post('/authenticate', admin.authUser);


// Upload Assets
router.post('/upload-multiple-assets', upload.array('file', 10), AuthenticateSession, admin.uploadMultipleAsset);
router.post('/upload-single-assets', upload.single('file'), AuthenticateSession, admin.uploadSingleAsset);


// Add Property
router.post('/add-property', AuthenticateSession, admin.addProperty);
router.get('/get-property', AuthenticateSession, admin.getProperty);
router.post('/update-property/:id', AuthenticateSession, admin.updateProperty);
router.delete('/delete-property/:propertyId', AuthenticateSession, admin.deleteProperty);


// Add Property Settings
router.get('/get-property-settings', AuthenticateSession, admin.getPropertySettings);
router.post('/update-property-settings', AuthenticateSession, admin.updateSettings);


// Bank Verification Approval List
router.get('/get-approval-list', AuthenticateSession, admin.getApprovalList);
router.post('/request-approve', AuthenticateSession, admin.requestApprove);


/*Get Whitelisting Request */
router.get('/get-whitelist-users', AuthenticateSession, admin.getWhiteListUser);
router.post('/approve-whitelist-users', AuthenticateSession, admin.approveWhitelist);


/*Transactions Log */
router.get('/get-transactions', AuthenticateSession, admin.getTransactions);
router.get('/get-orders', AuthenticateSession, admin.getOrders);


/*Customer Bank Details */
router.get('/get-customer-bank-details', AuthenticateSession, admin.getCustomerBankDetails);


/*Payment Request Details */
router.get('/get-fraction-payment-request', AuthenticateSession, admin.getFractionPaymentRequest);
router.post('/approve-fraction-payment-request', AuthenticateSession, admin.approveFractionPaymentRequest);


/*Vault Information */
router.get('/get-vault-ira-balance', AuthenticateSession, admin.getVaultIRABalance);
router.get('/get-vault-exchange-balance', AuthenticateSession, admin.getVaultExchangeBalance);
router.post('/withdraw-ira-token-balance', AuthenticateSession, admin.withdrawIRATokenBalance);
router.post('/withdraw-exchange-token-balance', AuthenticateSession, admin.withdrawExchangeTokenBalance);
router.post('/update-exchange-token-rate', AuthenticateSession, admin.updateExchangeTokenRate);
router.post('/add-ira-token', AuthenticateSession, admin.addIRAToken);

/*Vault Transactions */
router.get('/get-ira-sales-transactions', AuthenticateSession, admin.getIRASalesTransactions);
router.get('/get-ira-deposit-transactions', AuthenticateSession, admin.getIRADepositTransaction);
router.get('/get-usdt-withdrawl-transactions', AuthenticateSession, admin.getUSDTWithdrawlTransactions);


module.exports = router;