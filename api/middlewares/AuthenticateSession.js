const jwt = require('jsonwebtoken');
const client = require('../../services/redis.config');

const isBlacklisted = async (token, callback) => {
  jwt.verify(token, process.env.TOKEN_SECRET_KEY, async (err, data) => {
    if (err) {
      callback(true);
    }
    else {
      const blackListData = await client.GET(`logout-${data.user.id}`);
      if (!blackListData) {
        callback(false);
      }
      else {
        const parsedData = JSON.parse(blackListData);
        if (parsedData[data.user.id].includes(token)) {
          callback(true);
        }
        else {
          callback(false);
        }
      }
    }
  })
}

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>
module.exports = AuthenticateSession = async (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if (typeof bearerHeader !== 'undefined') {
    // Split at the space
    const bearer = bearerHeader.split(' ');
    // Get token from array
    const bearerToken = bearer[1];

    if (bearerToken) {
      // Set the token
      req.token = bearerToken;
    } else {
      res.sendStatus(403);
      return;
    }

    isBlacklisted(req.token, (isJWTValidated) => {
      if (!isJWTValidated) {
        // Verify token
        jwt.verify(bearerToken, process.env.TOKEN_SECRET_KEY, (err, data) => {
          if (err) {
            res.sendStatus(403);
            return;
          } else if (req.baseUrl.split('/')[1] === data.user.type.toLowerCase() || data.user.type === 'ADMIN') {
            if (req.method === 'GET') {
              req.query.user_id = data.user.id;
              req.query.user_type = data.user.type;
            }
            else if (req.method === 'POST') {
              req.body.user_id = data.user.id;
              req.body.user_type = data.user.type;
            }
            next();
          } else {
            res.sendStatus(403);
            return;
          };
        });
      } else {
        res.sendStatus(403);
        return;
      }
    })
  } else {
    res.sendStatus(403);
    return;
  };
}