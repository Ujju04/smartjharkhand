# Admin Dashboard API Contracts

## Overview
This document outlines the backend implementation requirements to replace mock data with real database functionality for the Admin Dashboard system.

## Database Models

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  id: String, // USER001, USER002, etc.
  name: String,
  email: String,
  phone: String,
  totalComplaints: Number,
  resolvedComplaints: Number,
  joinedDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Complaints Collection
```javascript
{
  _id: ObjectId,
  id: String, // CMP001, CMP002, etc.
  title: String,
  description: String,
  category: String,
  department: String,
  priority: String, // Critical, High, Medium, Low
  status: String, // Pending, In Progress, Completed
  userId: String, // Reference to user
  userEmail: String,
  userPhone: String,
  assignedTo: String, // Worker ID
  assignedWorker: String, // Worker Name
  proofImages: [String], // Array of file names
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. AdminUsers Collection
```javascript
{
  _id: ObjectId,
  id: String, // worker1, worker2, etc.
  username: String,
  password: String, // Hashed
  name: String,
  email: String,
  role: String, // Main Admin, Lower Admin
  department: String, // For Lower Admin only
  assignedComplaints: Number,
  completedComplaints: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Authentication APIs
- `POST /api/auth/login` - Admin login with username/password
- `POST /api/auth/logout` - Logout and invalidate token
- `GET /api/auth/me` - Get current admin user info

### Complaint Management APIs
- `GET /api/complaints` - Get all complaints (Main Admin) or assigned complaints (Lower Admin)
- `GET /api/complaints/:id` - Get single complaint details
- `POST /api/complaints` - Create new complaint (for testing)
- `PUT /api/complaints/:id/assign` - Assign complaint to worker
- `PUT /api/complaints/:id/transfer` - Transfer complaint to different department
- `PUT /api/complaints/:id/status` - Update complaint status with proof upload
- `GET /api/complaints/analytics` - Get complaint statistics

### User Management APIs
- `GET /api/users` - Get all users with search functionality
- `GET /api/users/:id` - Get single user details
- `GET /api/users/search` - Search users by ID, email, phone, name

### Admin Management APIs
- `GET /api/admin/workers` - Get all department workers
- `POST /api/admin/workers` - Add new worker
- `PUT /api/admin/workers/:id` - Update worker details
- `DELETE /api/admin/workers/:id` - Deactivate worker

### File Upload APIs
- `POST /api/upload/proof` - Upload proof images/videos for complaints

## Mock Data Replacement Strategy

### Current Mock Data (mockData.js)
1. **mockComplaints** → Replace with Complaints API calls
2. **mockUsers** → Replace with Users API calls  
3. **mockWorkers** → Replace with Admin Workers API calls
4. **mockAuth** → Replace with Authentication API calls
5. **mockAnalytics** → Replace with Analytics API calls

### Frontend Integration Changes

#### Authentication (Login.jsx)
- Replace mock login logic with `/api/auth/login` API call
- Store JWT token in localStorage
- Add token to all subsequent API requests

#### Main Admin Dashboard (MainAdminDashboard.jsx)
- Replace `mockComplaints` with API call to `/api/complaints`
- Replace `mockUsers` with API call to `/api/users`
- Replace `mockWorkers` with API call to `/api/admin/workers`
- Replace complaint assignment logic with `/api/complaints/:id/assign`
- Replace complaint transfer logic with `/api/complaints/:id/transfer`
- Replace analytics with `/api/complaints/analytics`

#### Lower Admin Dashboard (LowerAdminDashboard.jsx)
- Replace assigned complaints logic with `/api/complaints` (filtered by assignedTo)
- Replace status update logic with `/api/complaints/:id/status` and file upload
- Add file upload functionality to `/api/upload/proof`

## Backend Implementation Requirements

### 1. Authentication & Authorization
- JWT token-based authentication
- Password hashing using bcrypt
- Role-based access control middleware
- Token validation for protected routes

### 2. Database Operations
- CRUD operations for all collections
- Search and filtering functionality
- Pagination for large datasets
- Data validation using Pydantic models

### 3. File Upload System
- Handle multipart file uploads
- Store files in `/app/backend/uploads/` directory
- Validate file types (images/videos only)
- File size limits (10MB per file)

### 4. API Response Format
```javascript
{
  success: boolean,
  data: any,
  message: string,
  error?: string
}
```

### 5. Error Handling
- Comprehensive error handling for all endpoints
- Proper HTTP status codes
- Validation error messages
- Database connection error handling

## Seed Data
Create initial seed data including:
- Main Admin user (admin/admin123)
- Sample department workers
- Sample complaints with various statuses
- Sample regular users

## Security Considerations
- Password hashing for all admin users
- JWT token expiration (24 hours)
- Input validation and sanitization
- File upload security (type and size validation)
- CORS configuration for frontend access

## Frontend API Integration
- Create API service layer for all backend calls
- Add loading states for all API operations
- Implement error handling with user-friendly messages
- Add token refresh mechanism if needed
- Replace all mock data imports with API calls