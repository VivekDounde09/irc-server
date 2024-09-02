const Agenda = require('agenda');
const { MintProperty } = require('./mintProperties');


const agenda = new Agenda({
  db: {
    address: process.env.MONGO_URI,
    collection: 'agendajobs',
    options: { useUnifiedTopology: true },
  },
  defaultLockLimit: 1,
  defaultConcurrency: 1
})

agenda.on('ready', () => {
  setTimeout(() => {
    // Initialize jobs handlers 
    MintProperty(agenda)
    // Start job service
    agenda.start();
  }, 5000);
});

agenda.on('error', (err) => {
  console.error(err);
});


module.exports = { agenda };