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
const rateLimit  = require('express-rate-limit');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Validate Required Environment Variables ──────────────────
const REQUIRED_ENV = ['MONGODB_URI', 'GMAIL_USER', 'GMAIL_PASS', 'RESEND_API_KEY'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missingEnv.join(', ')}`);
    console.warn('    Server will start, but features depending on these variables may be degraded.');
}

app.disable('x-powered-by');

// ── CORS configuration ───────────────────────────────────────
const allowedOrigins = [
    'http://localhost:5000',
    'http://127.0.0.1:5000',
    process.env.PRODUCTION_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. direct browser visits, same-origin, curl)
        if (!origin) return callback(null, true);
        
        // Allow configured origins or any railway app domain
        if (allowedOrigins.includes(origin) || origin.endsWith('.railway.app')) {
            return callback(null, true);
        }
        // Fallback: allow all in production if origin matching passes
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiting ────────────────────────────────────────────
const quoteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,                   // max 10 quote submissions per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again in 15 minutes.' }
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down.' }
});

app.use('/api/', apiLimiter);

// ── Serve static frontend files ──────────────────────────────
app.use(express.static(__dirname));
app.use('/JAVASCRIPTS', express.static(path.join(__dirname, 'JAVASCRIPTS')));
app.use('/STYLE CSS LOG', express.static(path.join(__dirname, 'STYLE CSS LOG')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/VIDEOS', express.static(path.join(__dirname, 'VIDEOS')));

// ── MongoDB Connection ───────────────────────────────────────
const dbURI = process.env.MONGODB_URI;

if (dbURI) {
    mongoose.connect(dbURI, { serverSelectionTimeoutMS: 5000 })
        .then(() => console.log('✅  Successfully connected to San Francisco MongoDB (sanFranciscoDB)!'))
        .catch((err) => console.error('❌  MongoDB connection warning:', err.message));
} else {
    console.warn('⚠️  No MONGODB_URI provided. Database operations will be skipped.');
}

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

// ── Security Helper: Escape HTML entities ────────────────────
// Prevents XSS when embedding user input inside HTML email bodies
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ── Validation Helper: Email Format ─────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isValidEmail(email) {
    return EMAIL_REGEX.test(String(email).toLowerCase());
}

// ── Helper: Send Email Confirmation ─────────────────────────
async function sendQuoteEmail(fullName, email, companyName, service, cargoDetails) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const gmailUser    = process.env.GMAIL_USER;
    const gmailPass    = process.env.GMAIL_PASS;

    // Sanitize all user-supplied content before embedding in HTML
    const safeName    = escapeHtml(fullName);
    const safeCompany = escapeHtml(companyName) || 'N/A';
    const safeEmail   = escapeHtml(email);
    const safeService = escapeHtml(service);
    const safeCargo   = escapeHtml(cargoDetails);

    const htmlBody = `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:580px;margin:0 auto;border:1px solid #00f5d4;border-radius:12px;overflow:hidden;background:#070b19;color:#ffffff;padding:24px;">
            <h2 style="color:#00f5d4;margin-top:0;">SAN FRANCISCO LOGISTICS</h2>
            <p style="color:#cbd5e1;">Dear <strong>${safeName}</strong>,</p>
            <p style="color:#cbd5e1;">Thank you for requesting a logistics quote. Your request has been saved and logged in our system:</p>
            <table style="width:100%;border-collapse:collapse;color:#e2e8f0;margin:16px 0;">
                <tr><td style="padding:8px 0;color:#94a3b8;">Company:</td><td><strong>${safeCompany}</strong></td></tr>
                <tr><td style="padding:8px 0;color:#94a3b8;">Email:</td><td><strong>${safeEmail}</strong></td></tr>
                <tr><td style="padding:8px 0;color:#94a3b8;">Service:</td><td><strong>${safeService}</strong></td></tr>
                <tr><td style="padding:8px 0;color:#94a3b8;">Cargo Details:</td><td><strong>${safeCargo}</strong></td></tr>
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
                    subject: `📦 Quote Request Received - ${safeName}`,
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
    const targetEmail = req.query.to || process.env.GMAIL_USER;
    if (!isValidEmail(targetEmail)) {
        return res.status(400).json({ error: 'Invalid target email address.' });
    }
    console.log(`🧪 Triggering test email to ${targetEmail}...`);
    const emailResult = await sendQuoteEmail('Test User', targetEmail, 'Test Corp', 'Air Freight', 'Test logistics details');
    res.json({ targetEmail, result: emailResult });
});

// Create Quote Request (saves to MongoDB)
app.post('/api/quote', quoteLimiter, async (req, res) => {
    try {
        const { fullName, companyName, email, phone, service, cargoDetails } = req.body;

        // Validate required fields
        if (!email || !cargoDetails) {
            return res.status(400).json({ error: 'Email and Cargo Details are required.' });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Please provide a valid email address.' });
        }

        // Validate fullName is present (schema requires it)
        if (!fullName || String(fullName).trim() === '') {
            return res.status(400).json({ error: 'Full name is required.' });
        }

        const newQuote = new Quote({
            fullName:     String(fullName).trim(),
            companyName:  companyName ? String(companyName).trim() : '',
            email:        String(email).trim().toLowerCase(),
            phone:        phone ? String(phone).trim() : '',
            service:      service || 'General Logistics',
            cargoDetails: String(cargoDetails).trim()
        });

        await newQuote.save();
        console.log(`✅ Saved quote request to MongoDB for ${email}`);

        // Trigger email notification asynchronously so response closes immediately
        sendQuoteEmail(
            newQuote.fullName, newQuote.email,
            newQuote.companyName, newQuote.service, newQuote.cargoDetails
        ).then(emailResult => {
            console.log('📧 Quote email dispatch result:', emailResult);
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

// Serve technology page
app.get('/technology', (req, res) => {
    res.sendFile(path.join(__dirname, 'technology.html'));
});

// Serve main page for any other route (SPA fallback)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 San Francisco Logistics Server running at http://0.0.0.0:${PORT}`);
    });
}

module.exports = app;
