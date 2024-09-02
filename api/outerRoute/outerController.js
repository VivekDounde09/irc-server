require('dotenv').config();
const validatePhoneNumber = require('validate-phone-number-node-js');
let validator = require('validator');
const md5 = require('md5');
const errors = require('../translations/error.json');
const validateData = require('../middlewares/validateData');
const translations = require('../translations');
const { registerUserModel, signInModel, gLoginModel, verifyEmailModel, getPropertiesModel, getPropertyDetailModel, forgotPasswordModel, resetPasswordModel, changePasswordModel, subscribeMailModel, calculateGasFeeModel, getAllPropertiesModel, calculateIRAValueModel, purchaseIRATokenModel, getTransactionsModel, getExchangeValueModel } = require('./outerModel');

class outerController {
  welcome(req, res) {
    res.sendFile('welcome.html', { root: `${ROOT_DIR}/public` });
  };

  errors(req, res) {
    res.sendFile('error.log', { root: `${ROOT_DIR}` });
  };

  logs(req, res) {
    res.sendFile('server.log', { root: `${ROOT_DIR}` });
  };

  //register
  async registerUser(req, res) {
    const validationRule = {
      "email": "required",
      "full_name": "required",
      "password": "required",
      "phone": "required",
      "type": "required"
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
        const { email, full_name, phone, password, type } = req.body;

        //Email Validation
        const email_validate = {
          email: validator.isEmail(email),
          error: errors['EMAIL_VALIDATION']
        }
        if (email_validate.email === false) {
          const error = email_validate.error;
          res.send({ status: 0, error: error, data: null });
          return;
        }

        //Password Validation
        const validate = {
          password: { regex: /^(?=.*[A-Z])(?=.*[~!@#$%^&*()/_=+[\]{}|;:,<>?-])(?=.*[0-9])(?=.*[a-z]).{8,14}$/, error: errors['PASSWORD_VALIDATION'] }
        };
        if (!validate['password'].regex.test(password)) {
          const error = validate['password'].error;
          res.send({ status: 0, error: error, data: null });
          return;
        }

        //Mobile Number Validation
        if (phone) {
          const result = validatePhoneNumber.validate(phone);
          let error = errors['NUMBER_VALIDATION'];
          if (result === false) {
            res.send({ status: 0, error: error, data: null });
            return;
          }
        }

        registerUserModel(email, full_name, phone, md5(password), type, (data, error) => {
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

  async gLogin(req, res) {

    const validationRule = {
      "token": "required"
    };
    await validateData(req.query, validationRule, {}, (err, status) => {
      if (!status) {
        res.status(412)
          .send({
            success: false,
            message: 'Validation failed',
            data: null,
            error: err
          });
      } else {
        const { token, language } = req.query;
        gLoginModel(token, language, (data, error) => {
          let response = { status: 0, data: null, error: null };
          if (data === false) {
            response.status = 0;
            response.error = error;
          } else {
            response.status = 1;
            response.data = data;
          }
          res.send(response);
        });
      }
    }).catch(err => console.log(err))
  }

  verifyEmail(req, res) {
    const { id, token } = req.params;
    verifyEmailModel(id, token, (data, err) => {
      if (data === false) {
        res.redirect(`${process.env.CLIENT_URL}/`)
      }
      else {
        res.redirect(`${process.env.CLIENT_URL}?emailVerified=true`)
      }
    })
  }

  getProperties(req, res) {
    getPropertiesModel((data, err) => {
      let response = { status: 0, data: null, error: null }
      if (data === false) {
        response.error = err;
      } else {
        response.status = 1;
        response.data = data
      }
      res.send(data);
    })
  }

  getAllProperties(req, res) {
    getAllPropertiesModel((data, err) => {
      let response = { status: 0, data: null, error: null }
      if (data === false) {
        response.error = err;
      } else {
        response.status = 1;
        response.data = data
      }
      res.send(data);
    })
  }

  async getPropertyDetail(req, res) {

    const validationRule = {
      "id": "required"
    };

    await validateData(req.params, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({
          status: 0, data: null, error: "Validation Failed"
        })
      }
      else {
        const { id } = req.params;
        getPropertyDetailModel(id, (data, err) => {
          let response = { status: 0, data: null, error: null }
          if (data === false) {
            response.error = err;
          } else {
            response.status = 1;
            response.data = data
          }
          res.send(data);
        })
      }
    })
  }

  forgotPassword(req, res) {

    const validationRule = {
      "email": "required"
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: 'Validation Failed' });
      }
      else {
        const { email } = req.body;
        forgotPasswordModel(email, (data, err) => {
          let response = { status: 0, data: null, error: null }
          if (data === false) {
            response.error = err;
          } else {
            response.status = 1;
            response.data = data
          }
          res.send(response);
        })
      }
    })
  }

  resetPassword(req, res) {
    const validationRule = {
      "id": "required",
      "token": "required"
    }

    validateData(req.params, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: 'Validation Failed' });
      }
      else {
        const { id, token } = req.params;

        resetPasswordModel(id, token, (data, err) => {
          if (data === false) {
            res.redirect(`${process.env.CLIENT_URL}/`)
          } else {
            res.redirect(`${process.env.CLIENT_URL}/reset-password/${id}`);
          }
        })
      }
    })
  }

  changePassword(req, res) {
    const { password } = req.body;
    const { id } = req.params;

    const validate = {
      password: { regex: /^(?=.*[A-Z])(?=.*[~!@#$%^&*()/_=+[\]{}|;:,<>?-])(?=.*[0-9])(?=.*[a-z]).{8,14}$/, error: errors['PASSWORD_VALIDATION'] }
    };
    if (!validate['password'].regex.test(password)) {
      const error = validate['password'].error;
      res.send({ status: 0, error: error, data: null });
      return;
    }
    else {
      changePasswordModel(id, md5(password), (data, err) => {
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
  }


  subscribeMail(req, res) {
    const validationRule = {
      'email': 'required'
    }
    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: 'Please Enter Email' });
      }
      else {
        const { email } = req.body;
        subscribeMailModel(email, (data, error) => {
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

  calculateGasFee(req, res) {

    const validationRule = {
      'value': 'required',
      'property_id': 'required'
    }
    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: 'Please Enter value' });
      }
      else {
        const { value, property_id } = req.body;
        calculateGasFeeModel(value, property_id, (data, error) => {
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

  calculateIRAValue(req, res) {
    const validationRule = {
      'amount': 'required'
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: 'Validation Failed' });
      }
      else {
        const { amount } = req.body;
        calculateIRAValueModel(amount, (data, err) => {
          const response = { status: 0, data: null, error: null }

          if (data === false) {
            response.error = err;
          } else {
            response.status = 1;
            response.data = data
          }
          res.send(response);
        })
      }
    })

  }

  purchaseIRAToken(req, res) {

    const validationRule = {
      "address": "required",
      "amount": "required"
    }

    validateData(req.body, validationRule, {}, (err, status) => {
      if (!status) {
        res.send({ status: 0, data: null, error: null });
      }
      else {
        const { address, amount } = req.body;
        purchaseIRATokenModel(address, amount, (data, err) => {
          const response = { status: 0, data: null, error: null }

          if (data === false) {
            response.error = err;
          }
          else {
            response.status = 1;
            response.data = data
          }
          res.send(response);
        })
      }

    })

  }

  getTransactions(req, res) {
    const { address } = req.body;

    getTransactionsModel(address, (data, error) => {
      const response = { status: 0, data: null, error: null }

      if (data === false) {
        response.error = err;
      }
      else {
        response.status = 1;
        response.data = data
      }
      res.send(response);

    })
  }

  getExchangeValue(req, res) {
    getExchangeValueModel((data, error) => {
      const response = { status: 0, data: null, error: null }

      if (data === false) {
        response.error = err;
      }
      else {
        response.status = 1;
        response.data = data
      }
      res.send(response);

    })

  }

};

module.exports = outerController;
