# 5WH Media - Modern News Website with Admin Panel

A comprehensive, responsive news website built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring a complete admin panel for content management.

## 🚀 Features

### Frontend Features
- **Modern Responsive Design**: Fully responsive design that works on desktop, tablet, and mobile
- **Multiple Content Types**: Support for news articles, audio podcasts, and videos
- **Clean Navigation**: Easy-to-use navigation with mobile-friendly drawer
- **SEO Optimized**: Built-in SEO features with meta tags and social media optimization
- **Fast Loading**: Optimized performance with lazy loading and caching
- **Progressive Web App Ready**: Can be converted to mobile app for App Store/Play Store

### Backend Features
- **RESTful API**: Complete REST API for all content management
- **File Upload System**: Support for images, videos, and audio files
- **User Authentication**: JWT-based authentication with role-based access control
- **Content Management**: Full CRUD operations for all content types
- **Search & Filtering**: Advanced search and filtering capabilities
- **Database Optimization**: Indexed database queries for better performance

### Admin Panel Features
- **Dashboard**: Overview of all content and user statistics
- **Content Management**: Create, edit, and publish news, podcasts, and videos
- **User Management**: Manage user roles and permissions
- **File Management**: Upload and manage media files
- **Analytics**: Basic analytics and content performance metrics

## 🏗️ Project Structure

```
5wh/
├── server.js              # Main server file
├── package.json           # Backend dependencies
├── .env                   # Environment variables
├── models/                # Database models
│   ├── User.js
│   ├── News.js
│   ├── Podcast.js
│   └── Video.js
├── routes/                # API routes
│   ├── auth.js
│   ├── news.js
│   ├── podcasts.js
│   ├── videos.js
│   └── admin.js
├── controllers/           # Route controllers
│   ├── authController.js
│   ├── newsController.js
│   ├── podcastController.js
│   └── videoController.js
├── middleware/            # Custom middleware
│   ├── auth.js
│   └── upload.js
├── uploads/               # File uploads directory
└── client/                # React frontend
    ├── public/
    ├── src/
    │   ├── components/    # Reusable components
    │   ├── pages/         # Page components
    │   ├── contexts/      # React contexts
    │   ├── services/      # API services
    │   ├── theme/         # Material-UI theme
    │   └── App.js         # Main App component
    └── package.json       # Frontend dependencies
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **Express Rate Limit** - Rate limiting

### Frontend
- **React 19** - UI library
- **Material-UI (MUI)** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Framer Motion** - Animations
- **React Helmet** - SEO meta tags
- **React Player** - Media player
- **React Toastify** - Notifications

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd 5wh
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install --legacy-peer-deps
cd ..
```

### 4. Set Up Environment Variables
Create a `.env` file in the root directory:
```bash
# Environment Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/5wh-news

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Settings
MAX_FILE_SIZE=500MB

# CORS Settings
CLIENT_URL=http://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000
```

### 5. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows (if MongoDB is installed as a service)
net start MongoDB

# On macOS (with Homebrew)
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

### 6. Start the Development Servers

**Backend Server:**
```bash
npm run dev
```

**Frontend Server (in a new terminal):**
```bash
npm run client
```

The application will be available at:
- Frontend: http://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000
- Backend API: http://ec2-16-52-123-203.ca-central-1.compute.amazonaws.com:5000

## 📱 Mobile App Conversion

This web application is designed to be easily converted into a mobile app:

### For React Native
1. Use React Native WebView to wrap the web app
2. Configure proper navigation and mobile-specific features
3. Build and deploy to App Store/Play Store

### For Cordova/PhoneGap
1. Use Cordova to create a hybrid mobile app
2. Configure plugins for device features
3. Build for iOS and Android

### For Capacitor
1. Use Ionic Capacitor for native mobile app development
2. Access native device features
3. Deploy to app stores

## 🔧 Available Scripts

### Backend Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run server     # Start server only
```

### Frontend Scripts
```bash
npm run client     # Start React development server
npm run build      # Build React app for production
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### News
- `GET /api/news` - Get all published news
- `GET /api/news/:slug` - Get single news article
- `GET /api/news/admin` - Get all news (admin)
- `POST /api/news` - Create news article
- `PUT /api/news/:id` - Update news article
- `DELETE /api/news/:id` - Delete news article

### Podcasts
- `GET /api/podcasts` - Get all published podcasts
- `GET /api/podcasts/:slug` - Get single podcast
- `GET /api/podcasts/admin` - Get all podcasts (admin)
- `POST /api/podcasts` - Create podcast
- `PUT /api/podcasts/:id` - Update podcast
- `DELETE /api/podcasts/:id` - Delete podcast

### Videos
- `GET /api/videos` - Get all published videos
- `GET /api/videos/:slug` - Get single video
- `GET /api/videos/admin` - Get all videos (admin)
- `POST /api/videos` - Create video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### Admin
- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `PUT /api/admin/users/:id/status` - Update user status
- `DELETE /api/admin/users/:id` - Delete user

## 👥 User Roles

### Admin
- Full access to all features
- User management
- Content management
- System settings

### Editor
- Content creation and editing
- Limited user management
- Publishing permissions

### Author
- Content creation
- Edit own content
- Limited permissions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Cross-origin request protection
- **Helmet Security**: Security headers
- **Input Validation**: Server-side validation
- **File Upload Security**: File type and size validation

## 📊 Performance Optimizations

- **Database Indexing**: Optimized database queries
- **Image Optimization**: Compressed image uploads
- **Caching**: React Query for client-side caching
- **Lazy Loading**: Dynamic component loading
- **Code Splitting**: Optimized bundle sizes
- **Compression**: Gzip compression for responses

## 🚀 Deployment

### Production Environment Variables
Update your `.env` file for production:
```bash
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=your-production-domain
```

### Build for Production
```bash
# Build the React app
npm run build

# Start the production server
npm start
```

### Deploy to Platforms
- **Heroku**: Use the included `heroku-postbuild` script
- **DigitalOcean**: Deploy using App Platform or Droplets
- **AWS**: Use EC2, Elastic Beanstalk, or containerization
- **Vercel/Netlify**: For frontend-only deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: info@5whmedia.com
- Documentation: Check this README
- Issues: GitHub Issues page

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Social media integration
- [ ] Email newsletter system
- [ ] Advanced search with Elasticsearch
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Comments system
- [ ] Live streaming integration
- [ ] Mobile app development

---

**Built with ❤️ for 5WH Media** - Delivering quality news and multimedia content with modern technology.

---

## 🛠 Modernization & Best Practices (Recent Enhancements)

Implemented improvements:

1. Centralized configuration in `config/config.js` (single source of truth for env vars) + added `.env.example` for onboarding.
2. Added lightweight request ID & structured logging (`reqId`) for easier tracing in logs.
3. Health endpoint `/healthz` for uptime checks & container orchestration probes.
4. Optional rate limiting toggle via `ENABLE_RATE_LIMIT` environment variable.
5. Unified scheduling validation with `useScheduleValidation` hook (DRY across forms).
6. Toast notifications for publish/reschedule/podcast creation actions (immediate UX feedback).
7. Enhanced error handler returns `requestId` and safe detail (only in development).
8. Introduced `.editorconfig` to standardize formatting across contributors.
9. Server now sets `trust proxy` to support deployments behind reverse proxies (e.g., Nginx, Heroku).
10. Improved script separation: `start` (prod), `watch` (dev with nodemon).

### Recommended Next Steps

- Add Edit forms for Podcast & Opinion with scheduling & centralized form components.
- Abstract repetitive CRUD logic into React Query mutations + optimistic UI updates.
- Implement role-based UI guard wrapper & server-side RBAC helper utilities.
- Add Playwright E2E smoke tests for critical admin workflows (login -> create -> schedule -> publish).
- Introduce Redis caching for hot news & upcoming scheduled items for performance.
- Migrate in-process scheduling to a queue (BullMQ) if scale increases / multi-instance deployment.
- Add structured audit log viewer filters (action type, entity id, user) & diff highlighting.
- Image optimization pipeline generating WebP/AVIF and setting cache headers.

Refer to inline code comments for rationale & further micro-optimizations.
