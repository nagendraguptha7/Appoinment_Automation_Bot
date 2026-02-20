require("dotenv").config();
const express = require("express");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const SHEET_ID = "1eYs_BW22MLRwlmnhR6CqUFsgrX59wMSLOSU1vRdfAG8";

const CITIES = [
  "Hyderabad",
  "Bangalore",
  "Mumbai",
  "Visakhapatnam",
  "Delhi"
];

const AVAILABLE_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "14:00",
  "15:00",
  "16:00"
];

const sessions = {};

// ---------------- GOOGLE SHEETS ----------------

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: "credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function getExistingBookings(city, date) {
  const sheets = await getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A2:G",
  });
  const rows = response.data.values || [];
  return rows
    .filter(row => row[2] === city && row[3] === date)
    .map(row => row[4]);
}

async function addBooking(data) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "Sheet1!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[
        data.name,
        data.email,
        data.city,
        data.date,
        data.time,
        data.comment,
        new Date().toISOString()
      ]],
    },
  });
}

// ---------------- EMAIL ----------------

async function sendConfirmationEmail(data) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Appointment Booking" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: "Appointment Confirmed ✅",
    text: `
Hello ${data.name},

Your appointment has been successfully booked.

City: ${data.city}
Date: ${data.date}
Time: ${data.time}

Thank you for choosing us.
    `,
  });
}

// ---------------- DATE GENERATOR ----------------

function getNextDates() {
  const dates = [];
  const today = new Date();

  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const day = d.getDay();
    if (day >= 2 && day <= 6) {
      dates.push(d.toISOString().split("T")[0]);
    }

    if (dates.length === 5) break;
  }

  return dates;
}

// ---------------- WHATSAPP FLOW ----------------

app.post("/webhook", async (req, res) => {

  const incomingMsg = (req.body.Body || "").trim();
  const sender = req.body.From;

  if (!sessions[sender]) {
    sessions[sender] = { step: "welcome" };
  }

  const session = sessions[sender];
  let reply = "";

  try {

    // RESTART
    if (incomingMsg.toLowerCase() === "restart") {
      sessions[sender] = { step: "welcome" };
      session.step = "welcome";
    }

    // STEP 0 - WELCOME
    if (session.step === "welcome") {
      session.step = "city";

      reply =
`👋 Welcome to Appointment Booking

Please select a city:

${CITIES.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Reply with the city number.`;
    }

    // STEP 1 - CITY
    else if (session.step === "city") {

      const index = parseInt(incomingMsg);

      if (!isNaN(index) && index >= 1 && index <= CITIES.length) {
        session.city = CITIES[index - 1];
        session.step = "date";

        const dates = getNextDates();

        reply =
`📅 Select a Date:

${dates.map((d, i) => `${i + 1}. ${d}`).join("\n")}

Reply with the date number.`;

      } else {
        reply = "Invalid city number.\nPlease try again.";
      }
    }

    // STEP 2 - DATE
    else if (session.step === "date") {

      const dates = getNextDates();
      const index = parseInt(incomingMsg);

      if (!isNaN(index) && index >= 1 && index <= dates.length) {
        session.date = dates[index - 1];
        session.step = "time";

        reply =
`⏰ Select a Time:

${AVAILABLE_SLOTS.map((t, i) => `${i + 1}. ${t}`).join("\n")}

Reply with the time number.`;

      } else {
        reply = "Invalid date number.\nPlease try again.";
      }
    }

    // STEP 3 - TIME
    else if (session.step === "time") {

      const index = parseInt(incomingMsg);

      if (!isNaN(index) && index >= 1 && index <= AVAILABLE_SLOTS.length) {

        const selectedTime = AVAILABLE_SLOTS[index - 1];
        const booked = await getExistingBookings(session.city, session.date);

        if (booked.includes(selectedTime)) {
          reply = "⚠️ That time is already booked.\nPlease choose another time.";
        } else {
          session.time = selectedTime;
          session.step = "name";
          reply = "Please enter your full name:";
        }

      } else {
        reply = "Invalid time number.\nPlease try again.";
      }
    }

    // STEP 4 - NAME
    else if (session.step === "name") {
      session.name = incomingMsg;
      session.step = "email";
      reply = "Enter your email address:";
    }

    // STEP 5 - EMAIL
    else if (session.step === "email") {
      session.email = incomingMsg;
      session.step = "comment";
      reply = "Any comment? (Type 'no' if none)";
    }

    // STEP 6 - COMMENT & SAVE
    else if (session.step === "comment") {

      session.comment = incomingMsg.toLowerCase() === "no" ? "" : incomingMsg;

      await addBooking(session);
      await sendConfirmationEmail(session);

      reply =
`✅ Booking Confirmed!

City: ${session.city}
Date: ${session.date}
Time: ${session.time}

Confirmation email sent successfully.`;

      delete sessions[sender];
    }

    res.type("text/xml");
    res.send(`<Response><Message>${reply}</Message></Response>`);

  } catch (err) {
    console.error(err);
    res.send(`<Response><Message>Something went wrong. Try again.</Message></Response>`);
  }
});

// ---------------- SERVER ----------------

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});