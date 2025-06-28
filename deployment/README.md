# MuseFuze Studios - Full-Stack Authentication System

A comprehensive, production-ready authentication system with secure dashboard features for MuseFuze Studios.

## 🚀 Features

### Frontend (React + Vite)
- **Modern UI**: Dark glassmorphism design with neon accents
- **Authentication Pages**: Login/Signup with validation
- **Protected Routes**: Dashboard access control
- **Cookie Consent**: GDPR-compliant cookie management
- **Responsive Design**: Mobile-first approach

### Backend (Express + Node.js)
- **Secure Authentication**: JWT tokens in HTTP-only cookies
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Rate Limiting**: Brute-force protection
- **Input Validation**: Server-side validation with express-validator
- **File Uploads**: Secure file handling with Multer

### Database (MySQL)
- **User Management**: Secure user accounts with role-based access
- **Staff Features**: Game builds, message board, tools
- **Data Integrity**: Foreign keys and proper indexing
- **Session Tracking**: Secure session management

### Security Features
- ✅ HTTPS ready with security headers
- ✅ CORS protection
- ✅ CSRF protection via SameSite cookies
- ✅ Input sanitization and validation
- ✅ Rate limiting and brute-force protection
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ Secure file uploads

## 🛠️ Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- React Router for navigation
- Axios for HTTP requests
- Tailwind CSS for styling
- Lucide React for icons

**Backend:**
- Node.js with Express
- MySQL with mysql2
- JWT for authentication
- Bcrypt for password hashing
- Multer for file uploads
- Helmet for security headers

## 📦 Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

3. **Set up MySQL database:**
```sql
CREATE DATABASE musefuze_db;
CREATE USER 'musefuze_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON musefuze_db.* TO 'musefuze_user'@'localhost';
FLUSH PRIVILEGES;
```

4. **Start the development servers:**
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:client  # Frontend on port 3000
npm run dev:server  # Backend on port 5000
```

## 🚀 Production Deployment

### Frontend Deployment (Netlify)

1. **Build for production:**
```bash
npm run build:production
```

2. **Deploy to Netlify:**
```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Deploy preview
npm run deploy:preview

# Deploy to production
npm run deploy:frontend
```

3. **Environment Variables on Netlify:**
Set these in your Netlify dashboard under Site Settings > Environment Variables:
```
VITE_API_URL=https://api.musefuzestudios.com
NODE_ENV=production
```

### Backend Deployment

The backend needs to be deployed separately to a service that supports Node.js:

**Recommended Services:**
- **Railway**: Easy Node.js deployment with MySQL
- **Heroku**: Classic PaaS with database add-ons
- **DigitalOcean App Platform**: Simple container deployment
- **AWS Elastic Beanstalk**: Scalable AWS deployment
- **Google Cloud Run**: Serverless container deployment

**Example Railway Deployment:**
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically deploy on git push

**Example Environment Variables for Production:**
```bash
NODE_ENV=production
PORT=5000
CLIENT_URL=https://musefuzestudios.com
FRONTEND_URL=https://musefuzestudios.com
CORS_ORIGIN=https://musefuzestudios.com

# Database (use your production database)
DB_HOST=your-production-db-host
DB_USER=your-production-db-user
DB_PASSWORD=your-production-db-password
DB_NAME=musefuze_db

# Security
JWT_SECRET=your-super-secure-production-jwt-secret
BCRYPT_ROUNDS=12
```

### Domain Configuration

1. **Frontend Domain**: `musefuzestudios.com` (Netlify)
2. **Backend Domain**: `api.musefuzestudios.com` (Your backend service)

**DNS Configuration:**
```
A     musefuzestudios.com     -> Netlify IP
CNAME www.musefuzestudios.com -> musefuzestudios.com
CNAME api.musefuzestudios.com -> your-backend-service.com
```

### SSL/HTTPS

- **Frontend**: Netlify provides automatic SSL
- **Backend**: Most services provide automatic SSL, or use Cloudflare

## 🔧 Troubleshooting Production Issues

### CORS Issues
If you're getting CORS errors in production:

1. **Check API URL**: Ensure `VITE_API_URL` points to your backend
2. **Verify CORS Origins**: Backend should allow your frontend domain
3. **Check Network Tab**: Look for actual request URLs in browser dev tools

### 404 API Errors
If API endpoints return 404:

1. **Backend Running**: Ensure your backend service is running
2. **Correct URL**: Verify the API base URL is correct
3. **Route Configuration**: Check that routes are properly set up
4. **Proxy Settings**: If using a proxy, ensure it's configured correctly

### Database Connection Issues
If database connections fail:

1. **Credentials**: Verify database credentials are correct
2. **Network Access**: Ensure database allows connections from your backend
3. **SSL Requirements**: Some cloud databases require SSL connections

## 🗄️ Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email address
- `password` - Bcrypt hashed password
- `firstName` - User's first name
- `lastName` - User's last name
- `isStaff` - Staff privileges flag
- `isActive` - Account status
- `cookiesAccepted` - Cookie consent
- `createdAt` / `updatedAt` - Timestamps

### Game Builds Table (Staff Only)
- `id` - Primary key
- `name` - Build name
- `version` - Version number
- `description` - Build description
- `fileUrl` - Local file path
- `externalUrl` - External download link
- `uploadedBy` - Foreign key to users
- `uploadDate` - Upload timestamp

### Message Posts Table (Staff Only)
- `id` - Primary key
- `title` - Post title
- `content` - Post content
- `authorId` - Foreign key to users
- `parentId` - For replies (self-referencing)
- `isEdited` - Edit flag
- `createdAt` / `updatedAt` - Timestamps

## 🔐 Authentication Flow

1. **Registration:**
   - User provides email, password, name
   - Must accept cookies to proceed
   - Password hashed with bcrypt (12 rounds)
   - JWT token issued in HTTP-only cookie

2. **Login:**
   - Email/password validation
   - Rate limiting (5 attempts per 15 minutes)
   - JWT token issued on success
   - Automatic redirect to dashboard

3. **Session Management:**
   - JWT tokens expire after 7 days
   - HTTP-only cookies prevent XSS
   - SameSite=strict prevents CSRF
   - Automatic logout on token expiry

## 👥 User Roles

### Regular Users
- Profile management
- Data download (privacy compliance)
- Basic dashboard access

### Staff Members
- All regular user features
- **Dev Test Uploader:**
  - Upload game builds (file or external link)
  - Version management
  - Build descriptions
- **Message Board:**
  - Staff-only communication
  - Post, reply, edit, delete
  - Real-time collaboration
- **Staff Tools Panel:**
  - Placeholder for future features
  - Extensible architecture

## 🍪 Privacy & Legal

### Cookie Policy
- Essential cookies only
- No tracking or advertising
- User consent required
- Clear opt-out options

### Privacy Policy
- Transparent data collection
- No third-party sharing
- User data download
- Account deletion rights

### Terms of Service
- Clear usage guidelines
- Account responsibilities
- Service limitations
- Termination policies

## 🔒 Security Measures

### Input Validation
```javascript
// Server-side validation example
body('email').isEmail().normalizeEmail(),
body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
```

### Rate Limiting
```javascript
// Authentication rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
});
```

### Password Security
```javascript
// Bcrypt with 12 salt rounds
const hashedPassword = await bcrypt.hash(password, 12);
```

### JWT Security
```javascript
// HTTP-only cookies with security flags
res.cookie('authToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
```

## 📁 Project Structure

```
├── src/                    # Frontend React app
│   ├── components/         # Reusable components
│   ├── contexts/          # React contexts (Auth, Cookies)
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── server/                # Backend Express app
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   └── uploads/           # File upload directory
├── public/                # Static assets
├── netlify.toml           # Netlify configuration
└── package.json           # Dependencies and scripts
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users/profile` - Get user profile
- `GET /api/users/data` - Get user data (privacy)

### Staff Features
- `GET /api/staff/builds` - Get game builds
- `POST /api/staff/builds` - Upload game build
- `DELETE /api/staff/builds/:id` - Delete game build
- `GET /api/staff/messages` - Get message posts
- `POST /api/staff/messages` - Create message post
- `PUT /api/staff/messages/:id` - Update message post
- `DELETE /api/staff/messages/:id` - Delete message post

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

© 2025 MuseFuze Studios. All rights reserved.

## 🆘 Support

For support, email hello@musefuze.com or create an issue in the repository.

## 🔍 Monitoring & Debugging

### Development
```bash
# Check CORS in development
npm run test:cors

# View detailed logs
npm run dev:server
```

### Production
```bash
# Test production CORS
npm run test:cors:prod

# Check API health
curl https://api.musefuzestudios.com/api/health
```

### Common Issues

1. **CORS Errors**: Check origin configuration in backend
2. **404 API Errors**: Verify backend is running and accessible
3. **Authentication Issues**: Check JWT secret and cookie settings
4. **Database Errors**: Verify connection string and credentials