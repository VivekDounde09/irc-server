require('dotenv').config();
const md5 = require('md5');
const bcrypt = require("bcrypt")
var CryptoJS = require("crypto-js");
const { v4: uuidv4 } = require('uuid');
const translations = require('../translations');
const validateData = require('../middlewares/validateData');
const { sendOtpModel, verifyOtpModel, getUserDetailsModel, logoutModel, updateUserDetailsModel, resendMailVerificationModel, verifyPanCardModel, generateAadharOTPModel, verifyAadharCardModel, addBankDetailsModel, getuserBankDetailsModel, updateBankDetailsModel, requestWhiteListingModel, getWhiteListUserModel, createOrderModel, paymentStatusModel, buyFractionModel, invoiceClearanceModel, fractionCalculationModel, getUserNFTModel, addFractionPaymentRequestModel, verifyPurchaseLinkModel, purchaseFractionsModel, checkPurchaseFractionModel } = require('./userModel');
const { default: axios } = require('axios');
const { authConsentModel } = require('../adminRoute/adminModel');

class userController {
  sendOtp(req, res) {
    const validationRule = {
      "phone": "required"
    }
    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({
          status: 0,
          data: null,
          error: "Validation Failed"
        })
      }
      else {
        const { phone, user_id } = req.body;
        sendOtpModel(phone, user_id, (data, error) => {
          let response = { status: 0, data: null, error: null }

          if (data === false) {
            response.error = error;
          } else {
            response.status = 1;
            response.data = data;
          }
          res.send(response);
        })
      }
    })
  }
  async authConsent(req, res) {
    const { id, address } = req.params;

    if (!address) {
      res.status(400).send();
    }
    else {
      authConsentModel(id, address, (data, error) => {
        let response = { status: 0, data: null, error: null }
        if (data === false) {
          response.error = error;
        }
        else {
          response.status = 1;
          response.data = data;
        }
        res.send(response);
      })
    }
  }

  verifyOtp(req, res) {

    const validationRule = {
      "phone": "required",
      "otp": "required"
    }
    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({
          status: 0,
          data: null,
          error: "Validation Failed"
        })
      }
      else {
        const { otp, user_id, phone } = req.body;

        verifyOtpModel(otp, user_id, phone, (data, err) => {
          let response = { status: 0, data: null, error: null }

          if (data === false) {
            response.error = err;
          } else {
            response.status = 1;
            response.data = data;
          }
          res.send(response);
        })
      }
    })



  }

  resendMailVerification(req, res) {
    const { user_id, email } = req.body;

    resendMailVerificationModel(user_id, email, (data, error) => {
      let response = { status: 0, data: null, error: null }
      if (data === false) {
        response.error = error;
      }
      else {
        response.status = 1;
        response.data = data;
      }
      res.send(response);
    })
  }

  getUserDetails(req, res) {
    const { user_id } = req.query;

    getUserDetailsModel(user_id, (data, err) => {
      let response = { status: 0, data: null, error: null }

      if (data === false) {
        response.error = err;
      } else {
        response.status = 1;
        response.data = data;
      }
      res.send(response);
    })
  }

  logout(req, res) {
    const { token } = req;
    const { user_id } = req.query;

    logoutModel(user_id, token, (data, err) => {
      let response = { status: 0, data: null, error: null }

      if (data === false) {
        response.error = err;
      } else {
        response.status = 1;
        response.data = data;
      }
      res.send(response);
    })
  }


  updateUserDetails(req, res) {
    const validationRule = {
      "email": "required",
      "fullName": "required",
      "phone": "required"
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" })
      } else {
        const { email, fullName, phone, user_id } = req.body;
        updateUserDetailsModel(email, fullName, phone, user_id, (data, err) => {
          let response = { status: 0, data: null, error: null }
          if (data === false) {
            response.error = err;
          }
          else {
            response.status = 1;
            response.data = data;
          }
          res.send(response);
        })
      }
    })
  }

  verifyPanCard(req, res) {
    const validationRule = {
      "pancard": "required"
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed!" });
      } else {
        const { pancard, user_id } = req.body
        verifyPanCardModel(user_id, pancard, (data, err) => {
          let response = { status: 0, data: null, error: null }
          if (data === false) {
            response.error = err;
          }
          else {
            response.status = 1;
            response.data = data;
          }
          res.send(response);

        })
      }
    })
  }

  generateAadharOtp(req, res) {
    const validationRule = {
      "aadharCard": "required"
    }
    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      }
      else {
        const { aadharCard } = req.body;
        generateAadharOTPModel(aadharCard, (data, err) => {
          let response = { status: 0, data: null, error: null }
          if (data === false) {
            response.error = err;
          }
          else {
            response.status = 1;
            response.data = data;
          }
          res.send(response);
        })
      }
    })
  }

  verifyAadhar(req, res) {
    const validationRule = {
      "aadharCard": "required",
      "clientId": "required",
      "otp": "required"
    }
    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      }
      else {
        const { user_id, clientId, aadharCard, otp } = req.body;
        verifyAadharCardModel(user_id, clientId, aadharCard, otp, (data, err) => {
          let response = { status: 0, data: null, error: null }
          if (data === false) {
            response.error = err;
          }
          else {
            response.status = 1;
            response.data = data;
          }
          res.send(response);
        })
      }
    })
  }

  addBankDetails(req, res) {
    const validationRule = {
      'accountHolderName': 'required',
      'bankName': "required",
      'accountNo': "required",
      'bankIfsc': "required",
      'branchName': "required",
      "cheque": "required"
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      } else {
        const { user_id, accountHolderName, bankName, accountNo, bankIfsc, branchName, cheque } = req.body;

        addBankDetailsModel(user_id, accountHolderName, bankName, accountNo, bankIfsc, branchName, cheque, (data, err) => {
          let response = { status: 0, data: null, error: null }
          if (data === false) {
            response.error = err;
          }
          else {
            response.status = 1;
            response.data = data;
          }
          res.send(response);
        })
      }
    })
  }

  getuserBankDetails(req, res) {
    const { detailId, user_id } = req.query;
    getuserBankDetailsModel(detailId, user_id, (data, error) => {
      let response = { status: 0, data: null, error: null };
      if (data === false) {
        response.error = error;
      } else {
        response.status = 1;
        response.data = data;
      }
      res.send(response);
    })
  }

  updateBankDetails(req, res) {
    const validationRule = {
      'id': 'required',
      'accountHolderName': 'required',
      'bankName': "required",
      'accountNo': "required",
      'bankIfsc': "required",
      'branchName': "required",
      "cheque": "required"
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      } else {
        const { id, user_id, accountHolderName, bankName, accountNo, bankIfsc, branchName, cheque } = req.body;

        updateBankDetailsModel(id, user_id, accountHolderName, bankName, accountNo, bankIfsc, branchName, cheque, (data, err) => {
          let response = { status: 0, data: null, error: null }
          if (data === false) {
            response.error = err;
          }
          else {
            response.status = 1;
            response.data = data;
          }
          res.send(response);
        })
      }
    })
  }

  requestWhiteListing(req, res) {
    const { user_id } = req.query;

    requestWhiteListingModel(user_id, (data, err) => {
      let response = { status: 0, data: null, error: null };

      if (data === false) {
        response.error = err;
      }
      else {
        response.status = 1;
        response.data = data;
      }
      res.send(response);
    })
  }

  getWhitelistUser(req, res) {
    const { user_id } = req.query;

    getWhiteListUserModel(user_id, (data, error) => {

      let response = { status: 0, data: null, error: null };

      if (data === false) {
        response.error = error;
      }
      else {
        response.status = 1;
        response.data = data;
      }
      res.send(response);
    })
  }

  createOrder(req, res) {
    const validationRule = {
      'property_id': 'required',
      'amount': 'required',
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      } else {
        const { user_id, property_id, amount } = req.body;

        createOrderModel(user_id, property_id, (amount).toFixed(2), (data, err) => {
          let response = { status: 0, data: null, error: null }
          if (data === false) {
            response.error = err;
          }
          else {
            response.status = 1;
            response.data = data;
          }
          res.send(response);
        })
      }
    })
  }


  paymentStatus(req, res) {

    const validationRule = {
      'property_order_id': 'required',
      'property_id': 'required',
      'razorpay_payment_id': 'required',
      'razorpay_order_id': "required",
      'razorpay_signature': "required",
      'amount': "required"
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      } else {
        const { user_id, property_id, property_order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body;
        paymentStatusModel(user_id, property_id, property_order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, (data, error) => {
          let response = { status: 0, data: null, error: null };

          if (data === false) {
            response.status = 0;
            response.error = error;
          } else {
            response.status = 1;
            response.data = data;
          };
          res.send(response);
        });
      }
    })
  }

  buyFraction(req, res) {
    const validationRule = {
      'property_id': 'required',
      'fraction_count': 'required',
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      } else {
        const { user_id, property_id, fraction_count } = req.body;
        buyFractionModel(user_id, property_id, fraction_count, (data, error) => {
          let response = { status: 0, data: null, error: null };

          if (data === false) {
            response.status = 0;
            response.error = error;
          } else {
            response.status = 1;
            response.data = data;
          };
          res.send(response);
        });
      }
    })
  }

  fractionCalculation(req, res) {
    const validationRule = {
      'property_id': 'required',
      'fraction_count': 'required',
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      } else {
        const { user_id, property_id, fraction_count } = req.body;
        fractionCalculationModel(user_id, property_id, Number(fraction_count), (data, error) => {
          let response = { status: 0, data: null, error: null };

          if (data === false) {
            response.status = 0;
            response.error = error;
          } else {
            response.status = 1;
            response.data = data;
          };
          res.send(response);
        });
      }
    })

  }

  invoiceClearance(req, res) {
    const validationRule = {
      'gas_fee': 'required',
      'property_order_id': 'required',
      'property_id': 'required',
      'razorpay_payment_id': 'required',
      'razorpay_order_id': "required",
      'razorpay_signature': "required",
      'amount': "required"
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      } else {
        const { gas_fee, user_id, property_id, property_order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body;
        invoiceClearanceModel(gas_fee, user_id, property_id, property_order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, (data, error) => {
          let response = { status: 0, data: null, error: null };

          if (data === false) {
            response.status = 0;
            response.error = error;
          } else {
            response.status = 1;
            response.data = data;
          };
          res.send(response);
        });
      }
    })
  }

  getUserNFT(req, res) {
    const { user_id } = req.query;
    getUserNFTModel(user_id, (data, error) => {
      let response = { status: 0, data: null, error: null };
      if (data === false) {
        response.status = 0;
        response.error = error;
      } else {
        response.status = 1;
        response.data = data;
      };
      res.send(response);
    });

  }

  addFractionPaymentRequest(req, res) {
    const validationRule = {
      "propertyId": "required",
      "fractions": "required",
      "totalAmount": "required",
      "senderName": "required",
      "senderBankAccount": "required",
      "senderBankName": "required",
      "transactionDescription": "required"
    }

    validateData(req.body, validationRule, {}, async (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: 'Validation Failed' });
      }
      else {
        const { propertyId, fractions, totalAmount, senderName, senderBankAccount, senderBankName, transactionDescription, user_id } = req.body;

        const uid = uuidv4().replaceAll('-', '').slice(0, 5);
        const random = Math.round((new Date()).getTime() / 100);
        const hash = uid + random;

        addFractionPaymentRequestModel(propertyId, fractions, totalAmount, senderName, senderBankAccount, senderBankName, transactionDescription, user_id, hash, (data, error) => {
          let response = { status: 0, data: null, error: null };

          if (data === false) {
            response.error = error
          } else {
            response.status = 1;
            response.data = data;
          }
          res.send(response);
        })
      }
    })
  }

  verifyPurchaseLink(req, res) {
    const { hash } = req.params;

    verifyPurchaseLinkModel(hash, (data, error) => {
      const response = { status: 0, data: null, error: null };
      if (data === false) {
        res.redirect(`${process.env.CLIENT_URL}/`)
      }
      else {
        res.redirect(`${process.env.CLIENT_URL}/purchase-token/${hash}/${data}`)
      }
    })
  }

  purchaseFractions(req, res) {
    const { hash } = req.params;
    const { user_id } = req.query;

    purchaseFractionsModel(hash, user_id, (data, error) => {

      const response = { status: 0, data: null, error: null };

      if (data === false) {
        response.error = error
      } else {
        response.status = 1;
        response.data = data;
      }
      res.send(response);
    })
  }


  checkPurchaseFraction(req, res) {
    const { user_id } = req.query;

    checkPurchaseFractionModel( user_id, (data, error) => {

      const response = { status: 0, data: null, error: null };

      if (data === false) {
        response.error = error
      } else {
        response.status = 1;
        response.data = data;
      }
      res.send(response);
    })
  }

};

module.exports = userController;
