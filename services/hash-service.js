const crypto = require('crypto');

class HashService {
  hashOtp(data) {
    return crypto
      .createHmac('sha256', process.env.SECRET_HASH_OTP)
      .update(data)
      .digest()
      .toString('hex');
  }
}

module.exports = new HashService();
