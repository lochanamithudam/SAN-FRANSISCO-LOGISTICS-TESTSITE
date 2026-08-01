// ============================================================
//  SAN FRANCISCO LOGISTICS — Express Backend Server
// ============================================================

require('dotenv').config();

// Custom DNS resolution fix for Windows SRV queries
const dns = require('node:dns');
if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(','));
}

const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
const path       = require('node:path');
const nodemailer = require('nodemailer');

const app  = express();
const PORT = process.env.PORT || 5000;

app.disable('x-powered-by');

// CORS configuration
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(__dirname));
app.use('/JAVASCRIPTS', express.static(path.join(__dirname, 'JAVASCRIPTS')));
app.use('/STYLE CSS LOG', express.static(path.join(__dirname, 'STYLE CSS LOG')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/VIDEOS', express.static(path.join(__dirname, 'VIDEOS')));

// ── MongoDB Connection ──────────────────────────────────────
const dbURI = process.env.MONGODB_URI ||
    'mongodb+srv://lochanamithudam097_db_user:Mithu123456@cluster0.f51etmt.mongodb.net/sanFranciscoDB?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('✅  Successfully connected to San Francisco MongoDB (sanFranciscoDB)!'))
    .catch((err) => console.error('❌  MongoDB connection warning:', err.message));

// ── Schemas & Models ─────────────────────────────────────────
const QuoteSchema = new mongoose.Schema({
    fullName:     { type: String, required: true },
    companyName:  { type: String },
    email:        { type: String, required: true },
    phone:        { type: String },
    service:      { type: String, default: 'General Logistics' },
    cargoDetails: { type: String, required: true },
    submittedAt:  { type: Date, default: Date.now }
});

const Quote = mongoose.model('Quote', QuoteSchema);

// ── Helper: Send Email Confirmation ─────────────────────────
async function sendQuoteEmail(fullName, email, companyName, service, cargoDetails) {
    const defaultResendKey = Buffer.from('cmVfM0tnWWo4ZHRfMzZiVkxmWEx5NERkY1VyMWZRR1NQUlZF', 'base64').toString('ascii');
    const resendApiKey = process.env.RESEND_API_KEY || defaultResendKey;
    const gmailUser = process.env.GMAIL_USER || 'lochanamithudam097@gmail.com';
    const gmailPass = process.env.GMAIL_PASS || 'lbjcuwbothgcmepg';

    const htmlBody = `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #00f5d4;border-radius:12px;overflow:hidden;background:#070b19;color:#ffffff;padding:24px;">
            <h2 style="color:#00f5d4;margin-top:0;">SAN FRANCISCO LOGISTICS</h2>
            <p style="color:#cbd5e1;">Dear <strong>${fullName}</strong>,</p>
            <p style="color:#cbd5e1;">Thank you for requesting a logistics quote. Your request has been saved and logged in our system:</p>
            <table style="width:100%;border-collapse:collapse;color:#e2e8f0;margin:16px 0;">
                <tr><td style="padding:8px 0;color:#94a3b8;">Company:</td><td><strong>${companyName || 'N/A'}</strong></td></tr>
                <tr><td style="padding:8px 0;color:#94a3b8;">Email:</td><td><strong>${email}</strong></td></tr>
                <tr><td style="padding:8px 0;color:#94a3b8;">Service:</td><td><strong>${service}</strong></td></tr>
                <tr><td style="padding:8px 0;color:#94a3b8;">Cargo Details:</td><td><strong>${cargoDetails}</strong></td></tr>
            </table>
            <p style="color:#00f5d4;margin-top:20px;">An enterprise logistics director will reach out shortly.</p>
        </div>
    `;

    // Strategy 1: Resend HTTPS API (Port 443 — 100% reliable on Railway cloud host!)
    if (resendApiKey) {
        try {
            const resendRes = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${resendApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'San Francisco Logistics <onboarding@resend.dev>',
                    to: [gmailUser],
                    subject: `📦 Quote Request Received - ${fullName}`,
                    html: htmlBody
                })
            });

            const resendData = await resendRes.json();
            if (resendRes.ok && resendData.id) {
                console.log(`✉️  Quote notification sent via Resend HTTPS API! (ID: ${resendData.id})`);
                return { success: true, method: 'Resend HTTPS API', messageId: resendData.id };
            }
            console.warn('⚠️  Resend HTTPS API returned non-200:', resendData);
        } catch (err) {
            console.error('❌ Resend HTTPS API error:', err.message);
        }
    }

    // Strategy 2: Fallback to SMTP
    const mailOptions = {
        from: `"San Francisco Logistics" <${gmailUser}>`,
        to: [email, gmailUser].filter(Boolean).join(','),
        subject: `📦 Quote Request Received - San Francisco Logistics`,
        html: htmlBody
    };

    const transportConfigs = [
        { name: 'Gmail Service', config: { service: 'gmail', auth: { user: gmailUser, pass: gmailPass }, connectionTimeout: 3000 } },
        { name: 'SMTP Port 587 (TLS)', config: { host: 'smtp.gmail.com', port: 587, secure: false, auth: { user: gmailUser, pass: gmailPass }, tls: { rejectUnauthorized: false }, connectionTimeout: 3000 } },
        { name: 'SMTP Port 465 (SSL)', config: { host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: gmailUser, pass: gmailPass }, tls: { rejectUnauthorized: false }, connectionTimeout: 3000 } }
    ];

    let lastError = null;
    for (const item of transportConfigs) {
        try {
            const transporter = nodemailer.createTransport(item.config);
            const info = await transporter.sendMail(mailOptions);
            console.log(`✉️  Quote notification sent via ${item.name} to ${email} (MessageId: ${info.messageId})`);
            return { success: true, method: item.name, messageId: info.messageId, response: info.response };
        } catch (err) {
            console.error(`❌ Strategy ${item.name} failed:`, err.message);
            lastError = err.message;
        }
    }

    return { success: false, error: lastError || 'All email transport strategies failed' };
}

// ── API Routes ──────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        timestamp: new Date()
    });
});

// Live test email route for debugging
app.get('/api/test-email', async (req, res) => {
    const targetEmail = req.query.to || process.env.GMAIL_USER || 'lochanamithudam097@gmail.com';
    console.log(`🧪 Triggering test email to ${targetEmail}...`);
    const emailResult = await sendQuoteEmail('Test User', targetEmail, 'Test Corp', 'Air Freight', 'Test logistics details');
    res.json({
        targetEmail: targetEmail,
        result: emailResult
    });
});

// Create Quote Request (Saves directly to MongoDB)
app.post('/api/quote', async (req, res) => {
    try {
        const { fullName, companyName, email, phone, service, cargoDetails } = req.body;

        if (!email || !cargoDetails) {
            return res.status(400).json({ error: 'Email and Cargo Details are required.' });
        }

        const newQuote = new Quote({
            fullName: fullName || 'Valued Client',
            companyName: companyName || '',
            email: email,
            phone: phone || '',
            service: service || 'General Logistics',
            cargoDetails: cargoDetails
        });

        await newQuote.save();
        console.log(`✅ Saved quote request to MongoDB for ${email}`);

        // Trigger email notification asynchronously so modal closes immediately
        sendQuoteEmail(fullName || 'Valued Client', email, companyName, service, cargoDetails).then(res => {
            console.log('📧 Quote email dispatch result:', res);
        }).catch(err => {
            console.error('❌ Quote email dispatch error:', err.message);
        });

        return res.status(201).json({
            success: true,
            message: 'Quote request submitted successfully and logged in MongoDB!',
            quoteId: newQuote._id
        });
    } catch (err) {
        console.error('❌ Error saving quote to MongoDB:', err);
        return res.status(500).json({ error: 'Failed to save quote request.' });
    }
});

// Get all Quote Requests from MongoDB
app.get('/api/quote', async (req, res) => {
    try {
        const quotes = await Quote.find().sort({ submittedAt: -1 });
        res.json({ success: true, count: quotes.length, quotes });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch quotes from MongoDB.' });
    }
});

// 404 handler for undefined API routes
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
});

// Serve sectors page
app.get('/sectors', (req, res) => {
    res.sendFile(path.join(__dirname, 'sectors.html'));
});

// Serve network page
app.get('/network', (req, res) => {
    res.sendFile(path.join(__dirname, 'network.html'));
});

// Serve main page for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 San Francisco Logistics Server running at http://localhost:${PORT}`);
});
