// app/payment/page.js
import PaymentPage from '@/components/payment/PaymentPage';

export const metadata = {
  title: 'Payment | PressPass',
  description: 'Secure payment processing',
};

export default function Payment() {
  return <PaymentPage />;
}