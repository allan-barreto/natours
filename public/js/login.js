/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alerts';

const baseUrl = 'http://127.0.0.1:5000';
const api = '/api/v1';

export const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: `${baseUrl}${api}/users/login`,
      data: {
        email,
        password,
      },
    });

    console.log(res);

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');

      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: `${baseUrl}${api}/users/logout`,
    });
    if ((res.data.status = 'success')) location.reload(true);
  } catch (err) {
    showAlert('error', 'Error login out. Try again.');
  }
};
