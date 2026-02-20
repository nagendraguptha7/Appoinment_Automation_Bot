WhatsApp Appointment Automation Bot
Overview
This project is a production-ready WhatsApp Appointment Booking Automation System built using:
Node.js
Express.js
Twilio WhatsApp Sandbox
Google Sheets API (as database)
Nodemailer (Gmail SMTP)
Git & GitHub for version control
The system allows users to book appointments through WhatsApp in a structured conversational flow. All bookings are stored in Google Sheets, and a confirmation email is automatically sent to the user.
System Architecture
WhatsApp User
→ Twilio Webhook
→ Express Server (/webhook)
→ Session State Engine
→ Google Sheets (Booking Storage)
→ Gmail SMTP (Email Confirmation)
The server runs locally (or can be deployed to cloud) and is exposed using ngrok for Twilio webhook integration.
Core Features
1. Conversational Booking Flow
The bot follows a structured multi-step conversation:
City Selection (numeric input)
Date Selection (next available working dates)
Time Slot Selection
Name Collection
Email Collection
Optional Comment
Booking Confirmation
Each user session is tracked using an in-memory session object based on WhatsApp sender ID.
2. City-Based Booking Logic
Supported Cities:
Hyderabad
Bangalore
Mumbai
Visakhapatnam
Delhi
Each booking is city-specific.
A slot booked in Hyderabad does NOT affect Bangalore.
3. Date Rules
Only future dates allowed
Only Tuesday to Saturday
Automatically generates next 5 valid working dates
4. Time Slot Rules
Available Slots:
10:00
11:00
12:00
14:00
15:00
16:00
Rules:
One booking per city per date per time
Booked slots are NOT displayed to user
If selected slot is taken, user is prompted to choose another
5. Google Sheets as Database
Bookings are stored in Google Sheets using Google Service Account authentication.
Stored Fields:
Name
Email
City
Date
Time
Comment
Timestamp
This eliminates the need for a traditional database while maintaining structured persistence.
6. Automated Email Confirmation
After successful booking:
System sends confirmation email via Gmail SMTP
Uses App Password authentication
Email contains booking details
API Endpoints
POST /webhook
Used by Twilio to process WhatsApp messages.
Handles:
Session management
Step transitions
Validation
Booking execution
Tech Stack
Backend:
Node.js
Express.js
Messaging:
Twilio WhatsApp Sandbox
Storage:
Google Sheets API v4
Email:
Nodemailer
Gmail SMTP (App Password)
Version Control:
Git
GitHub
Security Considerations
.env file used for storing sensitive credentials
Service Account JSON excluded from Git
Gmail App Password used instead of main password
GitHub repository excludes credentials via .gitignore
Scalability Considerations (Future Improvements)
Replace in-memory sessions with Redis or database
Deploy on AWS / Render / Railway
Add Admin Dashboard
Add cancellation & rescheduling
Integrate AI assistant for FAQ handling
Add role-based authentication
Convert Google Sheets to PostgreSQL for production scale
Add analytics & reporting layer
How to Run Locally
Clone the repository
Install dependencies
Bash
Copy code
npm install
Add .env file:
Copy code

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_digit_app_password
Add credentials.json (Google Service Account)
Run server:
Bash
Copy code
node server.js
Start ngrok:
Bash
Copy code
ngrok http 3000
Set Twilio webhook to:
Copy code

https://your-ngrok-url/webhook
Project Status
Current Version: Fully functional local automation system with:
WhatsApp conversational booking
Google Sheets persistence
Email confirmation
City-wise isolated slot validation
Author
Nagendra Guptha
AI & Automation Enthusiast
Full-stack AI workflow builder