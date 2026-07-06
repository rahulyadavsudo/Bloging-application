# Blogging App

A three-tier blogging application with:
- React frontend
- Express backend
- MongoDB-backed persistence with a file fallback

## Run locally

### Backend
```bash
cd blogging-app/backend
npm install
npm run dev
```

Set a MongoDB connection string if you have a server running:
```bash
export MONGO_URI="mongodb://127.0.0.1:27017/blogging-app"
```

### Frontend
```bash
cd blogging-app/frontend
npm install
npm run dev
```
