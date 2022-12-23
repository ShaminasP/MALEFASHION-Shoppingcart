// require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_TOKEN;
const serviceID = process.env.TWILIO_SESSION_SID;

sendSms = (phone) => {
  const client = require("twilio")(accountSid, authToken);
  client.verify.v2
    .services(serviceID)
    .verifications.create({ to: `+91${phone}`, channel: "sms" })
    .then((verification) => console.log(verification.status));
};

function veryfySms(phone, otp) {
  const client = require("twilio")(accountSid, authToken);

  return new Promise((resolve, reject) => {
    client.verify.v2
      .services(serviceID)
      .verificationChecks.create({ to: `+91${phone}`, code: otp })
      .then((verification_check) => {
        console.log(verification_check.status);
        resolve(verification_check);
      });
  });
}


module.exports = { sendSms, veryfySms };



