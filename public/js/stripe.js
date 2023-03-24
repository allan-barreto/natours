import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
  'pk_test_51MoDIoCScYySDCmr3yxg7yGcBjA0xDKEkOewhYDeCgHkoiD41wM5zPhUJqzg5wo8XEzLvCXjuJ4xJq8UjtDHD9F300ytHA3xPa'
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(
      `http://127.0.0.1:5000/api/v1/booking/checkout-session/${tourId}`
    );
    console.log(session);
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
