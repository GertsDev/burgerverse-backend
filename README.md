# Burgerverse Backend

This backend powers the Burgerverse app. It provides RESTful APIs for user authentication, user management, and other business logic. This guide is for frontend developers to quickly understand, run, and integrate with the backend.

---

## 🏗️ Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB**
- **JWT** for authentication
- **TypeScript** 

---

## 📁 Directory Structure

```
/src
  index.ts
  db.ts
  /config
    auth.ts
  /initialData
    seed.ts
    seedIngredients.ts
    ingredientsData.ts
  /middleware
    authMiddleware.ts
  /models
    Counter.ts
    Order.ts
    Ingredient.ts
    User.ts
  /routes
    ingredients.ts
    orders.ts
    auth.ts
```

---

## 🚀 Running Locally

1. **Clone the repo:**

   ```bash
   git clone <repo-url>
   cd burgerverse-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn
   ```

3. **Set up environment variables:**

   - Copy `.env.example` to `.env` and fill in values (DB URI, JWT secret, etc.)

4. **Start the server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   The backend will run on `http://localhost:3001` (or as set in `.env`).

---

## 🔑 Authentication Flow

- **Register:** `POST /auth/register`
- **Login:** `POST /auth/login`
- **Logout:** `POST /auth/logout`
- **Get User:** `GET /auth/user` (requires `Authorization: Bearer <accessToken>`)
- **Update User:** `PATCH /auth/user` (requires auth)
- **Password Reset:**
  - Request: `POST /password-reset`
  - Reset: `POST /password-reset/reset`

**Tokens:**

- On login/register, backend returns:
  - `accessToken` (JWT, short-lived, sent in `Authorization` header)
  - `refreshToken` (long-lived, stored in localStorage)
- Use `accessToken` for authenticated requests.
- If `accessToken` expires, use `refreshToken` to get a new one (`/auth/token`).

**Cookies:**

- The frontend stores `accessToken` in cookies for requests.
- `refreshToken` is stored in localStorage.

---

## 🧑‍💻 API Overview

| Endpoint                | Method | Auth Required | Description               |
| ----------------------- | ------ | ------------- | ------------------------- |
| `/auth/register`        | POST   | No            | Register new user         |
| `/auth/login`           | POST   | No            | Login user                |
| `/auth/logout`          | POST   | Yes           | Logout user               |
| `/auth/user`            | GET    | Yes           | Get current user info     |
| `/auth/user`            | PATCH  | Yes           | Update user info          |
| `/password-reset`       | POST   | No            | Request password reset    |
| `/password-reset/reset` | POST   | No            | Reset password with token |
| `/auth/token`           | POST   | No            | Refresh access token      |

**Request/Response Example:**
See `api/auth-api.ts` in frontend for expected payloads.

---

## ⚙️ Environment Variables

- `PORT` - Port to run server (default: 3001)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT signing
- `JWT_EXPIRES_IN` - Access token expiry
- `REFRESH_TOKEN_SECRET` - Secret for refresh tokens

---

## 🛠️ Useful Scripts

- `npm run dev` - Start server in dev mode (with nodemon)
- `npm run start` - Start server in prod mode

---

## 🗂️ Where to Add/Find Logic

- **Add new endpoints:** `/src/routes/`
- **Business logic:** `/src/controllers/`
- **Data models:** `/src/models/`
- **Auth logic:** `/src/middlewares/auth.js`
- **Error handling:** `/src/middlewares/error.js`

---

## 🔗 Frontend Integration Notes

- CORS is enabled for `http://localhost:3000` (frontend dev server).
- All endpoints return JSON.
- Error responses: `{ success: false, message: "Error message" }`
- For any issues, check backend logs or contact backend team.

---

## 🤝 Contributing/Contact

- For questions, ping the backend team or open an issue.

---

**This README is designed to help frontend devs get up and running fast, and understand how to integrate with the backend.**
