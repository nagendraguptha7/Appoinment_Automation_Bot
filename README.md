# 🚀 WhatsApp Appointment Automation Bot

---

## 📌 Overview

This project is a **production-ready WhatsApp Appointment Booking Automation System** built using:

- **Node.js**
- **Express.js**
- **Twilio WhatsApp Sandbox**
- **Google Sheets API (Database Layer)**
- **Nodemailer (Gmail SMTP)**
- **Git & GitHub (Version Control)**

The system enables users to book appointments through WhatsApp using a structured conversational workflow.

All bookings are:
- Persisted in Google Sheets
- Validated against city/date/time uniqueness
- Confirmed via automated email

---

## 🏗 System Architecture

```
WhatsApp User
        ↓
Twilio Webhook
        ↓
Express Server (/webhook)
        ↓
Session State Engine
        ↓
Google Sheets (Booking Storage)
        ↓
Gmail SMTP (Email Confirmation)
```

The server runs locally and is exposed using **ngrok** for Twilio webhook integration.

---

## 🔁 Conversational Booking Flow

The bot follows a structured multi-step state-driven conversation:

1. City Selection (Numeric Input)
2. Date Selection (Next Valid Working Dates)
3. Time Slot Selection
4. Name Collection
5. Email Collection
6. Optional Comment
7. Booking Confirmation

Each user session is tracked using an **in-memory session object** mapped to the WhatsApp sender ID.

---

## 🌆 City-Based Booking Logic

### Supported Cities

1. Hyderabad  
2. Bangalore  
3. Mumbai  
4. Visakhapatnam  
5. Delhi  

### Booking Isolation Rule

✔ Each booking is **city-specific**  
✔ A slot booked in Hyderabad does NOT affect Bangalore  
✔ Slot uniqueness = `City + Date + Time`

---

## 📅 Date Rules

- Only future dates are allowed
- Only Tuesday to Saturday permitted
- Automatically generates the next 5 valid working dates

---

## ⏰ Time Slot Rules

### Available Slots

- 10:00  
- 11:00  
- 12:00  
- 14:00  
- 15:00  
- 16:00  

### Validation Rules

- One booking per city per date per time
- Booked slots are **NOT displayed** to users
- If a selected slot is already taken → user must choose another

---

## 🗄 Google Sheets as Database

Instead of a traditional database, this system uses:

**Google Sheets API v4 with Service Account Authentication**

### Stored Fields

- Name
- Email
- City
- Date
- Time
- Comment
- Timestamp

This approach ensures structured persistence without requiring database infrastructure.

---

## 📧 Automated Email Confirmation

After successful booking:

- Confirmation email is sent via **Gmail SMTP**
- Uses **App Password authentication**
- Email includes full booking details

---

## 🔌 API Endpoints

### `POST /webhook`

Used by Twilio to process incoming WhatsApp messages.

Handles:

- Session management
- Step transitions
- Input validation
- Booking execution
- Email confirmation trigger

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js

### Messaging
- Twilio WhatsApp Sandbox

### Storage
- Google Sheets API v4

### Email
- Nodemailer
- Gmail SMTP (App Password)

### Version Control
- Git
- GitHub

---

## 🔐 Security Considerations

- `.env` file used for sensitive credentials
- Google Service Account JSON excluded via `.gitignore`
- Gmail App Password used instead of main account password
- No credentials stored in repository

---

## 📈 Scalability & Future Improvements

Planned enhancements:

- Replace in-memory sessions with Redis or persistent database
- Deploy to AWS / Render / Railway
- Admin dashboard for monitoring bookings
- Cancellation & rescheduling support
- AI assistant for FAQ handling
- Role-based authentication
- Migration from Google Sheets to PostgreSQL
- Analytics & reporting layer

---

## ▶️ How to Run Locally

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/Appoinment_Automation_Bot.git
cd Appoinment_Automation_Bot
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Create `.env` File

```
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password
```

### 4️⃣ Add Google Service Account File

Place `credentials.json` in the root directory.

### 5️⃣ Start Server

```bash
node server.js
```

### 6️⃣ Start ngrok

```bash
ngrok http 3000
```

### 7️⃣ Set Twilio Webhook URL

```
https://your-ngrok-url/webhook
```

---

## 📊 Project Status

✅ Fully Functional Local Automation System  
✅ WhatsApp Conversational Booking  
✅ Google Sheets Persistence  
✅ Automated Email Confirmation  
✅ City-wise Slot Isolation  
✅ Production-Ready Architecture Pattern  

---

## 👤 Author

**Nagendra Guptha**  
AI & Automation Enthusiast  
Full-Stack Workflow Architect