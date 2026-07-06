# Blogging App Setup Guide

## 1. What you need

Before running this project, make sure you have:
- Node.js installed
- npm installed
- A MongoDB database available

You can use either:
- a local MongoDB server, or
- MongoDB Atlas (cloud database)

## 2. Backend environment variables

Create a `.env` file inside the backend folder:

```bash
cd blogging-app/backend
nano .env
```

Add the following:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/blogging-app
```

### If using MongoDB Atlas
Use a connection string like:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/blogging-app?retryWrites=true&w=majority
```

## 3. How the backend connects to the database

The backend uses the `MONGO_URI` value from the environment.

- If `MONGO_URI` is present, it tries to connect to MongoDB.
- If MongoDB is not available, it falls back to a local file-based store.

This is handled in the backend persistence layer.

## 4. How to run the app

### Start the backend
```bash
cd blogging-app/backend
npm install
npm run dev
```

### Start the frontend
```bash
cd blogging-app/frontend
npm install
npm run dev
```

Then open:
```text
http://127.0.0.1:5173/
```

## 5. How frontend and backend communicate

- The frontend runs on Vite at port `5173`
- The backend runs on Express at port `5000`
- The frontend calls the backend API using URLs like:
  - `/api/posts`
  - `/api/auth/login`
  - `/api/auth/register`

If needed, the frontend API base URL can be updated in the frontend service file.

## 6. Database connection tips

### Local MongoDB
Install and start MongoDB locally, then use:
```env
MONGO_URI=mongodb://127.0.0.1:27017/blogging-app
```

### MongoDB Atlas
1. Create a cluster in Atlas
2. Get the connection string
3. Replace `<username>` and `<password>` in the `.env` file
4. Make sure your IP is whitelisted

## 7. Common issue

If the app cannot connect to MongoDB, it will still run in fallback mode, but data may not persist properly in the database.

For full database functionality, make sure `MONGO_URI` is correct and the database server is reachable.
