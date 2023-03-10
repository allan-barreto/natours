/* eslint-disable */
import '@babel/polyfill';
import { login, logout } from './login';
// import { displayMap } from './map';

//DOM ELEMENTS
// const mapbox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');

//VALUES

//DELEGATION
// if (mapbox) {
//   const locations = JSON.parse(mapbox.dataset.locations);
//   displayMap(locations);
// }

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);
