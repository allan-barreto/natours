import axios from 'axios';
import { showAlert } from './alerts';

const baseUrl = 'http://127.0.0.1:5000';
const api = '/api/v1';

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? `${baseUrl}${api}/users/updateMyPassword`
        : `${baseUrl}${api}/users/updateMe`;
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully!`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
