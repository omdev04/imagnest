# Telephoto - Image CDN SaaS Platform

## Main Features

### 1. **User Authentication & Authorization**
- User registration & login with NextAuth
- Role-based access (User, Admin)
- JWT-based authentication
- Account suspension & ban system

### 2. **Image Upload & Management**
- Drag & drop image upload
- Support for multiple image formats
- File size limits based on plan tier
- Image count-based quota system
- Image deletion & management
- Bulk operations support

### 3. **CDN System**
- Fast image delivery via `/api/cdn/[id]` endpoint
- MongoDB GridFS storage
- Optimized image serving
- Public & private image links
- Token-based secure URLs for private images

### 4. **Pricing & Plans**
- **Free Plan**: 100 uploads/day, 100 images, 5MB max size
- **Pro Plan**: Unlimited uploads, 10,000 images, 20MB max size, private links
- **Enterprise Plan**: Custom limits, 100,000 images, 50MB max size, SLA

### 5. **Dashboard**
- Real-time analytics & stats
- Upload history & management
- Storage usage monitoring
- API key management
- Recent uploads view
- Interactive charts (bandwidth, views, uploads)

### 6. **API Keys**
- Generate & manage API keys
- Regenerate keys for security
- Copy to clipboard functionality
- Key-based authentication for API access

### 7. **Admin Panel**
- System health monitoring
- User management (suspend, ban, unban)
- Image moderation
- Abuse report management
- Admin activity logs
- Platform settings control

### 8. **Analytics**
- Image view tracking
- Bandwidth usage monitoring
- Upload statistics
- Error tracking
- Real-time dashboard metrics

### 9. **Reporting System**
- Report inappropriate content
- Public report page (`/report/[id]`)
- Admin review & moderation
- Automated image takedown on approval

### 10. **Settings & Profile**
- Profile management
- Email & password update
- Account preferences
- Plan upgrade options

### 11. **Public Pages**
- Landing page with features showcase
- Pricing page
- FAQ section
- About page
- Terms of Service
- Privacy Policy
- Image view page (`/view/[id]`)

### 12. **Security Features**
- Rate limiting
- CORS protection
- Secure token generation
- Admin action logging
- Abuse prevention system
- Banned page for suspended users

### 13. **Telegram Load Balancer** ⭐ NEW
- Dual bot configuration for high availability
- Round-robin load balancing algorithm
- Automatic health monitoring (30s intervals)
- Instant failover on bot failure
- Traffic-based intelligent switching
- Real-time performance metrics
- Admin monitoring endpoint
- Zero-downtime bot failures
- Backward compatible with single bot


## Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Framer Motion
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS, Glassmorphism effects
- **File Storage**: Telegram Bots (Dual Load Balanced)
- **Load Balancing**: Custom round-robin with health checks

## Key APIs
- `/api/upload` - Image upload (with load balancer)
- `/api/cdn/[id]` - Image delivery
- `/api/auth` - Authentication
- `/api/keys` - API key management
- `/api/admin/*` - Admin operations
- `/api/admin/telegram-bots` - Bot health monitoring
- `/api/report` - Abuse reporting
- `/api/analytics` - Usage statistics
- `/api/view/[id]` - Image view tracking

