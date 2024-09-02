require('dotenv').config();
const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URI
});

client.connect();

client.on('connect', () => {
  // console.log('🔗Redis database connected');
})

client.on('ready', () => {
  console.log('📛 Redis Database connected and ready to use');
})

client.on('error', (err) => {
  console.log(`Trouble in connecting Redis ${err}`);
})

module.exports = client;