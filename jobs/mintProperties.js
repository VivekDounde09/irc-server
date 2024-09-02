const Agenda = require("agenda");
// const { getPropertiesDetails } = require('../api/adminRoute/adminModel');
const { batchMint } = require('../services/web3');

const reschedule = async (job) => {
  job.schedule(new Date(Date.now() + 5000));
  const response = await job.save().catch((err) => err);
  if (response instanceof Error) {
    console.error(response);
  }
};

const runMintPropertyJob = async (agenda, jobName, data, when) => {
  try {
    agenda.define(jobName, async (job, done) => {
      const data = job.attrs.data;
      try {
        if (data) {
          const response = await DBQuery(`SELECT * FROM properties WHERE property_id=${data} AND is_minted = 0 || is_minted = 10`);
          if (response instanceof Error) {
            console.error(response);
          }
          else {
            const res = await batchMint(response[0]);
            if (res instanceof Error) {
              await reschedule(job);
            } else {
              done();
            }
          }
        }
      } catch (err) {
        console.error(err);
        await reschedule(job);
      }
    })
    const jobs = await agenda.jobs({ name: jobName });

    if (jobs.length) {
      await reschedule(jobs[0]);
    } else {
      await agenda.schedule(when, jobName, data);
    }
  } catch (err) {
    console.log(err);
  }
}



const MintProperty = async (agenda) => {
  const searchSql = `SELECT * FROM properties WHERE is_minted=0`;
  const agendaJobs = await DBQuery(searchSql);

  if (agendaJobs instanceof Error) {
    console.error(agendaJobs);
  } else {
    agendaJobs.forEach((job) => {
      const jobName = `MINT_PROPERTY_${job.property_id}`;
      const data = job.property_id;
      const when = new Date(Date.now() + 5000);
      runMintPropertyJob(agenda, jobName, data, when);
    })
  }
}

module.exports = { MintProperty, runMintPropertyJob };

