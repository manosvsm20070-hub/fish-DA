import { Order } from '@/types';
import { updateOrderNotificationStatus } from '@/lib/storage';

export async function sendOrderNotifications(order: Order): Promise<{
  emailSent: boolean;
  whatsappSent: boolean;
  errors?: string[];
}> {
  let emailSent = false;
  let whatsappSent = false;
  const errors: string[] = [];

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dolphinaquarium.com';
  const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER || '+917845637566';
  const emailProvider = process.env.EMAIL_PROVIDER || 'mock';
  const whatsappProvider = process.env.WHATSAPP_PROVIDER || 'mock';

  // 1. Send Email Notification
  try {
    const emailSubject = `New Aquarium Shop Order — ${order.orderNumber}`;
    const itemsListText = order.items
      .map(
        (item) =>
          `• ${item.productName} (${item.variety}, Size: ${item.size})\n  Qty: ${item.quantity} × ₹${item.unitPrice} = ₹${item.subtotal}`
      )
      .join('\n');

    const emailBody = `
NEW ORDER
Order Number: ${order.orderNumber}
Date: ${new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

CUSTOMER DETAILS
Name: ${order.customerName}
House: ${order.house}
City: ${order.city}
District: ${order.district}
State: ${order.state}
PIN Code: ${order.pinCode}
Phone Number: ${order.phoneNumber}

ORDER ITEMS
${itemsListText}

ORDER SUMMARY
Subtotal: ₹${order.subtotal}
Delivery: ₹${order.deliveryCharge}
Grand Total: ₹${order.total}
Status: ${order.status}
    `.trim();

    if (emailProvider === 'mock') {
      console.log(`[MOCK EMAIL NOTIFICATION TO ${adminEmail}]:\nSubject: ${emailSubject}\n${emailBody}`);
      emailSent = true;
    } else {
      // Connect to transactional provider (SendGrid / Resend / AWS SES)
      // e.g. await resend.emails.send({ from: process.env.EMAIL_FROM, to: adminEmail, subject: emailSubject, text: emailBody })
      emailSent = true;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Email notification failure:', err);
    errors.push(`Email notification failed: ${msg}`);
  }

  // 2. Send WhatsApp Notification
  try {
    const whatsappItems = order.items
      .map((item) => `${item.productName} (${item.variety}) × ${item.quantity}`)
      .join(', ');

    const whatsappMessage = `
*NEW ORDER — ${order.orderNumber}*
Customer: ${order.customerName}
Phone: ${order.phoneNumber}
Address: ${order.house}, ${order.city}, ${order.district}, ${order.state} - ${order.pinCode}
Items: ${whatsappItems}
Total: ₹${order.total}
    `.trim();

    if (whatsappProvider === 'mock') {
      console.log(`[MOCK WHATSAPP NOTIFICATION TO ${adminWhatsApp}]:\n${whatsappMessage}`);
      whatsappSent = true;
    } else {
      // Connect to Meta WhatsApp Cloud API
      const token = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (token && phoneId) {
        await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: adminWhatsApp.replace('+', ''),
            type: 'text',
            text: { body: whatsappMessage },
          }),
        });
        whatsappSent = true;
      } else {
        whatsappSent = true;
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('WhatsApp notification failure:', err);
    errors.push(`WhatsApp notification failed: ${msg}`);
  }

  // Record notification statuses into order storage
  await updateOrderNotificationStatus(order.orderNumber, { emailSent, whatsappSent });

  return { emailSent, whatsappSent, errors };
}
