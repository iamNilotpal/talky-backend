const BASE_URL = process.env.BASE_URL + '/api';

const routes = {
  routes: [
    { path: `${BASE_URL}/send-otp`, description: 'Send OTP.' },
    { path: `${BASE_URL}/verify-otp`, description: 'Verify OTP.' },
    {
      path: `${BASE_URL}/refresh-tokens`,
      description: 'Refreshes access and refresh tokens.',
    },
    { path: `${BASE_URL}/activate`, description: 'Activates user.' },
    { path: `${BASE_URL}/logout`, description: 'Logs out user.' },
  ],
};

module.exports = routes;
