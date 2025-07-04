# MuseFuze Studios Website

A modern, full-stack web application for MuseFuze Studios featuring user authentication, staff collaboration tools, and administrative dashboards.

## 🚀 Features

### Public Features
- **Modern Landing Page** - Responsive design with glassmorphism effects
- **About Section** - Company mission and values
- **Team Showcase** - Meet the MuseFuze team
- **Join Us** - Career opportunities and contact form
- **Shop** - Merchandise store (configurable)

### User Features
- **Authentication** - Secure login/signup with JWT tokens
- **User Dashboard** - Profile management and data privacy controls
- **Cookie Consent** - GDPR-compliant cookie management

### Staff Features
- **Game Builds** - Upload, download, and manage game builds
- **Bug Reports** - Track and manage development issues
- **Reviews** - Rate and review game builds
- **Message Board** - Team communication and collaboration
- **Playtest Sessions** - Schedule and manage testing sessions
- **Download History** - Track build downloads and usage

### Admin Features
- **User Management** - Manage user accounts and roles
- **Build Management** - Upload and manage game builds
- **Finance Tracking** - Budget management and expense tracking
- **System Monitoring** - Server health and system logs
- **Feature Toggles** - Control experimental features

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- **Axios** for API communication

### Backend
- **Node.js** with Express
- **MySQL** database with connection pooling
- **JWT** authentication with HTTP-only cookies
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **Helmet** for security headers
- **CORS** for cross-origin requests

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd musefuze-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:3000
   
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=musefuze_db
   
   # JWT Secret (generate a strong random string)
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Security
   BCRYPT_ROUNDS=12
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   npm run setup:db
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The application uses MySQL with the following main tables:

- **users** - User accounts and authentication
- **game_builds** - Game build files and metadata
- **bug_reports** - Development issue tracking
- **reviews** - Build reviews and ratings
- **message_posts** - Team communication
- **team_announcements** - Official announcements
- **playtest_sessions** - Testing session management
- **download_history** - Build download tracking
- **finance_transactions** - Financial tracking
- **finance_budgets** - Budget management

## 🔐 Authentication & Security

- **JWT Tokens** stored in HTTP-only cookies
- **bcrypt** password hashing with 12 salt rounds
- **Role-based access control** (user, dev_tester, developer, staff, admin, ceo)
- **Rate limiting** on API endpoints
- **Input validation** and sanitization
- **CORS** protection
- **Security headers** via Helmet
- **GDPR compliance** with cookie consent and data export

## 👥 User Roles

1. **User** - Basic access to public features
2. **Dev Tester** - Access to staff tools and testing features
3. **Developer** - Full development collaboration access
4. **Staff** - Administrative access to most features
5. **Admin** - Full system administration access
6. **CEO** - Highest level access to all features

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build:production
npm start
```

### Database Setup
```bash
npm run setup:db
```

## 📁 Project Structure

```
musefuze-website/
├── public/                 # Static assets
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── contexts/          # React contexts
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── server/                # Backend Node.js application
│   ├── config/            # Database configuration
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   └── scripts/           # Database setup scripts
└── uploads/               # File upload directory
```

## 🔧 Configuration

### Shop Toggle
The merchandise shop can be enabled/disabled in `src/config/settings.ts`:

```typescript
export const siteConfig = {
  shop: {
    enabled: false, // Set to true to enable the shop
  },
};
```

### Environment Variables
All configuration is handled through environment variables. See `.env.example` for all available options.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software owned by MuseFuze Studios.

## 🆘 Support

For support, contact the development team or create an issue in the repository.

---

**MuseFuze Studios** - Creating fearlessly, innovating boldly.