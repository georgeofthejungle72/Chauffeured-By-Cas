import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";

const PORT = 3000;

async function startServer() {
  const app = express();
  
  app.use(express.json());

  // API route for email booking
  app.post("/api/book", async (req, res) => {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      return res.status(500).json({ error: "RESEND_API_KEY environment variable is not configured." });
    }

    const resend = new Resend(resendKey);
    const { name, pickup, dropoff, date, time, vehicleOptions, phone, email } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: "Name, phone and email are required fields." });
    }

    try {
      const data = await resend.emails.send({
        from: 'Enquiries <onboarding@resend.dev>',
        to: 'cassaleem92@gmail.com',
        subject: 'New Chauffeur Booking!',
        html: `
          <h2>Booking Details -</h2>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${time} GMT</p>
          <p><strong>Pick-up:</strong> ${pickup}</p>
          <p><strong>Drop-off:</strong> ${dropoff}</p>
          <p><strong>Vehicle:</strong> ${vehicleOptions}</p>
          <p><strong>Customer Name:</strong> ${name}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Email:</strong> ${email}</p>
          <br/>
          <p>Chauffeur request by customer from chauffeuredbycas.co.uk</p>
        `,
      });

      res.status(200).json({ data });
    } catch (error) {
      console.error("Failed to send email", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: If using esbuild, cwd is the project root because we compiled it there.
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
