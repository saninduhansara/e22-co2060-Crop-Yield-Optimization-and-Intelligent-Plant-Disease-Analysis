# Frontend-Backend Connection Setup Guide

Your frontend and backend are now connected! Here's what was configured:

## What Was Done

### 1. Backend Configuration ✅
- **CORS enabled**: Added CORS middleware to allow requests from the frontend
- **Environment variables**: Created `.env.example` file for reference
- **API endpoints** available at:
  - `POST /api/users` - User registration
  - `POST /api/users/login` - User login
  - `POST /api/farms` - Create farm
  - `POST /api/farms/addharvestandpoints` - Add harvest data
  - Routes for average yields

### 2. Frontend Configuration ✅
- **API Service**: Created `frontend/src/services/api.ts` with:
  - Centralized API calls using Axios
  - JWT token authentication interceptors
  - User, Farm, and AvgYield API endpoints
  - Automatic error handling
- **Vite Proxy**: Configured to forward `/api` requests to backend
- **Environment variables**: Created `.env` and `.env.example` files
- **Login Integration**: Updated LoginPage to authenticate via backend API

## How to Run

### Backend Setup
```bash
cd backend

# Install dependencies (if not already done)
npm install

# Make sure .env file exists with these variables:
# MONGO_URI=mongodb://localhost:27017/cropYieldDB
# JWT_SECRET=your-secret-key
# FRONTEND_URL=http://localhost:3000
# PORT=5000

# Start the backend server
npm start
```

The backend will run on **http://localhost:5000**

### Frontend Setup
```bash
cd frontend

# Install dependencies (if not already done)
npm install

# The .env file should contain:
# VITE_API_URL=http://localhost:5000

# Start the frontend dev server
npm run dev
```

The frontend will run on **http://localhost:3000**

## Testing the Connection

1. **Start both servers** (backend and frontend)

2. **Test Login**:
   - Navigate to the login page
   - Enter credentials
   - The frontend will make an API call to `POST /api/users/login`
   - On success, JWT token is stored in localStorage
   - User is redirected based on their role (farmer/admin)

3. **Check Network Tab**:
   - Open browser DevTools → Network tab
   - Attempt login
   - You should see API calls to the backend

## API Usage in Components

Import and use the API service in your components:

```typescript
import { userAPI, farmAPI, avgYieldAPI } from '../services/api';

// Login example
const handleLogin = async () => {
  try {
    const response = await userAPI.login({ email, password });
    // Handle success
  } catch (error) {
    // Handle error
  }
};

// Create farm example
const createNewFarm = async () => {
  try {
    const farm = await farmAPI.createFarm({
      name: 'My Farm',
      location: 'District Name',
      size: 5.5,
      crops: ['rice', 'corn']
    });
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## Important Notes

1. **Authentication**: 
   - JWT token is automatically added to requests via interceptor
   - Token stored in localStorage under 'agriconnect_auth'
   - Expired tokens trigger automatic logout

2. **CORS**:
   - Backend accepts requests from http://localhost:3000
   - Update FRONTEND_URL in backend .env for production

3. **Proxy**:
   - Vite proxy forwards `/api/*` requests to backend
   - No need to specify full URL in development

4. **MongoDB**:
   - Ensure MongoDB is running locally on port 27017
   - Or update MONGO_URI in backend .env with your connection string

## Troubleshooting

### CORS Errors
- Check backend .env has correct FRONTEND_URL
- Verify cors middleware is configured in backend/index.js

### Connection Refused
- Ensure backend is running on port 5000
- Check backend logs for startup errors
- Verify MongoDB is running

### 403 Unauthorized
- Token may be invalid or expired
- Clear localStorage and login again
- Check JWT_SECRET in backend .env

### API Not Found
- Verify backend routes are registered
- Check API endpoint URLs match in frontend service

## Next Steps

To fully integrate your app:

1. Update other components to use the API service
2. Add more API endpoints as needed
3. Implement proper error handling UI
4. Add loading states for better UX
5. Configure production environment variables
6. Deploy frontend and backend separately

## File Structure

```
code/
├── backend/
│   ├── index.js (CORS configured)
│   ├── .env (environment variables)
│   ├── .env.example
│   └── routers/ (API routes)
│
├── frontend/
│   ├── .env (API URL config)
│   ├── .env.example
│   ├── vite.config.ts (Proxy configured)
│   └── src/
│       ├── services/
│       │   └── api.ts (API service layer)
│       └── components/
│           └── LoginPage.tsx (Updated with API integration)
```

Your frontend and backend are now fully connected and ready to use! 🎉
