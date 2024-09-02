require('dotenv').config();
const translations = require('../translations');
const fs = require('fs');
const crypto = require('crypto');

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const ejs = require('ejs');
const errors = require('../translations/error.json');
const { sendSMS, sendMessage } = require('../../services/twilio.config');
const client = require('../../services/redis.config');
const { transporter, mailOptions } = require('../../services/nodemailer.config');
const { validatePaymentVerification } = require('razorpay/dist/utils/razorpay-utils');
const { IRA369, IRA } = require('../../services/contracts/');
const { default: axios } = require('axios');
const { accountNonce } = require('../../services/web3');
const { sync } = require('../utils/utility');
const { sendUserMail } = require('../utils/sendUserMail')


const { getTokenBalance, isApprovedForAll, web3, sendRawTransaction, contracts, getContractInstance } = require('../../services/web3')

const { createOrder, checkPaymentStatus } = require('../../services/payment');
const { sleep } = require('../../services/pinata');

const sendOtpModel = async (phone, id, callback) => {

  await new Promise(async (resolve, reject) => {
    const key = phone;
    const data = await client.GET(key);

    const OTP = Math.floor(100000 + Math.random() * 900000);
    client.setEx(phone.toString(), 3600, OTP.toString());
    const body = `Your verification code is ${OTP}`;
    // const response = await sendSMS(body, phone);
    const response = await sendMessage(OTP, phone);
    console.log(body);

    if (response instanceof Error) {
      reject(response);
    }
    else {
      resolve(await response);
      const user = await DBQuery(`SELECT * FROM user_masters WHERE user_id=${id}`);

      if (user instanceof Error) {
        callback(false, errors['SYSTEM_ERROR']);
      } else {
        const subject = 'Verify Mobile Number';
        const mailbody = await ejs.renderFile(`${ROOT_DIR}/templates/verifyMobile.ejs`, { code: OTP });
        transporter.sendMail(mailOptions(user[0].user_email, subject, mailbody), async (error, info) => {
          if (error) {
            callback(false, error);
          } else {
            callback(true);

          }
        })
      }
    }
  })
}

const verifyOtpModel = async (otp, id, phone, callback) => {

  const searchSql = `SELECT * FROM user_masters WHERE user_id=${id}`;
  DBConnection.query(searchSql, async (err, user) => {
    if (err) {
      callback(false, err)
    }
    else {
      const key = phone.substring(1, phone.length);
      const data = await client.GET(phone);
      if (!data) {
        callback(false, errors['OTP_EXPIRED']);
      } else if (data === otp) {
        const updateSql = `UPDATE user_masters SET is_phone_verified=${1} WHERE user_id=${id}`;

        DBConnection.query(updateSql, (err, result) => {
          if (err) {
            callback(false, errors["SYSTEM_ERROR"]);
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
                if (kycResult[0].user_aadhar_no !== null && kycResult[0].user_pancard !== null && user[0].is_email_verified == 1) {
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

      } else {
        callback(false, errors["OTP_WRONG"]);
      }
    }
  })
}

const resendMailVerificationModel = async (id, email, callback) => {
  const token = crypto.randomBytes(4).toString('hex').toUpperCase();
  const subject = "Resend - Verify your Email Address"
  const mailBody = await ejs.renderFile(`${ROOT_DIR}/templates/verifyEmail.ejs`, { url: `${process.env.SERVER_URL}/verify-mail/${id}/${token}` });

  transporter.sendMail(mailOptions(email, subject, mailBody), async (error, info) => {
    if (error) {
      callback(false, error);
    } else {
      client.setEx(id.toString(), 86400, token);
      callback(true);

    }
  })
}

const getUserDetailsModel = (id, callback) => {
  const searchSql = `SELECT * FROM user_masters as UM LEFT JOIN user_kyc as UK ON UM.user_id = UK.user_id LEFT JOIN user_bank_details AS UBD ON UM.user_id = UBD.user_id LEFT JOIN whitelist_address AS WA ON UM.user_id= WA.user_id WHERE UM.user_id=${id}`;

  DBConnection.query(searchSql, (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR'])
    }
    else if (result.length === 0) {
      callback(false, "User Not found")
    } else {
      callback(result[0]);
    }
  })
}

const logoutModel = async (id, token, callback) => {
  const data = await client.GET(`logout-${id}`);
  if (data) {
    const parsedData = JSON.parse(data);
    parsedData[id].push(token);
    client.set(`logout-${id}`, JSON.stringify(parsedData));
    callback(true);
  } else {
    const blackListData = {
      [id]: [token]
    }
    client.set(`logout-${id}`, JSON.stringify(blackListData));
    callback(true);
  }
}

const updateUserDetailsModel = async (email, fullName, phone, id, callback) => {
  const searchSql = `SELECT * FROM user_masters WHERE user_id=${id}`;

  const sendVerificationMail = async (id) => {
    const token = crypto.randomBytes(4).toString('hex').toUpperCase();
    const subject = "Verify your Email Address"
    const mailBody = await ejs.renderFile(`${ROOT_DIR}/templates/verifyEmail.ejs`, { url: `${process.env.SERVER_URL}/verify-mail/${id}/${token}` });

    transporter.sendMail(mailOptions(email, subject, mailBody), (error, info) => {
      if (error) {
        callback(false, error);
      } else {
        client.setEx(userResult.insertId.toString(), 86400, token);
      }
    })
  }

  DBConnection.query(searchSql, (err, user) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else if (user.length === 0) {
      callback(false, errors['MSG010']);
    }
    // else if (user[0].is_kyc_completed === 0) {
    //   callback(false, "Please Complete the KYC Process");
    // }
    else if (user[0].user_email === email && user[0].user_phone === phone) {

      const updateUserSql = `UPDATE user_masters SET user_email='${email}', user_full_name='${fullName}', user_phone='${phone}' WHERE user_id=${id}`;
      DBConnection.query(updateUserSql, (err, result) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {
          callback(true);
        }
      })
    }
    else if (user[0].user_email !== email && user[0].user_phone !== phone) {
      const updateUserSql = `UPDATE user_masters SET user_email='${email}', user_full_name='${fullName}', user_phone='${phone}', is_email_verified='${0}', is_phone_verified='${0}' WHERE user_id=${id}`;

      DBConnection.query(updateUserSql, async (err, result) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {
          await sendVerificationMail(id);
          callback('A Verification Mail has been sent on your mobile');
        }
      })
    }
    else if (user[0].user_email !== email && user[0].user_phone === phone) {
      const updateUserSql = `UPDATE user_masters SET user_email='${email}', user_full_name='${fullName}', user_phone='${phone}', is_email_verified='${0}' WHERE user_id=${id}`;

      DBConnection.query(updateUserSql, async (err, result) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {
          await sendVerificationMail(id);
          callback('A Verification Mail has been sent on your mobile');
        }
      })
    }
    else if (user[0].user_email === email && user[0].user_phone !== phone) {
      const updateUserSql = `UPDATE user_masters SET user_email='${email}', user_full_name='${fullName}', user_phone='${phone}', is_phone_verified='${0}' WHERE user_id=${id}`;

      DBConnection.query(updateUserSql, (err, result) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {
          callback(true);
        }
      })
    }


  })
}

const verifyPanCardModel = async (id, panCard, callback) => {
  const data = { "id_number": panCard }
  try {
    const response = await axios.post(`${process.env.KYC_DOMAIN}/api/v1/pan/pan`, data, {
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${process.env.KYC_AUTH_TOKEN}`
      }
    })
    if (response instanceof Error) {
      callback(false, response);
    }
    else if (response.status === 200) {

      const searchUserSql = `SELECT * from user_masters WHERE user_id=${id}`;


      DBConnection.query(searchUserSql, (err, user) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {
          const panUser = response?.data?.data?.full_name.replace(/\s/g, '');
          const userFullName = user[0]?.user_full_name.replace(/\s/g, '');

          if (panUser.toLowerCase() == userFullName.toLowerCase()) {
            const searchSql = `SELECT * from user_kyc WHERE user_id=${id}`;

            DBConnection.query(searchSql, (err, result) => {
              if (err) {
                callback(false, err);
              }
              else if (result.length === 0) {


                const insertSQL = `INSERT INTO user_kyc(user_id,user_pancard,created_at) VALUES('${id}', '${panCard}', CURRENT_TIMESTAMP)`;
                DBConnection.query(insertSQL, (err, insertResult) => {
                  if (err) {
                    callback(false, err);
                  }
                  else {
                    callback(true);
                  }
                })
              } else {
                const updateSQL = `UPDATE user_kyc SET user_pancard = '${panCard}' WHERE user_id=${id}`;

                DBConnection.query(updateSQL, (err, updateResult) => {
                  if (err) {
                    callback(false, err);
                  } else if (result[0].user_aadhar_no !== null && user[0].is_phone_verified == 1 && user[0].is_email_verified == 1) {
                    const updateKYC = `UPDATE user_masters SET is_kyc_completed = '${1}' WHERE user_id=${id}`;

                    DBConnection.query(updateKYC, (err, result) => {
                      if (err) {
                        callback(false);
                      } else {
                        callback(true);
                      }
                    })
                  }
                })

              }
            })
          }
          else {
            callback(false, 'This Pancard does not belong to you.');
          }
        }
      })
    }
    else {
      callback(false, "Trouble in Verify your Pancard");
    }
  } catch (err) {
    console.log(err);
    callback(false, err?.response?.data?.message);
  }
}

const generateAadharOTPModel = async (aadharCard, callback) => {
  const data = { "id_number": aadharCard };
  try {
    const response = await axios.post(`${process.env.KYC_DOMAIN}/api/v1/aadhaar-v2/generate-otp`, data, {
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${process.env.KYC_AUTH_TOKEN}`
      }
    })
    if (response instanceof Error) {
      callback(false, 'Something went wrong');
    }
    else {
      callback(response.data);
    }
  }
  catch (err) {
    callback(false, "Verification Failed! Please Try Again later");
  }

}

const verifyAadharCardModel = async (id, clientId, aadhaar, otp, callback) => {
  const data = {
    "client_id": clientId,
    "otp": otp
  }
  try {
    const response = await axios.post(`${process.env.KYC_DOMAIN}/api/v1/aadhaar-v2/submit-otp`, data, {
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${process.env.KYC_AUTH_TOKEN}`
      }
    })


    if (response instanceof Error) {
      callback(false, 'Something went wrong!');
    }
    else {
      const aadhaarDetails = {};
      aadhaarDetails['fullName'] = response.data.data.full_name;
      aadhaarDetails['DOB'] = response.data.data.dob;
      aadhaarDetails['gender'] = response.data.data.gender;
      aadhaarDetails['address'] = response.data.data.address;
      aadhaarDetails['fatherName'] = response.data.data.care_of;

      const stringifyAadharDetails = JSON.stringify(aadhaarDetails);

      const userSearchSql = `SELECT * FROM user_masters WHERE user_id=${id}`;

      DBConnection.query(userSearchSql, (err, user) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {
          // if (response?.data?.data?.full_name.toLowerCase() == user[0]?.user_full_name.toLowerCase()) {
          const searchSql = `SELECT * from user_kyc WHERE user_id=${id}`;
          DBConnection.query(searchSql, (err, result) => {
            if (err) {
              callback(false, err);
            }
            else if (result.length === 0) {
              const insertSQL = `INSERT INTO user_kyc(user_id,user_aadhar_no,created_at) VALUES('${id}', '${stringifyAadharDetails}', CURRENT_TIMESTAMP)`;
              DBConnection.query(insertSQL, (err, insertResult) => {
                if (err) {
                  callback(false, err);
                } else if (result[0].user_pancard !== null && user[0].is_phone_verified == 1 && user[0].is_email_verified == 1) {
                  const updateKYC = `UPDATE user_masters SET is_kyc_completed = '${1}' WHERE user_id=${id}`;

                  DBConnection.query(updateKYC, (err, result) => {
                    if (err) {
                      callback(false);
                    } else {
                      callback(true);
                    }
                  })
                }
                else {
                  callback(true);
                }
              })
            } else {
              const updateSQL = `UPDATE user_kyc SET user_aadhar_no = '${stringifyAadharDetails}' WHERE user_id=${id}`;

              DBConnection.query(updateSQL, (err, updateResult) => {
                if (err) {
                  callback(false, err);
                } else if (result[0].user_pancard !== null && user[0].is_phone_verified == 1 && user[0].is_email_verified == 1) {
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

              })
            }
          })
          // }
          // else {
          // callback(false, 'Aadhar Card Does not Belongs to you.')
          // }
        }
      })
    }
  } catch (err) {
    callback(false, "Verification Failed! Please Try Again later");
  }
}



const addBankDetailsModel = async (id, accountHolderName, bankName, accountNo, bankIfsc, branchName, cheque, callback) => {
  try {
    await exec(`mv ${ROOT_DIR}/uploads/property_image/${cheque} ${ROOT_DIR}/uploads/bank_verification/${cheque}`);

    const insertSql = `INSERT INTO user_bank_details(user_id, bank_name,account_holder_name, account_no, bank_ifsc_code, branch_name, cheque_image) VALUES ('${id}', '${bankName}','${accountHolderName}', '${accountNo}', '${bankIfsc}', '${branchName}', '${cheque}')`;

    DBConnection.query(insertSql, async (err, result) => {
      if (err) {
        callback(false, errors['SYSTEM_ERROR']);
      }
      else {
        const subject = "Request for Bank Verification";
        const mailBody = await ejs.renderFile(`${ROOT_DIR}/templates/bankVerification.ejs`, { url: `${process.env.ADMIN_URL}/dashboard/user-bank-approval` });

        transporter.sendMail(mailOptions(process.env.ADMIN_EMAIL, subject, mailBody), async (error, info) => {
          if (error) {
            callback(false, error);
          } else {
            callback(true);
          }
        })
      }
    })
  } catch (e) {
    console.error(e);
    callback(false, "Cannot move file")
  }


}


const getuserBankDetailsModel = (detailId, id, callback) => {
  if (detailId) {
    const searchSql = `SELECT * FROM user_bank_details WHERE id=${detailId}`;
    DBConnection.query(searchSql, (err, result) => {
      if (err) {
        callback(false, errors['SYSTEM_ERROR']);
      } else {
        callback(result);
      }
    })

  } else {
    const searchSql = `SELECT * FROM user_bank_details WHERE user_id=${id}`;
    DBConnection.query(searchSql, (err, result) => {
      if (err) {
        callback(false, errors['SYSTEM_ERROR']);
      } else {
        callback(result);
      }
    })
  }

}


const updateBankDetailsModel = async (id, userId, accountHolderName, bankName, accountNo, bankIfsc, branchName, cheque, callback) => {

  const path = `uploads/property_image/${cheque}`;

  if (fs.existsSync(path)) {
    try {
      await exec(`mv ${ROOT_DIR}/uploads/property_image/'${cheque}' ${ROOT_DIR}/uploads/bank_verification/${cheque}`);
    } catch (e) {
      callback(false, e);
    };
  }

  const updateDetailsSql = `UPDATE user_bank_details SET bank_name = '${bankName}',account_holder_name = '${accountHolderName}', account_no = '${accountNo}', bank_ifsc_code='${bankIfsc}', branch_name='${branchName}', cheque_image='${cheque}',bank_verification_status='PENDING', updated_at = CURRENT_TIMESTAMP WHERE id=${id}`;

  DBConnection.query(updateDetailsSql, async (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR']);
    } else {
      const subject = "Request for Bank Verification";
      const mailBody = await ejs.renderFile(`${ROOT_DIR}/templates/bankVerification.ejs`, { url: `${process.env.ADMIN_URL}/dashboard/user-bank-approval` });

      transporter.sendMail(mailOptions(process.env.ADMIN_EMAIL, subject, mailBody), async (error, info) => {
        if (error) {
          callback(false, error);
        } else {
          callback(true);
        }
      })

    }
  })
}

const createOrderModel = async (user_id, property_id, amount, callback) => {
  try {
    //INCREASE AMOUNT 
    const incAmount = 100;

    //meta
    const data = {
      "amount": amount * incAmount,
      "currency": "INR",
      "notes": {
        "user_id": user_id,
        "property_id": property_id
      }
    }

    //CREATE ORDER API
    var api_url = 'https://api.razorpay.com/v1/orders';
    var uname = process.env.RAZORPAY_API_KEY;
    var pass = process.env.RAZORPAY_SECRET_KEY;
    axios.post(api_url, data, {
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      auth: {
        username: uname,
        password: pass
      }
    }).then(async function (response) {
      if (Object.keys(response.data).length > 0) {
        const { id, currency, status, notes } = response.data;

        const insertSql = `INSERT INTO property_orders(order_id,property_id, user_id,amount, currency, note, order_status, payment_status) VALUES ('${id}','${property_id}', '${user_id}','${amount}', '${currency}', '${JSON.stringify(notes)}', '${status}', 'PENDING')`;
        DBConnection.query(insertSql, async (err, order) => {
          if (err) {
            callback(false, errors['SYSTEM_ERROR']);
          }
          else {
            if (order?.insertId > 0) {
              const getOrderDetails = await DBQuery(`select * from property_orders where property_order_id = '${order?.insertId}'`);
              callback(getOrderDetails);

            } else {
              callback(false, 'Order is not inserted');
            }
          }
        })
      } else {
        console.log('Data not found')
      }
    }).catch((err) => console.log('err', err))

  } catch (error) {
  }
}

const paymentStatusModel = async (user_id, property_id, property_order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, callback) => {
  if (razorpay_payment_id && razorpay_order_id && razorpay_signature) {
    const result = validatePaymentVerification({ "order_id": razorpay_order_id, "payment_id": razorpay_payment_id }, razorpay_signature, process.env.RAZORPAY_SECRET_KEY);

    if (result === true) {


      //When Payment is Success
      const insertSql = `INSERT INTO property_payments(propert_id,property_order_id,user_id, order_id,razorpay_payment_id, razorpay_signature, payment_status, amount) VALUES ('${property_id}','${property_order_id}','${user_id}', '${razorpay_order_id}','${razorpay_payment_id}', '${razorpay_signature}', 'SUCCESS', '${amount}')`;
      DBConnection.query(insertSql, async (err, payment) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {
          if (payment?.insertId > 0) {
            await DBQuery(`UPDATE property_orders SET payment_status='SUCCESS' ,updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);
            callback(true, "payment Success");

          } else {
            callback(false, 'Order is not inserted');
          }
        }
      })

    } else {

      //When Payment is Failed
      const insertSql = `INSERT INTO property_payments(propert_id,user_id, order_id,razorpay_payment_id, razorpay_signature, payment_status, amount) VALUES ('${property_order_id}','${user_id}', '${razorpay_order_id}','${razorpay_payment_id}', '${razorpay_signature}', 'FAILED', '${amount}')`;
      DBConnection.query(insertSql, async (err, payment) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {
          if (payment?.insertId > 0) {
            await DBQuery(`UPDATE property_orders SET payment_status='FAILED',updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);
            callback(false, "payment failed");
          } else {
            callback(false, 'Order is not inserted');
          }
        }
      })
    }
  } else {
    await DBQuery(`UPDATE property_orders SET payment_status='FAILED',updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);
    callback(false, "payment failed");
  }
}


const buyFractionModel = async (user_id, property_id, fraction_count, callback) => {

  const remainFractions = await DBQuery(`SELECT P.total_minted, count(mpd.id) as sold_out FROM properties P INNER JOIN mint_properties_data mpd ON mpd.property_id = P.property_id AND mpd.current_owner != '${process.env.PUBLIC_KEY}' WHERE P.property_id=${property_id} GROUP BY mpd.property_id`);

  if (remainFractions instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  }
  else if (remainFractions[0].total_minted === remainFractions[0].sold_out) {
    callback(false, 'All Fractions has been sold');
  }
  else if (fraction_count > (remainFractions[0].total_minted - remainFractions[0].sold_out)) {
    callback(false, `Only ${remainFractions[0].total_minted - remainFractions[0].sold_out} Fractions are remain`);
  }
  else {
    let user_data = await DBQuery(`select * from user_masters where user_id = '${user_id}'`);

    const get_wallet = user_data[0]['wallet_address'];
    const user_email = user_data[0]['user_email'];

    let fraction = await DBQuery(`select p.*,ps.* from properties as p left join property_settings as ps on p.admin_id = ps.admin_id where p.property_id = '${property_id}'`);

    let minimum = Number(fraction[0]['min_fraction_buy']);
    let maximum = Number(fraction[0]['max_fraction_buy']);



    if (fraction_count >= minimum && maximum >= fraction_count) {

      let fraction_price = Number(fraction[0]['fraction_price']);
      let ira_token_value = Number(fraction[0]['ira_token_value']);
      let total_fraction = Number(fraction_count * fraction_price).toFixed(2);
      let property_title = fraction[0]['title'];
      let platform_fee = fraction[0]['platform_fee'];

      currentPlatformFee = fraction[0]['platform_fee'];
      IRATOINR = fraction[0]['ira_token_value'];
      //check 2 percent IRA token
      let ira_token = Number(total_fraction * (currentPlatformFee / 100)).toFixed(18);
      ira_token = ira_token * IRATOINR;

      //add inr
      //total_fraction = total_fraction * ira_token_value;

      //Check user balance
      let user_balance = await getTokenBalance(get_wallet);

      if (user_balance >= ira_token) {

        // Check user permission
        let permission = await isApprovedForAll(get_wallet);

        if (permission) {


          if (permission >= ira_token) {
            // if (permission === false) {

            //Create Payment Order
            let orderDetails = await createOrder(property_id, user_id, total_fraction);

            if (!orderDetails) {

              //sendmail user
              const subject = 'Order cration failed'
              const mailStatus = await sendUserMail(platform_fee, fraction_price, property_title, subject, user_email, 'Failed', 'Failed', 'Failed', 'Failed', fraction_count, total_fraction, IRATOINR, (ira_token).toFixed(3));
              if (mailStatus instanceof Error) console.log(mailStatus, 'error');
              console.log('Order mailed successfully')

              callback(false, "Order creation failed")
            }
            else {
              if (typeof orderDetails === 'object') {

                const { id, currency, status, notes } = orderDetails.data;

                const insertSql = `INSERT INTO property_orders(order_id,property_id, user_id,amount, currency, note, order_status, payment_status,gas_transfer, nft_transfer, fractions, current_platform_fee, current_ira_value, calculated_gas_fee) VALUES ('${id}','${property_id}', '${user_id}','${total_fraction}', '${currency}', '${JSON.stringify(notes)}', '${status}', 'PENDING','PENDING','PENDING',${fraction_count},${currentPlatformFee},${IRATOINR},${ira_token})`;
                DBConnection.query(insertSql, async (err, order) => {
                  if (err) {
                    callback(false, errors['SYSTEM_ERROR']);
                  }
                  else {
                    if (order?.insertId > 0) {

                      //sendmail user when Order created
                      const subject = 'Order Created Successfully'
                      const mailStatus = await sendUserMail(id, platform_fee, fraction_price, property_title, subject, user_email, 'Created', 'Pending', 'Pending', 'Pending', fraction_count, total_fraction, IRATOINR, (ira_token).toFixed(3));
                      if (mailStatus instanceof Error) { console.log(mailStatus, 'error'); }

                      const getOrderDetails = await DBQuery(`select * from property_orders where property_order_id = '${order?.insertId}'`);
                      callback(getOrderDetails);

                    } else {
                      callback(false, 'Order is not inserted');
                    }
                  }
                })
              } else {
                callback(false, orderDetails);
              }
            }
          } else {
            callback(false, 'permission');
          }

        } else {
          callback(false, "permission")
        }
      } else {
        callback(false, 'You have Insufficient IRA Tokens');
      }
    } else {
      callback(false, "You can't buy too much property")
    }

  }
}


const fractionCalculationModel = async (user_id, property_id, fraction_count, callback) => {

  const remainFractions = await DBQuery(`SELECT P.total_minted, count(mpd.id) as sold_out FROM properties P INNER JOIN mint_properties_data mpd ON mpd.property_id = P.property_id AND  mpd.current_owner != '${process.env.PUBLIC_KEY}' WHERE P.property_id=${property_id} GROUP BY mpd.property_id`);

  const properties_nft_under_admin = await DBQuery(`select * from mint_properties_data WHERE property_id = ${property_id} AND current_owner = '${process.env.PUBLIC_KEY}'  LIMIT ${fraction_count}`)
  console.log(remainFractions)

  // if (remainFractions instanceof Error) {
  //   callback(false, errors['SYSTEM_ERROR']);
  // }
  // else if (remainFractions[0]?.total_minted === remainFractions[0]?.sold_out) {
  //   callback(false, 'All Fractions has been sold');
  // }
  // else if (fraction_count > (remainFractions[0]?.total_minted - remainFractions[0]?.sold_out)) {
  //   callback(false, `Only ${remainFractions[0].total_minted - remainFractions[0].sold_out} Fractions are remain`);
  // }

  if (properties_nft_under_admin.length == 0) {
    callback(false, 'Current Admin has no rights to transfer the fraction of this property.');
  }
  else {

    let fraction = await DBQuery(`select p.*,ps.* from properties as p inner join property_settings as ps on p.admin_id = ps.admin_id where p.property_id = '${property_id}'`);


    if (fraction.length > 0) {

      let minimum = Number(fraction[0]['min_fraction_buy']);
      let maximum = Number(fraction[0]['max_fraction_buy']);

      if (fraction_count >= minimum && maximum >= fraction_count) {

        let fraction_price = Number(fraction[0]['fraction_price']);
        let ira_token_value = Number(fraction[0]['ira_token_value']);
        // let total_fraction = Number(fraction_count * fraction_price * ira_token_value).toFixed(2);
        let total_fraction = Number(fraction_count * fraction_price).toFixed(2);

        callback(total_fraction)

      } else if (fraction_count > maximum) {
        callback(false, 'Cannot buy fractions more than Limit')
      } else {
        callback(false, 'Cannot buy fractions less than Limit')
      }

    } else {
      callback(false, 'Unknown property')
    }
  }
}


const invoiceClearanceModel = async (gas_fee, user_id, property_id, property_order_id, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, callback) => {
  try {
    const ADMIN_WALLET = process.env.PUBLIC_KEY;

    //get User Address
    let user_details = await DBQuery(`select * from user_masters where user_id = '${user_id}'`);
    if (user_details instanceof Error) {
      callback(false, "This user does not exists")
    }


    //get property
    let property_data = await DBQuery(`select p.*,ps.* from properties as p left join property_settings as ps on p.admin_id = ps.admin_id where p.property_id = '${property_id}'`);
    if (property_data instanceof Error) {
      callback(false, "This property does not exists")
    }

    //get property details
    let propertyDetails = await DBQuery(`select * from property_orders where property_order_id = '${property_order_id}'`);
    if (propertyDetails instanceof Error) {
      callback(false, "This user does not exists")
    }

    let { wallet_address, user_email } = user_details[0];

    let { title, fraction_price, platform_fee } = property_data[0]

    let { fractions, amount, current_ira_value, calculated_gas_fee } = propertyDetails[0];

    //Chack payment status

    const payment_status = checkPaymentStatus(razorpay_payment_id, razorpay_order_id, razorpay_signature);

    if (payment_status === true) {
      //When Payment is Success
      //Update Payment Receipt
      const insertSql = `INSERT INTO property_payments(propert_id,property_order_id,user_id, order_id,razorpay_payment_id, razorpay_signature, payment_status, amount,gas_transfer,nft_transfer) VALUES ('${property_id}','${property_order_id}','${user_id}', '${razorpay_order_id}','${razorpay_payment_id}', '${razorpay_signature}', 'SUCCESS', '${amount}','PENDING','PENDING')`;
      DBConnection.query(insertSql, async (err, payment) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {
          if (payment?.insertId > 0) {

            //sendmail user when Payment successful
            const subject = 'Payment Successful'
            const mailStatus = await sendUserMail(razorpay_order_id, platform_fee, fraction_price, title, subject, user_email, 'Created', 'Success', 'Pending', 'Pending', fractions, amount, current_ira_value, calculated_gas_fee);
            if (mailStatus instanceof Error) { console.log(mailStatus, 'error') };
            console.log('Payment mailed successfully')

            //Update Order Status
            await DBQuery(`UPDATE property_orders SET payment_status='SUCCESS' ,updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);

            const findOrder = `select * from property_orders where property_order_id = ${property_order_id}`;
            const orderResponse = await DBQuery(findOrder);

            if (orderResponse instanceof Error || orderResponse.length == 0) {
              callback(false, 'Unable to fetch the order details');
            }

            const _order = orderResponse[0];

            const contract = getContractInstance(IRA369, contracts['BNB']['BALANCE']);

            //Deduct IRA Token

            const [from, to, value, _gas_fee] = [ADMIN_WALLET, contracts['BNB'].BALANCE, 0, _order.calculated_gas_fee];

            const data = await contract.methods.transferFrom(wallet_address, ADMIN_WALLET, web3.utils.toWei(_gas_fee.toString())).encodeABI();

            const receipt = await sendRawTransaction('BNB', from, to, value, data).catch(err => err);

            if (receipt instanceof Error) {

              //sendmail user
              const subject = 'Gas Transfer Failed'
              const mailStatus = await sendUserMail(razorpay_order_id, platform_fee, fraction_price, title, subject, user_email, 'Created', 'Success', 'Failed', 'Failed', fractions, amount, current_ira_value, calculated_gas_fee);
              if (mailStatus instanceof Error) { console.log(mailStatus, 'error'); }
              console.log('Gas mailed successfully')


              //failed
              //update in order
              await DBQuery(`UPDATE property_orders SET gas_transfer='FAILED' ,updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);
              //update in payment
              await DBQuery(`UPDATE property_payments SET gas_transfer='FAILED' ,updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);


              callback(false, "Unable to deducte token"); return;
            }

            //sendmail user when gas transfer successful
            const successSubject = 'Gas Transfer Successful'
            const successMailStatus = await sendUserMail(razorpay_order_id, platform_fee, fraction_price, title, successSubject, user_email, 'Created', 'Success', 'Success', 'Pending', fractions, amount, current_ira_value, calculated_gas_fee);
            if (successMailStatus instanceof Error) { console.log(successMailStatus, 'error'); }
            console.log('Gas mailed successfully')

            // success
            //update in order
            await DBQuery(`UPDATE property_orders SET gas_transfer='SUCCESS' ,updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);

            //update in payment
            await DBQuery(`UPDATE property_payments SET gas_transfer='SUCCESS' ,updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);


            // callback(true, "payment Successful")
            //On Success, Transfer The NFTs

            const properties_nft = await DBQuery(`select * from mint_properties_data WHERE property_id = ${property_id} AND current_owner = '${ADMIN_WALLET}'  LIMIT ${_order.fractions}`)

            if (properties_nft instanceof Error) {
              callback(false, 'Not NFT Available on this property!!');
            }

            for (let $i = 0; $i < properties_nft.length; $i++) {
              const _contract = await getContractInstance(IRA, contracts['BNB'].MINT);


              const tx = {
                from: ADMIN_WALLET,
                to: contracts['BNB'].MINT,
                value: 0,
                data: _contract.methods.transferFrom(ADMIN_WALLET, wallet_address, properties_nft[$i].token_id).encodeABI()
              };
              const _receipt = await sendRawTransaction('BNB', tx.from, tx.to, tx.value, tx.data);
              if (_receipt instanceof Error) {
                console.log('Error in Property transfer', _receipt);
                //failed

                //sendmail user
                // const Subject = 'Nft Transfer Failed'
                // const MailStatus = await sendUserMail(title, Subject, user_email, 'Created', 'Success', 'Success', 'Failed', fractions, amount, current_ira_value, calculated_gas_fee);
                // if (MailStatus instanceof Error) console.log(MailStatus, 'error');
                // console.log('NFT mailed successfully')

                //update in order
                await DBQuery(`UPDATE property_orders SET nft_transfer='FAILED' ,updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);

                //update in payment
                await DBQuery(`UPDATE property_payments SET nft_transfer='FAILED' ,updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);

              }
              else {

                if (_receipt.status) {
                  // success

                  //sendmail user
                  // const Subject = 'Nft Transfered Successfully'
                  // const MailStatus = await sendUserMail(title, Subject, user_email, 'Created', 'Success', 'Success', 'Success', fractions, amount, current_ira_value, calculated_gas_fee);
                  // if (MailStatus instanceof Error) console.log(MailStatus, 'error');
                  // console.log('NFT mailed successfully')

                  //update current token
                  await DBQuery(`UPDATE mint_properties_data SET current_owner='${wallet_address}' ,updated_at=CURRENT_TIMESTAMP WHERE token_id=${properties_nft[$i].token_id}`);

                  //update in order
                  await DBQuery(`UPDATE property_orders SET nft_transfer='SUCCESS' ,updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);

                  //update in payment
                  await DBQuery(`UPDATE property_payments SET nft_transfer='SUCCESS' ,updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);

                }
                console.log('Property Transferred Successfully!');
              }
            }
            callback(true, "payment Successful")
          } else {
            callback(false, 'Order is not inserted');
          }
        }
      })

    } else {

      //When Payment is Failed
      const insertSql = `INSERT INTO property_payments(propert_id,user_id, order_id,razorpay_payment_id, razorpay_signature, payment_status, amount,gas_transfer,nft_transfer) VALUES ('${property_order_id}','${user_id}', '${razorpay_order_id}','${razorpay_payment_id}', '${razorpay_signature}', 'FAILED', '${amount}','FAILED','FAILED')`;
      DBConnection.query(insertSql, async (err, payment) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {
          if (payment?.insertId > 0) {

            //sendmail user when payment Failed
            const subject = 'Payment Failed'
            const mailStatus = await sendUserMail(fraction_price, title, subject, user_email, 'Created', 'Failed', 'Failed', 'Failed', fractions, amount, current_ira_value, calculated_gas_fee);
            if (mailStatus instanceof Error) { console.log(mailStatus, 'error') };

            await DBQuery(`UPDATE property_orders SET payment_status='FAILED',updated_at=CURRENT_TIMESTAMP WHERE property_order_id=${property_order_id}`);
            callback(false, "payment failed");
          } else {
            callback(false, 'Order is not inserted');
          }
        }
      })
    }
  } catch (error) {
    console.log(error)
  }

}

const requestWhiteListingModel = (id, callback) => {
  const searchSql = `SELECT * FROM user_masters WHERE user_id=${id}`;

  DBConnection.query(searchSql, async (err, user) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else if (user[0].wallet_address === null || user[0].wallet_address === '') {
      callback(false, errors['MSG064']);
    }
    else {

      const searchSql = `SELECT * FROM whitelist_address WHERE user_id=${id}`;

      const userResponse = await DBQuery(searchSql);

      if (userResponse instanceof Error) {
        callback(false, errors['SYSTEM_ERROR']);
      }
      else if (userResponse.length > 0) {
        callback(false, 'You have Already applied for Whitelisting');
      }
      else {
        const insertSql = `INSERT INTO whitelist_address(user_id) VALUES('${id}')`;

        DBConnection.query(insertSql, async (err, result) => {
          if (err) {
            callback(false, errors['SYSTEM_ERROR']);
          } else {
            const subject = "Request for Whitelist User";
            const mailBody = await ejs.renderFile(`${ROOT_DIR}/templates/whiteListVerification.ejs`, { url: `${process.env.ADMIN_URL}/dashboard/users` });

            transporter.sendMail(mailOptions(process.env.ADMIN_EMAIL, subject, mailBody), async (error, info) => {
              if (error) {
                callback(false, error);
              } else {
                callback(true);
              }
            })
          }
        })
      }

    }
  })

}

const getWhiteListUserModel = async (id, callback) => {
  const searchSql = `SELECT * FROM whitelist_address WHERE user_id=${id}`;

  const response = await DBQuery(searchSql);

  if (response instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  }
  else if (response.length === 0) {
    callback(false, 'Requesting Not Found');
  }
  else {
    callback(response[0]);
  }
}


const getUserNFTModel = async (id, callback) => {

  const searchNFTs = `SELECT GROUP_CONCAT(MPD.token_id) AS purchased_token,GROUP_CONCAT(MPD.uri) AS purchased_token_uri from user_masters as UM INNER JOIN mint_properties_data AS MPD ON UM.wallet_address=MPD.current_owner WHERE user_id=${id} GROUP BY MPD.property_id`;

  const userNFTs = await DBQuery(searchNFTs)

  if (userNFTs instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  }

  else if (userNFTs.length === 0) {
    callback(false, 'No NFTs Found');
  }
  else {
    callback(userNFTs);
  }
}


const addFractionPaymentRequestModel = async (propertyId, fractions, totalAmount, senderName, senderBankAccount, senderBankName, transactionDescription, id, hash, callback) => {

  const insertQuery = `INSERT INTO fraction_payment_request (property_id,user_id,fractions, total_amount,sender_name,sender_bank_account_no, sender_bank_name,transaction_description, hash) VALUES('${propertyId}', '${id}', '${fractions}', '${totalAmount}', '${senderName}', '${senderBankAccount}', '${senderBankName}', '${transactionDescription}', '${hash}')`;

  const response = await DBQuery(insertQuery);

  if (response instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  } else {
    const subject = 'Fraction Purchase Payment Request';
    const mailBody = await ejs.renderFile(`${ROOT_DIR}/templates/fractionBuyPaymentRequest.ejs`, { url: `${process.env.ADMIN_URL}/dashboard/payment-request` });

    transporter.sendMail(mailOptions(process.env.ADMIN_EMAIL, subject, mailBody), async (error, info) => {
      if (error) {
        callback(false, error);
      } else {
        callback(true);
      }
    })
  }
}


const verifyPurchaseLinkModel = async (hash, callback) => {
  const searchQuery = `SELECT * FROM fraction_payment_request WHERE hash='${hash}'`;

  const response = await DBQuery(searchQuery);

  if (response instanceof Error) {
    callback(false);
  }
  else if (response.length === 0) {
    callback(false, 'Request Not Found');
  }
  else if (response[0].transfer_status == 'PENDING') {
    callback(response[0].property_id);
  }
  else {
    callback(false, 'Something Went Wrong');
  }
}


const purchaseFractionsModel = async (hash, id, callback) => {

  const propertyResponse = await DBQuery(`SELECT * from fraction_payment_request WHERE hash='${hash}'`);

  if (propertyResponse instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  }
  else if (propertyResponse.length === 0) {
    callback(false, 'Data Not Found');
  }
  else if (propertyResponse[0].transfer_status === 'SUCCESS') {
    callback(false, 'Property Already Purchased');
  }
  else {

    const remainFractions = await DBQuery(`SELECT P.total_minted, count(mpd.id) as sold_out FROM properties P INNER JOIN mint_properties_data mpd ON mpd.property_id = P.property_id AND mpd.current_owner != '${process.env.PUBLIC_KEY}' WHERE P.property_id=${propertyResponse[0].property_id} GROUP BY mpd.property_id`);


    // if (remainFractions instanceof Error) {
    //   callback(false, errors['SYSTEM_ERROR']);
    // }
    // else if (remainFractions[0]?.total_minted === remainFractions[0]?.sold_out) {
    //   callback(false, 'All Fractions has been sold');
    // }
    // else if (remainFractions[0].fractions > (remainFractions[0].total_minted - remainFractions[0].sold_out)) {
    //   callback(false, `Only ${remainFractions[0].total_minted - remainFractions[0].sold_out} Fractions are remain`);
    // }
    // else {
    const response = await DBQuery(`SELECT UM.wallet_address, UM.user_email, P.*, PS.*,FPR.* FROM fraction_payment_request AS FPR LEFT JOIN user_masters AS UM ON FPR.user_id=UM.user_id LEFT JOIN properties AS P ON FPR.property_id = P.property_id LEFT JOIN property_settings as PS ON P.admin_id = PS.admin_id WHERE FPR.hash ='${hash}'`);

    if (response instanceof Error) {
      callback(false, errors['SYSTEM_ERROR']);
    } else {
      if (response[0]['transfer_status'] === 'SUCCESS') {
        callback(false, 'Property Already Purchased');
      }
      else {
        const get_wallet = response[0]['wallet_address'];
        const user_email = response[0]['user_email'];

        let fraction_price = Number(response[0]['fraction_price']);
        let ira_token_value = Number(response[0]['ira_token_value']);
        let total_fraction = Number(response[0]['fractions'] * response[0]['fraction_price']).toFixed(2);
        let property_title = response[0]['title'];
        let platform_fee = response[0]['platform_fee'];

        currentPlatformFee = response[0]['platform_fee'];
        IRATOINR = response[0]['ira_token_value'];

        let ira_token = Number(total_fraction * (currentPlatformFee / 100)).toFixed(18);
        ira_token = ira_token * IRATOINR;

        let user_balance = await getTokenBalance(get_wallet);


        if (user_balance >= ira_token) {
          // Check user permission
          let permission = await isApprovedForAll(get_wallet);

          if (permission) {
            if (permission >= ira_token) {
              const contract = getContractInstance(IRA369, contracts['BNB']['BALANCE']);

              //Deduct IRA Token
              const ADMIN_WALLET = process.env.PUBLIC_KEY;
              const [from, to, value, _gas_fee] = [ADMIN_WALLET, contracts['BNB'].BALANCE, 0, ira_token];

              const data = await contract.methods.transferFrom(get_wallet, ADMIN_WALLET, web3.utils.toWei(ira_token.toString())).encodeABI();

              const receipt = await sendRawTransaction('BNB', from, to, value, data).catch(err => err);

              if (receipt instanceof Error) {
                callback(false, 'Gas Transfer Failed');
              }
              else {
                const pendingFraction = response[0]['fractions'] - response[0]['total_fraction_transferred']
                const properties_nft = await DBQuery(`select * from mint_properties_data WHERE property_id = ${response[0]['property_id']} AND current_owner = '${ADMIN_WALLET}'  LIMIT ${pendingFraction}`)

                if (properties_nft instanceof Error) {
                  callback(false, 'Something Went Wrong, NFTs not found');
                }
                else if (properties_nft.length === 0) {
                  callback(false, 'Current Admin has no rights to transfer the fraction of this property.');
                }
                else {
                  for (let i = 0; i < properties_nft.length; i++) {
                    const _contract = await getContractInstance(IRA, contracts['BNB'].MINT);
                    const _nonce = await accountNonce(get_wallet);

                    const tx = {
                      nonce: _nonce,
                      from: ADMIN_WALLET,
                      to: contracts['BNB'].MINT,
                      value: 0,
                      data: _contract.methods.transferFrom(ADMIN_WALLET, get_wallet, properties_nft[i].token_id).encodeABI()
                    };

                    const _receipt = await sendRawTransaction('BNB', tx.from, tx.to, tx.value, tx.data);

                    if (_receipt instanceof Error) {
                      console.log(_receipt);
                      callback(false, 'Error in Property Transfer');
                      return;
                    }
                    else {
                      const updateFractionTransfer = await DBQuery(`UPDATE fraction_payment_request SET total_fraction_transferred = total_fraction_transferred + 1 WHERE hash ='${hash}'`);

                      if (updateFractionTransfer instanceof Error) {
                        callback(false, errors['SYSTEM_ERROR']);
                      }
                      await sleep(3000);

                    }
                  }
                  sync();
                  const updateStatus = await DBQuery(`UPDATE fraction_payment_request SET transfer_status='SUCCESS' WHERE hash ='${hash}'`);

                  if (updateStatus instanceof Error) {
                    callback(false, errors['SYSTEM_ERROR']);
                  } else {
                    console.log('Property Transferred Succesfully')
                    callback(true);
                  }
                }
              }
            } else {
              callback(false, 'permission');
            }
          } else {
            callback(false, "permission")
          }
        } else {
          callback(false, `You have Insufficient IRA Tokens, You need ${Number(ira_token)?.toFixed(2)} tokens`);
        }
      }
    }
    // }
  }


}

const checkPurchaseFractionModel = async (id, callback) => {
  const query = `SELECT * FROM fraction_payment_request WHERE user_id=${id} AND status='PENDING' AND user_id=${id}`;

  const response = await DBQuery(query);

  if (response instanceof Error) {
    callback(false, errors['SYSTEM_ERROR'])
  }
  else if (response.length === 0) {
    callback(false, 'No Request Found');
  }
  else {
    callback(response);
  }
}




module.exports = { sendOtpModel, verifyOtpModel, getUserDetailsModel, logoutModel, updateUserDetailsModel, resendMailVerificationModel, verifyPanCardModel, generateAadharOTPModel, verifyAadharCardModel, addBankDetailsModel, getuserBankDetailsModel, updateBankDetailsModel, createOrderModel, paymentStatusModel, buyFractionModel, invoiceClearanceModel, fractionCalculationModel, requestWhiteListingModel, getWhiteListUserModel, getUserNFTModel, addFractionPaymentRequestModel, verifyPurchaseLinkModel, purchaseFractionsModel, checkPurchaseFractionModel };
