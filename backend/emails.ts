// N19_Email_Agent output — Resend transactional templates
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = 'orders@shop.example.com';

export const sendOrderConfirmation = (to: string, order: any) =>
  resend.emails.send({ from: FROM, to, subject: `Order ${order.id.slice(0,8)} confirmed`,
    html: `<h2>Thanks for your order</h2>
      <p>Total: $${(order.total_cents/100).toFixed(2)}</p>
      <p>Track at <a href="${process.env.APP_URL}/orders">${process.env.APP_URL}/orders</a></p>` });

export const sendOrderShipped = (to: string, order: any, tracking?: string) =>
  resend.emails.send({ from: FROM, to, subject: `Order ${order.id.slice(0,8)} shipped`,
    html: `<h2>On its way</h2>${tracking ? `<p>Tracking: ${tracking}</p>` : ''}` });

export const sendRefundIssued = (to: string, order: any) =>
  resend.emails.send({ from: FROM, to, subject: `Refund issued for ${order.id.slice(0,8)}`,
    html: `<p>$${(order.total_cents/100).toFixed(2)} refunded to original payment method.</p>` });
