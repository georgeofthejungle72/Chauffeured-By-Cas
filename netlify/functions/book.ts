import { Handler } from '@netlify/functions';
import { Resend } from 'resend';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return { statusCode: 500, body: JSON.stringify({ error: "RESEND_API_KEY environment variable is not configured." }) };
  }

  const resend = new Resend(resendKey);
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON body." }) };
  }

  const { name, pickup, dropoff, date, time, vehicleOptions, phone, email, waitTime } = body;

  if (!name || !phone || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: "Name, phone and email are required fields." }) };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Bookings <bookings@chauffeuredbycas.com>',
      to: 'enquiries@chauffeuredbycas.com',
      subject: 'New Chauffeur Booking!',
      html: `
        <h2>Booking Details</h2>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time} GMT</p>
        <p><strong>Pick-up:</strong> ${pickup}</p>
        <p><strong>Drop-off:</strong> ${dropoff}</p>
        ${waitTime ? `<p><strong>Wait Time At Airport:</strong> ${waitTime} Minutes</p>` : ''}
        <p><strong>Vehicle:</strong> ${vehicleOptions}</p>
        <p><strong>Customer Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <br/><hr>
        <p>Chauffeur request made by customer from chauffeuredbycas.com</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ data })
    };
  } catch (error: any) {
    console.error("Exception sending email", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || "Failed to send email" }) };
  }
};
