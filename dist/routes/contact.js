import express from 'express';
const { Router } = express;
import { execute, getOne } from '../config/db.js';
import { sendWelcomeNewsletterEmail, transporter } from '../utils/mail.js';
const router = Router();
// Submit contact form
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields',
            });
        }
        // Save to database
        await execute(`INSERT INTO contact_messages (name, email, phone, subject, message, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, NOW())`, [name, email, phone || null, subject, message]);
        // Send email notification
        if (process.env.SMTP_USER && process.env.CONTACT_EMAIL) {
            try {
                await transporter.sendMail({
                    from: `"Nut Baba Contact" <${process.env.MAIL_USER || process.env.SMTP_USER}>`,
                    to: process.env.CONTACT_EMAIL,
                    subject: `New Contact Form Submission: ${subject}`,
                    html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
                });
            }
            catch (emailError) {
                console.error('Failed to send email notification:', emailError);
            }
        }
        res.json({
            success: true,
            message: 'Thank you for contacting us! We will get back to you soon.',
        });
    }
    catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit contact form' });
    }
});
// Subscribe to newsletter
router.post('/newsletter', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        // Check if already subscribed
        const existing = await getOne('SELECT id FROM newsletter_subscribers WHERE email = ?', [email]);
        if (existing) {
            return res.json({ success: true, message: 'You are already subscribed!' });
        }
        // Save to database
        await execute('INSERT INTO newsletter_subscribers (email, subscribed_at) VALUES (?, NOW())', [email]);
        // Send Welcome Email
        try {
            await sendWelcomeNewsletterEmail(email);
        }
        catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // We don't fail the whole request just because the welcome email failed
        }
        res.json({
            success: true,
            message: 'Thank you for subscribing to our newsletter!',
        });
    }
    catch (error) {
        console.error('Newsletter subscription error:', error);
        res.status(500).json({ success: false, message: 'Failed to subscribe' });
    }
});
export default router;
