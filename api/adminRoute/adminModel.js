require('dotenv').config();

const util = require('util');
const errors = require('../translations/error.json');
const exec = util.promisify(require('child_process').exec);
const ejs = require('ejs');
const jwt = require('jsonwebtoken');
const { uploadPinata } = require('../../services/pinata');
const { transporter, mailOptions } = require('../../services/nodemailer.config');
const { getAuthConsentMessage, web3, whitelistUser, contracts, checkTokensInVault, getChecksumAddress, withDrawIRAFromVault, withDrawExchangeTokenFromVault, changeExchangeRate, addIRAToken, checkExchangeRate } = require('../../services/web3');
const { verifySignature } = require('../utils/validators');
const { runMintPropertyJob } = require('../../jobs/mintProperties');
const { agenda } = require('../../jobs/index');


const signInModel = (email, password, callback) => {

  //Check Valid Email and Password
  const sql = `select user_id, user_full_name, user_email, user_password, user_type, user_status FROM user_masters WHERE user_email = '${email}' and user_status = 1 and user_type = 'ADMIN'`;
  DBConnection.query(sql, (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR']);
    } else if (result.length == 0)
      callback(false, errors['MSG010']);
    else if (result.length > 0 && password !== result[0].user_password)
      callback(false, errors['MSG011']);
    else if (result.length > 0 && result[0].user_status === 0)
      callback(false, errors["MSG012"]);
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
const addPropertyModel = async (title, description, valuation, propertyCategory, rentalReturns, estimatedAppreciation, id, propertyImages, featuredImage, totalFractions, propertyLocation,
  fractionPrice, minFractionBuy, maxFractionBuy, callback) => {

  const searchSql = `SELECT * from properties WHERE title = '${title}' AND property_category='${propertyCategory}' AND property_location='${propertyLocation}'`;

  DBConnection.query(searchSql, async (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR'])
    } else if (result.length > 0) {
      callback(false, 'Property Already Exist');
    } else {

      //insert database
      const insertPropertySql = `Insert into properties(title,property_description,valuation,property_category,rental_returns,estimated_appreciation,property_images,featured_image,total_number_of_fraction,property_location,fraction_price,min_fraction_buy,max_fraction_buy,admin_id,created_at) values('${title}','${description}','${valuation}','${propertyCategory}','${rentalReturns}','${estimatedAppreciation}','${propertyImages}','${featuredImage}', '${totalFractions}','${propertyLocation}','${fractionPrice}','${minFractionBuy}','${maxFractionBuy}',${id}, CURRENT_TIMESTAMP)`;

      DBConnection.query(insertPropertySql, (err, propertyResult) => {
        if (err) {
          console.log(err)
          callback(false, errors['SYSTEM_ERROR']);
        } else {

          const searchPropertySetting = `SELECT * FROM property_settings WHERE admin_id=${id}`;
          DBConnection.query(searchPropertySetting, async (err, propertySearchResult) => {
            if (err) {
              callback(false, errors['SYSTEM_ERROR']);
            } else if (propertySearchResult.length === 0) {
              const iraTokenValue = 0.10;
              const platformFee = 2.5;
              const insertSql = `INSERT INTO property_settings(admin_id, ira_token_value, email_notification, created_at) VALUES ('${id}', '${iraTokenValue}', 0, CURRENT_TIMESTAMP)`;

              DBConnection.query(insertSql, async (err, result) => {
                if (err) {
                  callback(false, errors['SYSTEM_ERROR']);
                } else {
                  await runMintPropertyJob(agenda, `MINT_PROPERTY_${propertyResult.insertId}`, propertyResult.insertId, new Date(Date.now() + 5000))
                  callback(true);
                }
              })
            }
            else {
              await runMintPropertyJob(agenda, `MINT_PROPERTY_${propertyResult.insertId}`, propertyResult.insertId, new Date(Date.now() + 5000))

              callback(true);
            }
          })

        }
      });
    }
  })
}

const getPropertyModel = (id, userId, callback) => {
  if (id) {
    const searchSql = `SELECT * FROM properties WHERE property_id=${id}`;
    DBConnection.query(searchSql, (err, result) => {
      if (err) {
        callback(false, errors['SYSTEM_ERROR'])
      }
      else {
        callback(result[0])
      }
    })
  }
  else {
    const sql = `SELECT * FROM properties WHERE admin_id=${userId}`;
    DBConnection.query(sql, (err, result) => {
      if (err) {
        callback(false, errors['SYSTEM_ERROR']);
      } else {
        callback(result);
      };
    });
  }
}

const deletePropertyModel = async (propertyId, callback) => {
  const deleteSql = `DELETE FROM properties where property_id=${propertyId}`;
  DBConnection.query(deleteSql, (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR']);
    } else {
      const deleteTokenSql = `DELETE FROM token_activity WHERE property_id=${propertyId}`;
      DBConnection.query(deleteTokenSql, (err, deleteTokenResult) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        } else {
          callback(true);
        }
      })
    }
  })
}

const updatePropertyModel = async (id, title, description, valuation, propertyCategory, rentalReturns, estimatedAppreciation, user_id, propertyImages, featuredImage, totalFractions, propertyLocation,
  fractionPrice, minFractionBuy, maxFractionBuy, callback) => {

  const searchSql = `SELECT * FROM properties WHERE property_id='${id}'`;

  DBConnection.query(searchSql, (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else if (result.length === 0) {
      callback(false, errors['NOT_FOUND']);
    }
    else {
      const sql = `UPDATE properties SET title = '${title}' , valuation = ${valuation}, property_description='${description}' , property_category = '${propertyCategory}', rental_returns = ${rentalReturns} ,estimated_appreciation = ${estimatedAppreciation} ,property_images = '${propertyImages}', featured_image = '${featuredImage}', total_number_of_fraction = '${totalFractions}',property_location ='${propertyLocation}',fraction_price='${fractionPrice}',min_fraction_buy = '${minFractionBuy}',max_fraction_buy = '${maxFractionBuy}', updated_at = CURRENT_TIMESTAMP WHERE property_id='${id}'`;

      DBConnection.query(sql, (err, result) => {
        if (err) {
          callback(false, errors['SYSTEM_ERROR']);
        } else {
          callback(true);
        };
      })
    }
  })

}


const getPropertySettingsModel = (id, callback) => {
  const sql = `SELECT * FROM property_settings WHERE admin_id=${id}`;

  DBConnection.query(sql, (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR'])
    }
    else if (result.length === 0) {
      callback(false, errors["MSG028"]);
    } else {
      callback(result[0]);
    }

  })
}

const updateSettingsModel = (id, tokenValue, emailNotification, platformFee, callback) => {
  const updateSql = `UPDATE property_settings SET ira_token_value='${tokenValue}', email_notification='${emailNotification}', platform_fee='${platformFee}' WHERE admin_id='${id}'`;

  DBConnection.query(updateSql, (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR'])
    }
    else {
      callback(true);
    }
  })
}


const authConsentModel = (id, address, callback) => {
  if (!web3.utils.isAddress(address)) {
    callback(false, errors["MSG040"]);
  }
  else {
    const nonce = Math.floor((Math.random() + 1) * 100000);
    address = web3.utils.toChecksumAddress(address);

    const searchSql = `SELECT * FROM user_masters WHERE user_id=${id}`;

    DBConnection.query(searchSql, (err, result) => {
      if (err) {
        callback(false, errors['SYSTEM_ERROR']);
      }
      else if (result.length > 0) {

        const updateSql = `UPDATE user_masters SET wallet_address='${address}', nonce='${nonce}' WHERE user_id=${id}`;

        DBConnection.query(updateSql, (err, result) => {
          if (err) {
            callback(false, errors['SYSTEM_ERROR']);
          }
          else {
            const authConsentMessage = getAuthConsentMessage(address, nonce)
            callback(authConsentMessage);
          }
        })
      }
      else {
        const insertSql = `INSERT INTO user_masters(wallet_address,nonce) VALUES ('${address}', '${nonce}')`;

        DBConnection.query(insertSql, (err, result) => {
          if (err) {
            callback(false, errors['SYSTEM_ERROR']);
          }
          else {
            const authConsentMessage = getAuthConsentMessage(address, nonce)
            callback(authConsentMessage);
          }
        })

      }
    })
  }
}


const authUserModel = (address, signature, callback) => {
  if (!web3.utils.isAddress(address)) {
    callback(fales, errors["MSG040"]);
  }
  else {

    address = web3.utils.toChecksumAddress(address);
    const searchSql = `SELECT * FROM user_masters WHERE wallet_address='${address}'`;

    DBConnection.query(searchSql, (err, result) => {
      if (err) {
        callback(false, errors['SYSTEM_ERROR'])
      }
      else if (result.length === 0) {
        callback(false, errors['MSG010']);
      }
      else {
        const authConsentMessage = getAuthConsentMessage(address, result[0].nonce);

        if (verifySignature(authConsentMessage, address, signature)) {
          const user = {
            id: result[0].user_id,
            address: result[0].wallet_address,
            type: result[0].user_type.toUpperCase(),
            status: result[0].user_status
          };
          // Create JWT Token
          jwt.sign({ user }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
            if (err) {
              callback(false, errors['SYSTEM_ERROR']);
            }
            else {
              const nonce = Math.floor((Math.random() + 1) * 100000);

              const updateSql = `UPDATE user_masters SET nonce='${nonce}' WHERE wallet_address='${address}'`;
              DBConnection.query(updateSql, (err, res) => {
                if (err) {
                  callback(false, errors['SYSTEM_ERROR']);
                } else {
                  callback({
                    id: result[0].user_id,
                    type: result[0].user_type.toUpperCase(),
                    status: result[0].user_status,
                    token,
                  });
                }
              })
            };
          });
        }
        else {
          callback(false, errors['SOMETHING_WRONG'])
        }
      }
    })
  }
}


const getContractDetailsModel = async () => {
  const searchSql = `SELECT * FROM sync_contract`;

  const response = await DBQuery(searchSql);

  if (response instanceof Error) {
    return false;
  }
  else {
    return response[0];
  }
}

const getPropertiesDetails = async (id) => {

  const searchSql = `SELECT * FROM properties WHERE property_id=${id}`;

  const response = await DBQuery(searchSql);

  if (response instanceof Error) {
    return false;
  }
  else {
    return response[0];
  }
}


const getApprovalListModel = async (id, callback) => {
  if (id) {
    const searchSql = `SELECT * FROM user_bank_details AS UBC LEFT JOIN user_masters AS UM ON UBC.user_id = UM.user_id WHERE id=${id}`;
    DBConnection.query(searchSql, (err, result) => {
      if (err) {
        callback(false, errors['SYSTEM_ERROR']);
      } else {
        callback(result);
      }
    })

  } else {
    const searchSql = `SELECT * FROM user_bank_details WHERE bank_verification_status='PENDING'`;
    DBConnection.query(searchSql, (err, result) => {
      if (err) {
        callback(false, errors['SYSTEM_ERROR']);
      } else {
        callback(result);
      }
    })
  }

}

const requestApproveModel = async (id, approve, callback) => {
  let result = approve === 0 ? 'REJECTED' : 'ACCEPTED';

  const updateSql = `UPDATE user_bank_details SET bank_verification_status='${result}' WHERE id=${id}`;
  DBConnection.query(updateSql, async (err, res) => {
    if (err) {
      callback(false, err);
    } else {
      const searchUser = `SELECT UM.user_email FROM user_bank_details AS UBD LEFT JOIN user_masters AS UM ON UBD.user_id = UM.user_id WHERE id=${id};`;

      const user = await DBQuery(searchUser);

      if (user instanceof Error) {
        callback(false, 'Not able to send Mail to User');
      } else {
        const subject = 'Your Bank Details Has been Approved';
        const mailbody = await ejs.renderFile(`${ROOT_DIR}/templates/bankDetailsApproved.ejs`);
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


const getWhiteListUserModel = (callback) => {
  const searchQuery = `SELECT * FROM whitelist_address AS WA LEFT JOIN user_masters AS UM ON WA.user_id=UM.user_id WHERE status='PENDING'`;

  DBConnection.query(searchQuery, (err, result) => {
    if (err) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else {
      callback(result);
    }
  })
}

const approveWhitelistModel = async (id, approve, callback) => {
  if (approve === 1) {
    const searchQuery = `SELECT * from user_masters WHERE user_id=${id}`;

    const searchResult = await DBQuery(searchQuery);

    if (searchResult instanceof Error) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else {
      const response = await whitelistUser(searchResult[0].wallet_address);

      if (!response) {
        callback(false, errors['SYSTEM_ERROR']);
      } else {
        const updateSql = `UPDATE whitelist_address SET status='APPROVED' WHERE user_id=${id}`;
        const response = await DBQuery(updateSql);
        if (response instanceof Error) {
          callback(false, errors['SYSTEM_ERROR']);
        }
        else {

          const query = `SELECT UM.user_email FROM user_bank_details AS UBD LEFT JOIN user_masters AS UM ON UBD.user_id = UM.user_id WHERE id=${id};`;

          const user = await DBQuery(query);

          if (user instanceof Error) {
            callback(false, "User has been whitelisted, but could not send Mail");
          } else {
            const subject = "Request for Whitelist User";
            const mailBody = await ejs.renderFile(`${ROOT_DIR}/templates/whitelistApproved.ejs`);

            transporter.sendMail(mailOptions(searchResult[0].user_email, subject, mailBody), async (error, info) => {
              if (error) {
                callback(false, "User has been whitelisted, but could not send Mail");
              } else {
                callback(true);
              }
            })
          }
        }
      }
    }
  } else {
    const updateSql = `UPDATE whitelist_address SET status='REJECTED' WHERE user_id=${id}`;
    const response = await DBQuery(updateSql);
    if (response instanceof Error) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else {
      callback(true);
    }
  }

}

const getTransactionsModel = async (callback) => {

  const adminWallet = process.env.PUBLIC_KEY;
  // const searchSql = `SELECT *,COUNT(MPD.current_owner) AS transaction_count FROM mint_properties_data AS MPD  LEFT JOIN user_masters as UM ON MPD.current_owner=UM.wallet_address  WHERE MPD.current_owner != '${adminWallet}' GROUP BY MPD.current_owner `;

  const searchSql = `SELECT P.title, TA.transfer_event, TA.transaction_hash, TA.created_at, TA.token_id FROM token_activity AS TA LEFT JOIN properties as P ON TA.property_id=P.property_id `;

  const response = await DBQuery(searchSql);

  if (response instanceof Error) {
    callback(false, errors['SYSTEM_ERROR'])
  }
  else {
    callback(response)
  }

}

const getOrdersModel = async (callback) => {
  const orderQuery = `SELECT P.title, PO.fractions, PO.payment_status, PO.calculated_gas_fee, PO.nft_transfer from property_orders AS PO LEFT JOIN properties AS P ON PO.property_id=PO.property_id`;

  const orderResponse = await DBQuery(orderQuery);

  if (orderResponse instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  } else {
    callback(orderResponse)
  }
}

const getCustomerBankDetailsModel = async (callback) => {
  const bankDetailsQuery = `SELECT * FROM user_bank_details WHERE bank_verification_status='ACCEPTED'`;

  const response = await DBQuery(bankDetailsQuery);

  if (response instanceof Error) {
    callback(false, errors['SYSTEM_ERROR'])
  }
  else {
    callback(response);
  }
}


const getFractionPaymentRequestModel = async (callback) => {
  const searchSql = `SELECT P.*, FPR.* FROM fraction_payment_request FPR INNER JOIN properties P ON FPR.property_id = P.property_id WHERE status='PENDING'`;

  const response = await DBQuery(searchSql);

  if (response instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  }
  else {
    callback(response);
  }
}

const approveFractionPaymentRequestModel = async (id, approve, callback) => {
  if (approve === 1) {
    const updateSql = `UPDATE fraction_payment_request SET status='CONFIRMED' WHERE id=${id}`;

    const response = await DBQuery(updateSql);

    if (response instanceof Error) {
      callback(false, errors['SYSTEM_ERROR'])
    }
    else {

      const user = `SELECT UM.user_email,FPR.hash from fraction_payment_request AS FPR LEFT JOIN user_masters AS UM ON FPR.user_id = UM.user_id WHERE FPR.id = ${id} `;
      const userResponse = await DBQuery(user);

      if (userResponse instanceof Error) {
        callback(false, errors['SYSTEM_ERROR']);
      }
      else {
        const subject = "Your Payment Has been Approved";
        const mailBody = await ejs.renderFile(`${ROOT_DIR}/templates/ConfirmBuyPurchaseLink.ejs`, { url: `${process.env.SERVER_URL}/user/verify-purchase-link/${userResponse[0].hash}` });

        transporter.sendMail(mailOptions(userResponse[0].user_email, subject, mailBody), async (error, info) => {
          if (error) {
            callback(false, "User has been Approved, but could not send Mail");
          } else {
            callback(true);
          }
        })
      }
    }
  }
  else {
    const updateSql = `UPDATE fraction_payment_request SET status='REJECTED' WHERE id=${id}`;

    const response = await DBQuery(updateSql);

    if (response instanceof Error) {
      callback(false, errors['SYSTEM_ERROR'])
    }
    else {
      callback(true)
    }
  }
}


const getVaultIRABalanceModel = async (callback) => {
  const vaultTokens = await checkTokensInVault('IRA');

  if (vaultTokens instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
    return;
  }
  else {
    const exchangeTokens = await checkTokensInVault('EXCHANGE');

    if (exchangeTokens instanceof Error) {
      callback(false, errors['SYSTEM_ERROR']);
      return;
    }
    else {
      const getExchangeRate = await checkExchangeRate();

      if (getExchangeRate instanceof Error) {
        callback(false, errors['SYSTEM_ERROR']);
        return;
      }
      else {
        const data = { 'IRA': vaultTokens, 'ExchangeTokens': exchangeTokens, 'ExchangeRate': getExchangeRate };
        callback(data);
      }
    }
  }
}

const getVaultUSDTBalanceModel = async (callback) => {
  const response = await checkTokensInVault('EXCHANGE');

  if (response instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  } else {
    callback(response);
  }
}



const withdrawIRATokenBalanceModel = async (address, amount, callback) => {

  const checkTokens = await checkTokensInVault('IRA');

  if (amount > checkTokens) {
    callback(false, 'Not Enough Tokens in Reserve');
  }
  else {
    const checkSumAddress = await getChecksumAddress(address);

    const response = await withDrawIRAFromVault(amount, checkSumAddress);
    if (response) {
      callback(true);
    } else {
      callback(false, errors['SYSTEM_ERROR']);
    }
  }
}

const withdrawExchangeTokenBalanceModel = async (address, amount, callback) => {

  const checkTokens = await checkTokensInVault('EXCHANGE');

  if (amount > checkTokens) {
    callback(false, 'Not Enough Tokens in Reserve');
  }
  else {
    const checkSumAddress = await getChecksumAddress(address);

    const response = await withDrawExchangeTokenFromVault(amount, checkSumAddress);
    if (response instanceof Error) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else {
      const insertQuery = `INSERT INTO ira_token_transactions(wallet_address, transfer_from, transfer_to, gas_used, transaction_hash, usdt_amount, ira_amount, event) VALUES('${checkSumAddress}', '${response.from}', '${response.to}', '${response.gasUsed}', '${response.transactionHash}', '${amount}', '0', 'TRANSFER')`;

      const result = await DBQuery(insertQuery);

      if (result instanceof Error) {
        callback(false, errors['SYSTEM_ERROR'])
      }
      else {
        callback(true);
      }
    }
  }


}


const updateExchangeTokenRateModel = async (rate, callback) => {

  const response = await changeExchangeRate(rate);

  if (!response) {
    callback(false, errors['SYSTEM_ERROR']);
  }
  else {
    callback(true);
  }
}


const addIRATokenModel = async (amount, callback) => {

  const response = await addIRAToken(amount);

  if (response instanceof Error) {
    res
    callback(false, errors['SYSTEM_ERROR'])
  } else {
    const insertQuery = `INSERT INTO ira_token_transactions(transfer_from, transfer_to, gas_used, transaction_hash, usdt_amount, ira_amount, event) VALUES('${response.from}', '${response.to}', '${response.gasUsed}', '${response.transactionHash}', '0', '${amount}', 'TRANSFER')`

    const result = await DBQuery(insertQuery);

    if (result instanceof Error) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else {
      callback(true);
    }
  }

}


const getIRASalesTransactionsModel = async (date, callback) => {

  if (date != "null") {
    const searchQuery = `SELECT * FROM ira_token_transactions WHERE event="SALE" AND DATE(created_at)='${date}'`;
    const response = await DBQuery(searchQuery);

    if (response instanceof Error) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else {
      callback(response);
    }
  }

  else {
    const searchQuery = `SELECT * FROM ira_token_transactions WHERE event="SALE"`;
    const response = await DBQuery(searchQuery);

    if (response instanceof Error) {
      callback(false, errors['SYSTEM_ERROR']);
    }
    else {
      callback(response);
    }
  }



}


const getIRADepositTransactionModel = async (callback) => {

  const searchQuery = `SELECT * FROM ira_token_transactions WHERE event="TRANSFER" AND usdt_amount=0`;

  const response = await DBQuery(searchQuery);

  if (response instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  }
  else {
    callback(response);
  }
}
const getUSDTWithdrawlTransactionsModel = async (callback) => {

  const searchQuery = `SELECT * FROM ira_token_transactions WHERE event="TRANSFER" AND ira_amount=0`;

  const response = await DBQuery(searchQuery);

  if (response instanceof Error) {
    callback(false, errors['SYSTEM_ERROR']);
  }
  else {
    callback(response);
  }
}


module.exports = {
  signInModel, addPropertyModel, getPropertyModel, deletePropertyModel, updatePropertyModel, getPropertySettingsModel, updateSettingsModel, authConsentModel, authUserModel, getContractDetailsModel, getApprovalListModel, requestApproveModel, getPropertiesDetails, getWhiteListUserModel, approveWhitelistModel, getTransactionsModel, getOrdersModel, getCustomerBankDetailsModel, getFractionPaymentRequestModel, approveFractionPaymentRequestModel, getVaultIRABalanceModel, getVaultUSDTBalanceModel, withdrawIRATokenBalanceModel, withdrawExchangeTokenBalanceModel, updateExchangeTokenRateModel, addIRATokenModel, getIRASalesTransactionsModel, getIRADepositTransactionModel, getUSDTWithdrawlTransactionsModel
};