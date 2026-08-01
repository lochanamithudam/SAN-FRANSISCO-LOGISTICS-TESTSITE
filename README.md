# 🚛 San Francisco Logistics — Enterprise Supply Chain Platform

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.19-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.style=for-the-badge)

**San Francisco Logistics** is a modern, high-performance full-stack web application designed for global supply chain, freight forwarding, and logistics management. It offers seamless freight quote submissions, automated customer notifications, real-time shipment tracking UI, and database persistence powered by MongoDB Atlas.

---

## 🌟 Key Features

- 📦 **Instant Quote Engine**: Interactive quote request form with immediate database persistence to MongoDB.
- ✉️ **Automated Email Notifications**: Asynchronous email confirmations dispatched to clients and enterprise logistics directors via Nodemailer.
- 📍 **Shipment Tracking Portal**: Responsive user interface for real-time cargo status lookup and delivery progress tracking.
- ⚡ **High-Performance Express Backend**: RESTful API supporting CORS, security headers (`x-powered-by` disabled), and health checks.
- 🐳 **Dockerized Deployment**: Fully containerized environment with custom multi-stage Docker build and Docker Compose configuration.
- 🌐 **Custom DNS Resolution Engine**: Embedded fallback for Windows SRV queries (`DNS_SERVERS`) to ensure unbroken connection to MongoDB Atlas clusters across restrictive corporate networks.
- 🎨 **Modern Glassmorphic UI**: Ultra-responsive styling, micro-animations, background video integrations, and dark-theme aesthetic.

---

## 🛠️ Tech Stack

### **Frontend**
- **HTML5 & Vanilla JavaScript (ES6+)**: Dynamic DOM manipulation and async API integrations.
- **Custom CSS3 Design System**: Modern glassmorphism, responsive CSS Grid/Flexbox layouts, and custom keyframe animations.

### **Backend**
- **Node.js & Express.js**: Fast, unopinionated web framework handling static assets and API routes.
- **Mongoose (ODM)**: Schema-based solution for MongoDB model modeling and data validation.
- **Nodemailer**: SMTP mail transport integration using Gmail service.

### **DevOps & Infrastructure**
- **Docker & Docker Compose**: Lightweight Node 18 Alpine runtime environment.
- **Nodemon**: Hot-reloading development server.

---

## 📂 Project Structure

```
SAN FRANCISCO LOGISTICS/
├── JAVASCRIPTS/
│   └── script.js          # Interactive frontend logic & client-side API requests
├── STYLE CSS LOG/
│   └── style.css          # Design system, glassmorphic UI tokens & animations
├── images/                # High-resolution branding & logistics visual assets
├── VIDEOS/                # Hero background video assets
├── .env                   # Environment variables (Git-ignored)
├── .gitignore             # Configured git exclusion patterns
├── docker-compose.yml     # Multi-container service orchestration
├── Dockerfile             # Production-ready Node 18 Alpine Docker image
├── index.html             # Main portal markup & web app structure
├── package.json           # Dependencies and npm script definitions
├── server.js              # Primary Express REST API & MongoDB connection
└── README.md              # Project documentation
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and configure the following parameters:

```env
# Server Configuration
PORT=5000

# Database Configuration (MongoDB Atlas Connection String)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/sanFranciscoDB?retryWrites=true&w=majority

# Email Notification System (Nodemailer / Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password

# Optional: Custom DNS Servers (Useful for resolving MongoDB SRV records on Windows)
DNS_SERVERS=8.8.8.8,1.1.1.1
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js (v18 or higher)](https://nodejs.org/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or local MongoDB instance
- [Docker Desktop](https://www.docker.com/) *(optional for containerized setup)*

---

### Method 1: Local Development

1. **Clone the Repository**
   ```bash
   git clone https://github.com/lochanamithudam/SAN-FRANSISCO-LOGISTICS-TESTSITE.git
   cd "SAN FRANSISCO LOGISTICS"
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Copy your connection strings and credentials into `.env`.

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5000`.

---

### Method 2: Docker Containerization

1. **Build and Run with Docker Compose**
   ```bash
   docker compose up --build
   ```

2. **Run via Docker Command Line**
   ```bash
   docker build -t san-francisco-logistics-app .
   docker run -p 5000:5000 --env-file .env san-francisco-logistics-app
   ```

---

## 📡 API Reference

### Health Check
- **`GET /api/health`**
  - **Description**: Returns operational status of the API server and database connectivity.
  - **Response Sample**:
    ```json
    {
      "status": "OK",
      "database": "Connected",
      "timestamp": "2026-08-01T10:35:00.000Z"
    }
    ```

### Quote Management
- **`POST /api/quote`**
  - **Description**: Saves a new logistics quote request to MongoDB and sends email notification.
  - **Request Body**:
    ```json
    {
      "fullName": "John Doe",
      "companyName": "Acme Corp",
      "email": "johndoe@example.com",
      "phone": "+1 555-0199",
      "service": "Air Freight Forwarding",
      "cargoDetails": "200kg electronics shipment from SFO to LHR"
    }
    ```
  - **Response**: `201 Created` with `quoteId`.

- **`GET /api/quote`**
  - **Description**: Fetches all submitted quotes sorted by date (newest first).

---

## 🔒 Security & Best Practices

- **Hidden Credentials**: Sensitive database URLs and API keys are maintained in environment variables (`.env`) and excluded via `.gitignore`.
- **Express Security**: Disabled `x-powered-by` header to prevent server fingerprinting.
- **CORS Configured**: Strict cross-origin permission settings for safe front-to-back communication.

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  Developed with ❤️ for <b>San Francisco Logistics Enterprise</b>
</p>
