require('dotenv').config();
const md5 = require('md5');
const util = require('util');
const errors = require('../translations/error.json');
const exec = util.promisify(require('child_process').exec);
let validator = require('validator');
const client = require('../../services/redis.config');
const validateData = require('../middlewares/validateData');
const { isValidAuthorizer } = require('../../services/web3');
const { signInModel, addPropertyModel, getPropertyModel, deletePropertyModel, updatePropertyModel, getPropertySettingsModel, updateSettingsModel, authConsentModel, authUserModel, getApprovalListModel, requestApproveModel, getWhiteListUserModel, approveWhitelistModel, getTransactionsModel, getOrdersModel, getCustomerBankDetailsModel, getFractionPaymentRequestModel, approveFractionPaymentRequestModel, getVaultIRABalanceModel, getVaultUSDTBalanceModel, withdrawIRATokenBalanceModel, withdrawExchangeTokenBalanceModel, updateExchangeTokenRateModel, addIRATokenModel, getIRASalesTransactionsModel, getIRADepositTransactionModel, getUSDTWithdrawlTransactionsModel } = require('./adminModel');

class adminController {

  welcome(req, res) {
    res.sendFile('welcome.html', { root: `${ROOT_DIR}/public` });
  };

  errors(req, res) {
    res.sendFile('error.log', { root: `${ROOT_DIR}` });
  };

  logs(req, res) {
    res.sendFile('server.log', { root: `${ROOT_DIR}` });
  }

  /* sigIn */
  async signIn(req, res) {
    const validationRule = {
      "email": "required",
      "password": "required",
    };
    await validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.status(412)
          .send({
            success: false,
            message: 'Validation failed',
            data: null,
            error: err
          });
      } else {
        const { email, password } = req.body;
        signInModel(email, md5(password), (data, error) => {
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
    }).catch(err => console.error(err))
  };


  async addProperty(req, res) {

    const validationRule = {
      "title": "required",
      "description": "required",
      "valuation": "required",
      "propertyCategory": "required",
      "rentalReturns": "required",
      "estimatedAppreciation": "required",
      "propertyImages": "required",
      "featuredImage": "required",
      "totalFractions": "required",
      "propertyLocation": "required",
      "fractionPrice": "required",
      "minFractionBuy": "required",
      "maxFractionBuy": "required"
    };
    await validateData({ ...req.body }, validationRule, {}, (err, status) => {
      if (!status) {
        res.status(412)
          .send({
            success: false,
            message: 'Validation failed',
            data: null,
            error: err
          });
      } else {
        const { title, description, valuation, propertyCategory, rentalReturns, estimatedAppreciation, user_id, propertyImages, featuredImage, totalFractions, propertyLocation,
          fractionPrice, minFractionBuy, maxFractionBuy } = req.body;

        addPropertyModel(title, description, valuation, propertyCategory, rentalReturns, estimatedAppreciation, user_id, propertyImages, featuredImage, totalFractions, propertyLocation,
          fractionPrice, minFractionBuy, maxFractionBuy, (data, error) => {

            let response = { status: 1, data: null, error: null };
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
    }).catch(err => console.error(err))
  }

  async uploadMultipleAsset(req, res) {
    const propertyImages = req?.files.map(file => file.filename);
    try {
      for (let i = 0; i < propertyImages.length; i++) {
        await exec(`mv ${ROOT_DIR}/uploads/${propertyImages[i]} ${ROOT_DIR}/uploads/property_image/${propertyImages[i]}`);
      }
    } catch (e) {
      console.error(e, "error")
    };
    res.send({ status: 1, data: propertyImages, error: null });

  }

  async uploadSingleAsset(req, res) {
    const propertyImage = req.file.filename;
    try {
      await exec(`mv ${ROOT_DIR}/uploads/${propertyImage} ${ROOT_DIR}/uploads/property_image/${propertyImage}`);
    } catch (e) {
      console.error(e);
    }
    res.send({ status: 1, data: propertyImage, error: null })
  }

  async deleteProperty(req, res) {

    const validationRule = {
      "propertyId": "required"
    };

    await validateData(req.params, validationRule, {}, (err, status) => {
      if (!status) {
        res.status(412)
          .send({
            success: false,
            message: 'Validation failed',
            data: null,
            error: err
          });
      } else {
        const { propertyId } = req.params;
        deletePropertyModel(propertyId, (data, error) => {
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
    }).catch(err => console.error(err))
  };

  getProperty(req, res) {
    const { user_id, id } = req.query
    getPropertyModel(id, user_id, (data, error) => {
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


  updateProperty(req, res) {

    const validationRule = {
      "title": "required",
      "description": "required",
      "valuation": "required",
      "propertyCategory": "required",
      "rentalReturns": "required",
      "estimatedAppreciation": "required",
      "propertyImages": "required",
      "featuredImage": "required",
      "totalFractions": "required",
      "propertyLocation": "required",
      "fractionPrice": "required",
      "minFractionBuy": "required",
      "maxFractionBuy": "required"
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.status(412)
          .send({
            success: false,
            message: 'Validation failed',
            data: null,
            error: err
          });
      }
      else {
        const { title, description, valuation, propertyCategory, rentalReturns, estimatedAppreciation, user_id, propertyImages, featuredImage, totalFractions, propertyLocation,
          fractionPrice, minFractionBuy, maxFractionBuy } = req.body;
        const { id } = req.params;

        updatePropertyModel(id, title, description, valuation, propertyCategory, rentalReturns, estimatedAppreciation, user_id, propertyImages, featuredImage, totalFractions, propertyLocation,
          fractionPrice, minFractionBuy, maxFractionBuy, (data, err) => {
            let response = { status: 0, data: null, err: null }
            if (data === false) {
              response.err = err
            } else {
              response.status = 1;
              response.data = data;
            }
            res.send(response);
          })
      }
    })
  }

  getPropertySettings(req, res) {
    const { user_id } = req.query;
    getPropertySettingsModel(user_id, (data, error) => {
      let response = { status: 0, data: null, error: null };
      if (data === false) {
        response.status = 0;
        response.error = error;
      } else {
        response.status = 1;
        response.data = data;
      };
      res.send(response);
    })
  }

  updateSettings(req, res) {
    const validationRule = {
      "tokenValue": "required",
      "emailNotification": "required",
      "platformFee": "required"
    }
    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" })
      }
      else {
        const { tokenValue, emailNotification, user_id, platformFee } = req.body;

        updateSettingsModel(user_id, tokenValue, emailNotification, platformFee, (data, error) => {
          let response = { status: 0, data: null, error: null };
          if (data === false) {
            response.status = 0;
            response.error = error;
          } else {
            response.status = 1;
            response.data = data;
          };
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
      const response = await isValidAuthorizer(address);
      if (!response) {
        res.send({ status: 2, data: null, error: null });
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
  }

  async authUser(req, res) {
    const validationRule = {
      'address': 'required',
      'signature': 'required'
    }
    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      }
      else {
        const { address, signature } = req.body;
        authUserModel(address, signature, (data, error) => {
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
    })
  }

  async getApprovalList(req, res) {
    const { id } = req.query;
    getApprovalListModel(id, (data, error) => {
      let response = { status: 0, data: null, error: null };

      if (data === false) {
        response.error = error;
      } else {
        response.status = 1;
        response.data = data
      }
      res.send(response);
    })
  }

  async requestApprove(req, res) {
    const { id, approve } = req.body;
    requestApproveModel(id, approve, (data, error) => {
      let response = { status: 0, data: null, error: null };

      if (data === false) {
        response.error = error;
      } else {
        response.status = 1;
        response.data = data
      }
      res.send(response);
    })
  }

  async getWhiteListUser(req, res) {
    getWhiteListUserModel((data, err) => {
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

  async approveWhitelist(req, res) {
    const { id, approve } = req.body;
    approveWhitelistModel(id, approve, (data, err) => {
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

  async getTransactions(req, res) {
    getTransactionsModel((data, err) => {
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

  async getOrders(req, res) {
    getOrdersModel((data, err) => {
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


  async getCustomerBankDetails(req, res) {
    getCustomerBankDetailsModel((data, err) => {
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

  async getFractionPaymentRequest(req, res) {
    getFractionPaymentRequestModel((data, err) => {
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

  async approveFractionPaymentRequest(req, res) {
    const { id, approve } = req.body;
    approveFractionPaymentRequestModel(id, approve, (data, err) => {
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


  async getVaultIRABalance(req, res) {
    getVaultIRABalanceModel((data, err) => {
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


  async getVaultExchangeBalance(req, res) {
    getVaultUSDTBalanceModel((data, err) => {
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


  async withdrawIRATokenBalance(req, res) {

    const validationRule = {
      "address": "required",
      "amount": "required",
    };

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      }
      else {
        const { address, amount } = req.body;

        withdrawIRATokenBalanceModel(address, amount, (data, err) => {
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
    })
  }


  async withdrawExchangeTokenBalance(req, res) {

    const validationRule = {
      "address": "required",
      "amount": "required",
    };

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      }
      else {
        const { address, amount } = req.body;

        withdrawExchangeTokenBalanceModel(address, amount, (data, err) => {
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
    })
  }

  async updateExchangeTokenRate(req, res) {
    const validationRule = {
      "exchangeRate": "required",
    };

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: "Validation Failed" });
      }
      else {
        const { exchangeRate } = req.body;
        updateExchangeTokenRateModel(exchangeRate, (data, err) => {
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
    })

  }

  async addIRAToken(req, res) {
    const validationRule = {
      "amount": "required"
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: 'Validation Failed' });
      }
      else {
        const { amount } = req.body;

        addIRATokenModel(amount, (data, err) => {
          const response = { status: 0, data: null, error: null };

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

  async getIRASalesTransactions(req, res) {
    const { filterDate } = req.query;
    getIRASalesTransactionsModel(filterDate, (data, error) => {
      const response = { status: 0, data: null, error: null }
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


  async getIRADepositTransaction(req, res) {
    getIRADepositTransactionModel((data, error) => {
      const response = { status: 0, data: null, error: null };

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
  async getUSDTWithdrawlTransactions(req, res) {
    getUSDTWithdrawlTransactionsModel((data, error) => {
      const response = { status: 0, data: null, error: null };

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

};

module.exports = adminController;