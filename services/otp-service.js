const crypto = require('crypto');

const SMS_SID = process.env.SMS_SID;
const SMS_AUTH_TOKEN = process.env.SMS_AUTH_TOKEN;
const SMS_PHONE_NUMBER = process.env.SMS_PHONE_NUMBER;

const hashService = require('./hash-service');
const twilio = require('twilio')(SMS_SID, SMS_AUTH_TOKEN, {
  lazyLoading: true,
});

class OtpService {
  generateOtp() {
    const otp = crypto.randomInt(1000, 9999);
    return otp;
  }

  async sendBySMS(phoneNumber, otp) {
    return await twilio.messages.create({
      to: phoneNumber,
      from: SMS_PHONE_NUMBER,
      body: `Your Talky OTP is ${otp}. OTP valid for only 3mins.`,
    });
  }

  verifyOtp(hashedOtp, data) {
    const computedHash = hashService.hashOtp(data);
    return hashedOtp === computedHash;
  }
}

module.exports = new OtpService();
