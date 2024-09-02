require('dotenv').config();

const crypto = require('crypto');
const mailchimp = require('@mailchimp/mailchimp_marketing');
const ejs = require('ejs');
const errors = require('../translations/error.json');
const jwt = require('jsonwebtoken');
const jwt_decode = require("jwt-decode");
const client = require('../../services/redis.config');
const { transporter, mailOptions } = require('../../services/nodemailer.config');
const { checkExchangeRate, isUSDTApproved, getChecksumAddress, transferTokens, eventsTransactionDetails, getBalanceOfUSDT } = require('../../services/web3');

const registerUserModel = (email, full_name, phone, password, type, callback) => {
  //Check user already Is or not
  const sql = `select user_id,user_phone, user_email from user_masters where user_email = '${email}' OR user_phone = '${phone}'`;
  DBConnection.query(sql, (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR']);
    } else if (result.length > 0) {
      let possibleErrors = [
        errors['MSG002'],
        errors['MSG004']
      ];
      let error = [];
      for (let i = 0; i < result.length; i++) {
        if (result[i].user_phone == phone)
          error.indexOf(possibleErrors[0]) === -1 ? error.push(errors['MSG002'],) : true;
        if (result[i].user_email.toLowerCase() === email.toLowerCase())
          error.indexOf(possibleErrors[1]) === -1 ? error.push(possibleErrors[1]) : true;
      }
      callback(false, error[0]);
    } else {

      //insert DataBase
      const userSql = `Insert into user_masters (user_full_name,user_email, user_password,user_phone, user_type, user_status, created_at ) values ('${full_name}', '${email}','${password}',${phone},'${type}', 1, CURRENT_TIMESTAMP)`;

      DBConnection.query(userSql, async (err, userResult) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        } else {
          const token = crypto.randomBytes(4).toString('hex').toUpperCase();
          const subject = "Verify your Email Address"
          const mailBody = await ejs.renderFile(`${ROOT_DIR}/templates/verifyEmail.ejs`, { url: `${process.env.SERVER_URL}/verify-mail/${userResult.insertId}/${token}` });

          // JWT Payload
          const user = {
            id: userResult.insertId,
            email: email,
            name: full_name,
            type: type,
            status: 1
          };

          transporter.sendMail(mailOptions(email, subject, mailBody), (error, info) => {
            if (error) {
              callback(false, error);
            } else {
              client.setEx(userResult.insertId.toString(), 86400, token);

              //Create JWT Token
              jwt.sign({ user }, process.env.TOKEN_SECRET_KEY, { expiresIn: '10d' }, (err, token) => {
                if (err) {
                  callback(false, errors['SYSTEM_ERROR']);
                }
                else {
                  callback({
                    id: userResult.insertId,
                    email: email,
                    name: full_name,
                    type: type,
                    token,
                  });
                };
              });
            }
          })
        };
      });
    };
  });
}

const signInModel = (email, password, callback) => {

  //Check Valid Email and Password
  const sql = `select user_id, user_full_name, user_email, user_password, user_type, user_status FROM user_masters WHERE user_email = '${email}' and user_status = 1`;
  DBConnection.query(sql, (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR']);
    } else if (result.length == 0)
      callback(false, errors.MSG010);
    else if (result.length > 0 && password !== result[0].user_password)
      callback(false, errors.MSG011);
    else if (result.length > 0 && result[0].user_status === 0)
      callback(false, errors.MSG012);
    else {
      // For Send userData
      const user = {
        id: result[0].user_id,
        email: result[0].user_email,
        name: result[0].user_full_name,
        type: result[0].user_type.toUpperCase(),
        status: result[0].user_status
      };
      // Create JWT Token
      jwt.sign({ user }, process.env.TOKEN_SECRET_KEY, { expiresIn: '10d' }, (err, token) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {
          callback({
            id: user.id,
            email: user.email,
            name: user.name,
            type: user.type,
            status: user.status,
            token,
          });
        };
      });
    };
  });
}

const gLoginModel = async (token, callback) => {

  try {
    var user_details = jwt_decode(token);
    //RESPONSE OF THE GIVEN TOKEN

    // {
    //   iss: 'https://accounts.google.com',
    //   nbf: 1663326014,
    //   aud: '639340849897-i2uorp976fvboil6c6qccei93v322g2g.apps.googleusercontent.com',
    //   sub: '117136157995278186121',
    //   email: 'kuldeeppatel.mongoosetech@gmail.com',
    //   email_verified: true,
    //   azp: '639340849897-i2uorp976fvboil6c6qccei93v322g2g.apps.googleusercontent.com',
    //   name: 'kuldeep patel',
    //   picture: 'https://lh3.googleusercontent.com/a/AItbvmlqbsWP4_kD3Brr2ppUGkLLLfln27HuV6_p3XiN=s96-c',
    //   given_name: 'kuldeep',
    //   family_name: 'patel',
    //   iat: 1663326314,
    //   exp: 1663329914,
    //   jti: '2d4ae358f4c477f711b97a6f81dd5cfd2b0e09d6'
    // }    

  } catch (error) {
    // callback(false, "Wrong Token");
    console.error(error)
  }
  if (user_details) {
    //check user Already exists on not
    const sql = `select user_id,user_email,user_first_name,user_type,user_status from user_master where user_email = '${user_details.email}'`;
    DBConnection.query(sql, (err, result) => {
      if (err) {
        callback(false, errors["SYSTEM_ERROR"]);
      } else {

        //if user exists
        if (result.length > 0) {
          const user = {
            id: result[0].user_id,
            email: result[0].email,
            name: result[0].user_first_name,
            type: result[0].user_type.toUpperCase(),
            status: result[0].user_status,

          };

          // Create JWT Token
          jwt.sign({ user }, process.env.TOKEN_SECRET_KEY, { expiresIn: "10d" }, (err, token) => {
            if (err) {
              callback(false, errors["SYSTEM_ERROR"]);
            } else {
              callback({
                id: user.id,
                email: user.email,
                name: user.name,
                type: user.type,
                status: user.status,
                balance: user.balance,
                token,
              });
            }
          });
        } else {

          //if user not exists So insert data base
          const userSql = `Insert into user_master (user_first_name, user_last_name, user_email,user_password, user_phone, user_type, user_status,user_profile, created_at ) values ('${user_details.given_name}','${user_details.family_name}', '${user_details.email}',${null},${null},'${"USER"}', 1,'${user_details.picture}', CURRENT_TIMESTAMP)`;
          DBConnection.query(userSql, async (err, userResult) => {
            if (err) {
              callback(false, errors["SYSTEM_ERROR"]);
            } else {
              if (userResult.insertId > 0) {
                let insert_user_id = userResult.insertId;
                const sql = `select user_id,user_email,user_first_name,user_type,user_status from user_master where user_id = '${insert_user_id}'`;
                DBConnection.query(sql, (err, result) => {
                  if (err) {
                    callback(false, errors["SYSTEM_ERROR"]);
                  } else {
                    if (result.length > 0) {
                      const user = {
                        id: result[0].user_id,
                        email: result[0].user_email,
                        name: result[0].user_first_name,
                        type: result[0].user_type.toUpperCase(),
                        status: result[0].user_status,
                      };
                      // Create JWT Token
                      jwt.sign({ user }, process.env.TOKEN_SECRET_KEY, { expiresIn: "10d" }, async (err, token) => {
                        if (err) {
                          callback(
                            false,
                            errors["SYSTEM_ERROR"]
                          );
                        } else {
                          callback({
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            type: user.type,
                            status: user.status,
                            token,
                          });
                        }
                      }
                      );
                    }
                  }
                })
              } else {
                callback(false, errors["SYSTEM_ERROR"]);
              }
            }
          });
        }
      }
    });
  } else {
    callback(false, "Invalid Token");
  }

};


const verifyEmailModel = async (id, token, callback) => {

  const data = await client.GET(id);
  if (!data) {
    callback(false, 'Something went Wrong!');
  }
  else if (data === token) {
    const updateSql = `UPDATE user_masters SET is_email_verified=${1} WHERE user_id=${id}`;
    DBConnection.query(updateSql, (err, result) => {
      if (err) {
        callback(false, err);
      } else {
        client.del(id);
        const searchUserSql = `SELECT * FROM user_masters WHERE user_id=${id}`;

        DBConnection.query(searchUserSql, (err, user) => {
          if (err) {
            callback(false);
          }
          else {
            const searchKycSql = `SELECT * FROM user_kyc WHERE user_id=${id}`;
            DBConnection.query(searchKycSql, (err, kycResult) => {
              if (err) {
                callback(false, errors['SYSTEM_ERROR']);
              }
              else if (kycResult.length === 0) {
                callback(true);
              } else {
                if (kycResult[0].user_aadhar_no !== null && kycResult[0].user_pancard !== null && user[0].is_phone_verified == 1 && user[0].is_email_verified == 1) {
                  const updateKYC = `UPDATE user_masters SET is_kyc_completed = '${1}' WHERE user_id=${id}`;
                  DBConnection.query(updateKYC, (err, result) => {
                    if (err) {
                      callback(false);
                    } else {
                      callback(true);
                    }
                  })
                } else {
                  callback(true);
                }
              }
            })

          }
        })
      }
    })
  }
  else {
    callback(false, 'Email not verified')
  }
}

const getPropertiesModel = (callback) => {
  const searchSql = `SELECT P.*, count(mpd.id) as sold_out FROM properties P INNER JOIN mint_properties_data mpd ON mpd.property_id = P.property_id AND mpd.current_owner != '${process.env.PUBLIC_KEY}' WHERE is_minted=1 GROUP BY mpd.property_id`;

  DBConnection.query(searchSql, (err, result) => {
    if (err) {
      callback(false, err);
    }
    else {
      callback(result);
    }
  })
}

const getPropertyDetailModel = (id, callback) => {
  const searchSql = `SELECT * FROM properties WHERE property_id=${id}`;

  DBConnection.query(searchSql, (err, result) => {
    if (err) {
      callback(false, err);
    } else {
      callback(result[0]);
    }
  })
}

const forgotPasswordModel = (email, callback) => {

  const searchSql = `SELECT * FROM user_masters WHERE user_email='${email}'`;

  DBConnection.query(searchSql, async (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else if (result.length === 0) {
      callback(false, 'User not found');
    }
    else {
      const token = crypto.randomBytes(4).toString('hex').toUpperCase();
      const subject = "Reset Your Password"
      const body = `Click here to reset your password ---> ${process.env.SERVER_URL}/reset-password/${result[0].user_id}/${token}`;
      const mailBody = await ejs.renderFile(`${ROOT_DIR}/templates/resetPassword.ejs`, { url: `${process.env.SERVER_URL}/reset-password/${result[0].user_id}/${token}` });

      transporter.sendMail(mailOptions(email, subject, mailBody), (error, info) => {
        if (error) {
          callback(false, error);
        } else {
          client.setEx(`forget-${result[0].user_id}`, 3600, token.toString());
          callback(true);
        }
      })
    }
  })
}

const resetPasswordModel = async (id, token, callback) => {
  const data = await client.get(`forget-${id}`);

  if (!data) {
    callback(false, "Token Expired!");
  } else if (data == token) {
    client.del(`forget-${id}`);
    callback(true);
  } else {
    callback(false, "Wrong Token");
  }
}

const changePasswordModel = (id, password, callback) => {

  const searchSql = `SELECT * FROM user_masters WHERE user_id='${id}'`;

  DBConnection.query(searchSql, (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else if (result.length === 0) {
      callback(false, errors['MSG010']);
    }
    else {
      const updateSql = `UPDATE user_masters SET user_password='${password}' WHERE user_id='${id}'`;

      DBConnection.query(updateSql, (err, result) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        } else {
          callback(true);
        }
      })
    }
  })
}


const subscribeMailModel = async (email, callback) => {
  try {
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY,
      server: process.env.MAILCHIMP_SERVER
    });

    const result = await mailchimp.lists.addListMember(process.env.MAILCHIMP_AUDIENCE_ID, {
      email_address: email,
      status: "subscribed",
    });

    if (result.status == 'subscribed') {
      callback(true);
    }
    else {
      callback(false, errors['SYSTEM_ERROR']);
    }
  } catch (error) {
    let body = JSON.parse(error.response.text);
    callback(false, body.title);
  }
}

const calculateGasFeeModel = async (value, property_id, callback) => {

  let fraction = await DBQuery(`select p.*,ps.* from properties as p inner join property_settings as ps on p.admin_id = ps.admin_id where p.property_id = '${property_id}'`);

  if (fraction instanceof Error) {
    callback(false, "This property is not found..")
  }

  const { ira_token_value, platform_fee } = fraction[0]

  const currentConversionValue = Number(ira_token_value); // fetch from admin
  const currentPlatformFee = Number(platform_fee); // fetch from admin
  const gasFee = Number(value) * (currentPlatformFee / 100);
  const gasFeeToken = gasFee * currentConversionValue;

  callback(gasFeeToken);
}

const getAllPropertiesModel = async (callback) => {
  const searchSql = `SELECT * FROM properties WHERE is_minted = 1`;

  const response = await DBQuery(searchSql);

  if (response instanceof Error) {
    callback(errors['SYSTEM_ERROR'])
  }
  else {
    callback(response);
  }
}


const calculateIRAValueModel = async (amount, callback) => {
  const exchangeRate = await checkExchangeRate();

  if (exchangeRate instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  }
  else {
    const value = parseFloat(amount * exchangeRate);
    callback(value);
  }
}


const purchaseIRATokenModel = async (address, amount, callback) => {

  const checkSumAddress = await getChecksumAddress(address);
  const permission = await isUSDTApproved(checkSumAddress);
  const exchangeRate = await checkExchangeRate();
  const totalUSDT = parseFloat(amount * exchangeRate);

  const balanceOfUSDT = await getBalanceOfUSDT(checkSumAddress);

  if (permission > 0) {
    if (permission >= amount) {
      if (totalUSDT > Number(balanceOfUSDT)) {
        callback(false, 'Insufficient USDT Balance');
      }
      else {
        const response = await transferTokens(address, totalUSDT);

        if (response instanceof Error) {
          callback(false, errors['SYSTEM_ERROR'])
        } else {
          const insertQuery = `INSERT INTO ira_token_transactions(wallet_address,transfer_from,transfer_to,gas_used,transaction_hash,usdt_amount,ira_amount, event) VALUES('${address}', '${response?.from}', '${response?.to}', '${response?.gasUsed}', '${response?.transactionHash}', '${totalUSDT}', '${amount}', 'SALE')`;

          const insertResponse = await DBQuery(insertQuery);

          if (insertResponse instanceof Error) {
            callback(false, errors['SYSTEM_ERROR'])
          }
          else {
            callback(response?.transactionHash);
          }
        }
      }
    }
    else {
      callback(false, 'Permission Required');
    }
  } else {
    callback(false, 'Permission Required');
  }
}

const getTransactionsModel = async (address, callback) => {
  // const response = await eventsTransactionDetails();
  // callback(response)

  const queryResponse = await DBQuery(`SELECT * FROM ira_token_transactions WHERE wallet_address='${address}' AND event = 'SALE' ORDER BY created_at DESC`)

  if (queryResponse instanceof Error) {
    callback(false, errors['SYSTEM_ERROR'])
  }
  else {
    callback(queryResponse[0]);
  }
}

const getExchangeValueModel = async (callback) => {
  const response = await checkExchangeRate();

  if (response instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  }
  else {
    callback(response);
  }
}

module.exports = {
  registerUserModel, signInModel, gLoginModel, verifyEmailModel, getPropertiesModel, getPropertyDetailModel, forgotPasswordModel, resetPasswordModel, changePasswordModel, subscribeMailModel, calculateGasFeeModel, getAllPropertiesModel, calculateIRAValueModel, purchaseIRATokenModel, getTransactionsModel, getExchangeValueModel
};