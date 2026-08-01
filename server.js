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
    const gmailUser = process.env.GMAIL_USER || '';
    const gmailPass = process.env.GMAIL_PASS || '';

    if (!gmailUser || !gmailPass) {
        console.warn('⚠️  Email skipped: GMAIL_USER / GMAIL_PASS not set.');
        return { skipped: true };
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: gmailUser, pass: gmailPass },
            tls: { rejectUnauthorized: false }
        });

        const mailOptions = {
            from: `"San Francisco Logistics" <${gmailUser}>`,
            to: [email, gmailUser].join(','),
            subject: `📦 Quote Request Received - San Francisco Logistics`,
            html: `
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
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`✉️  Quote notification sent to ${email}`);
    } catch (err) {
        console.error('❌  Email send error:', err.message);
    }
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

        // Trigger email notification asynchronously
        sendQuoteEmail(fullName || 'Valued Client', email, companyName, service, cargoDetails);

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

// Serve sectors page
app.get('/sectors', (req, res) => {
    res.sendFile(path.join(__dirname, 'sectors.html'));
});

// Serve main page for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 San Francisco Logistics Server running at http://localhost:${PORT}`);
});
