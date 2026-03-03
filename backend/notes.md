📦 Packages Installed
Package	Purpose
express	Web server & routing
pg	PostgreSQL client (connects Node.js ↔ Postgres)
bcryptjs	Hashing passwords securely
jsonwebtoken	JWT tokens for login sessions
dotenv	Load .env environment variables
cors	Allow frontend (localhost:5173) to call the API
multer	Handle file uploads (license documents)
express-validator	Validate incoming request data
helmet	Security headers
morgan	HTTP request logging
nodemon (dev)	Auto-restart server on file changes


📁 Your Backend Folder Structure
backend/
├── config/          ← DB connection & config
├── controllers/     ← Business logic (auth, users, etc.)
├── middleware/      ← JWT auth, error handling
├── models/          ← SQL query functions (no ORM)
├── routes/          ← API route definitions
├── scripts/         ← DB seed / migration scripts
├── utils/           ← Helper functions
└── package.json     