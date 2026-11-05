# Groupwork

Staff check-in, attendance and payroll in one app.

- **Employees** check in and out from their phone. Their location is saved with each shift, and they can see their hours and pay.
- **Admins** see who's working right now, every shift, where people checked in, and what each person is owed. They add employees, set hourly rates and mark pay as paid.

This repo combines the old `clientLewis` (React client) and `updatelewis` (client + server) projects into one app.

## Quick start

You need Node.js 18 or newer.

```bash
npm run setup
npm run dev
```

Open http://localhost:3000.

With no database configured, the API starts a **demo database** in memory with sample employees and shifts. The login page shows demo accounts. Demo data resets each time the server restarts.

## Use your own MongoDB

Copy `server/.env.example` to `server/.env` and fill it in:

| Variable | What it is |
| --- | --- |
| `MONGO_URI` | MongoDB connection string (e.g. from MongoDB Atlas) |
| `JWT_SECRET` | Any long random string, used to sign logins |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | First admin account, created automatically if there is no admin yet |

Then run `npm run dev` again. The first admin is created on startup (or run `npm run seed`).

Accounts from the old version still work: their old password is accepted once and then stored securely.

## How it works

| Area | Details |
| --- | --- |
| Login | Email + password. Passwords are hashed with bcrypt. Logins use a token that lasts 7 days. |
| New employees | An admin adds them. The app creates a temporary password, shown to the admin once, which the employee changes on their Profile page. |
| Check in / out | One shift open at a time. Location comes from the phone's GPS when allowed, otherwise the IP address is saved. |
| Pay | Each finished shift creates a pay entry: hours × that person's hourly rate (KES). Admins mark entries as paid. |

## Project layout

```
client/   React app (Vite). Pages in src/pages, admin pages in src/pages/admin
server/   Express API. Routes in routes/index.js, logic in controller/, data models in model/
```

## Production

```bash
npm run build   # builds the React app into client/dist
npm start       # the API serves the built app on PORT (default 5000)
```
