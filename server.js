// ============================================================
//  SAN FRANCISCO LOGISTICS — Express Backend Server
// ============================================================

require('dotenv').config();

// Custom DNS resolution fix for Windows SRV queries
const dns = require('node:dns');
if (process.env.DNS_SERVERS) {
    dns.setServers(process.env.DNS_SERVERS.split(','));
}

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('node:path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');

const app = express();
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

        // Allow configured origins, any local dev origin (localhost or 127.0.0.1 on any port), or railway app domain
        if (
            allowedOrigins.includes(origin) ||
            origin.endsWith('.railway.app') ||
            /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
            return callback(null, true);
        }
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
    fullName: { type: String, required: true },
    companyName: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    service: { type: String, default: 'General Logistics' },
    cargoDetails: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now }
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
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;

    // Sanitize all user-supplied content before embedding in HTML
    const safeName = escapeHtml(fullName);
    const safeCompany = escapeHtml(companyName) || 'N/A';
    const safeEmail = escapeHtml(email);
    const safeService = escapeHtml(service);
    const safeCargo = escapeHtml(cargoDetails);

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

    // Unique list of recipient emails (both customer and admin)
    const recipients = Array.from(new Set([email, gmailUser].filter(Boolean)));
    const mailOptions = {
        from: `"San Francisco Logistics" <${gmailUser}>`,
        to: recipients.join(','),
        subject: `📦 Quote Request Received - ${safeName}`,
        html: htmlBody
    };

    let smtpSuccess = false;
    let smtpResult = null;

    // Strategy 1: Gmail SMTP (Sends to both customer & admin directly)
    if (gmailUser && gmailPass) {
        const transportConfigs = [
            { name: 'Gmail Service', config: { service: 'gmail', auth: { user: gmailUser, pass: gmailPass }, connectionTimeout: 5000 } },
            { name: 'SMTP Port 587 (TLS)', config: { host: 'smtp.gmail.com', port: 587, secure: false, auth: { user: gmailUser, pass: gmailPass }, tls: { rejectUnauthorized: false }, connectionTimeout: 5000 } },
            { name: 'SMTP Port 465 (SSL)', config: { host: 'smtp.gmail.com', port: 465, secure: true, auth: { user: gmailUser, pass: gmailPass }, tls: { rejectUnauthorized: false }, connectionTimeout: 5000 } }
        ];

        for (const item of transportConfigs) {
            try {
                const transporter = nodemailer.createTransport(item.config);
                const info = await transporter.sendMail(mailOptions);
                console.log(`✉️  Quote notification sent via ${item.name} to [${recipients.join(', ')}] (MessageId: ${info.messageId})`);
                smtpSuccess = true;
                smtpResult = { success: true, method: item.name, messageId: info.messageId, response: info.response };
                break;
            } catch (err) {
                console.error(`❌ ${item.name} failed:`, err.message);
            }
        }
    }

    // Strategy 2: Resend HTTPS API (Admin alert backup)
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
                console.log(`✉️  Admin quote alert sent via Resend HTTPS API! (ID: ${resendData.id})`);
                if (!smtpSuccess) {
                    return { success: true, method: 'Resend HTTPS API', messageId: resendData.id };
                }
            } else {
                console.warn('⚠️  Resend HTTPS API alert result:', resendData.message || resendData);
            }
        } catch (err) {
            console.error('❌ Resend HTTPS API error:', err.message);
        }
    }

    if (smtpSuccess) {
        return smtpResult;
    }

    return { success: false, error: 'All email transport strategies failed. Check server logs.' };
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

// Create Quote Request (saves to MongoDB with graceful fallback)
app.post('/api/quote', quoteLimiter, async (req, res) => {
    try {
        const { fullName, companyName, email, phone, service, cargoDetails } = req.body;

        // Validate required fields
        if (!email || !cargoDetails) {
            return res.status(400).json({ error: 'Email and Cargo Details are required.' });
        }

        const trimmedEmail = String(email).trim().toLowerCase();

        // Validate email format
        if (!isValidEmail(trimmedEmail)) {
            return res.status(400).json({ error: 'Please provide a valid email address (e.g., name@company.com).' });
        }

        // Validate fullName is present
        const trimmedName = fullName ? String(fullName).trim() : '';
        if (!trimmedName) {
            return res.status(400).json({ error: 'Full name is required.' });
        }

        const safeCompany = companyName ? String(companyName).trim() : '';
        const safePhone = phone ? String(phone).trim() : '';
        const safeService = service || 'General Logistics';
        const safeCargo = String(cargoDetails).trim();

        let savedQuoteId = null;

        // Attempt MongoDB Save if connection is active
        if (mongoose.connection.readyState === 1) {
            try {
                const newQuote = new Quote({
                    fullName: trimmedName,
                    companyName: safeCompany,
                    email: trimmedEmail,
                    phone: safePhone,
                    service: safeService,
                    cargoDetails: safeCargo
                });

                const savedDoc = await newQuote.save();
                savedQuoteId = savedDoc._id;
                console.log(`✅ Saved quote request to MongoDB for ${trimmedEmail} (ID: ${savedQuoteId})`);
            } catch (dbErr) {
                console.error('⚠️ Could not save quote to MongoDB:', dbErr.message);
            }
        } else {
            console.warn(`⚠️ MongoDB not connected (readyState=${mongoose.connection.readyState}). Logging quote request to memory/console.`);
            console.log(`📦 Pending Quote Request from ${trimmedName} (${trimmedEmail}): ${safeCargo}`);
        }

        // Trigger email notification asynchronously
        sendQuoteEmail(
            trimmedName, trimmedEmail, safeCompany, safeService, safeCargo
        ).then(emailResult => {
            console.log('📧 Quote email dispatch result:', emailResult);
        }).catch(err => {
            console.error('❌ Quote email dispatch error:', err.message);
        });

        return res.status(201).json({
            success: true,
            message: 'Quote request submitted successfully!',
            quoteId: savedQuoteId || `LOCAL-${Date.now()}`
        });
    } catch (err) {
        console.error('❌ Error handling quote request:', err);
        return res.status(500).json({ error: err.message || 'Failed to process quote request.' });
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

// Serve automated gantry cranes page
app.get(['/cranes', '/gantry-cranes', '/automated-cranes'], (req, res) => {
    res.sendFile(path.join(__dirname, 'cranes.html'));
});

// Serve sustainability & ESG page
app.get(['/sustainability', '/esg'], (req, res) => {
    res.sendFile(path.join(__dirname, 'sustainability.html'));
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
