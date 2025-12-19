# Deployment Guide

This guide covers deploying Unisynth to production.

## Overview

Unisynth consists of three components that can be deployed independently:
1. **Backend Server**: Node.js/Express API with WebSocket support
2. **3D Viewer**: Static web application
3. **Mobile App**: React Native mobile application

## Backend Deployment

### Option 1: Heroku

1. **Install Heroku CLI**
   ```bash
   brew install heroku/brew/heroku  # macOS
   ```

2. **Create Heroku App**
   ```bash
   cd backend
   heroku create unisynth-backend
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   ```

4. **Deploy**
   ```bash
   git subtree push --prefix backend heroku main
   ```

5. **Scale**
   ```bash
   heroku ps:scale web=1
   ```

### Option 2: AWS Elastic Beanstalk

1. **Install EB CLI**
   ```bash
   pip install awsebcli
   ```

2. **Initialize**
   ```bash
   cd backend
   eb init -p node.js unisynth-backend
   ```

3. **Create Environment**
   ```bash
   eb create unisynth-production
   ```

4. **Deploy**
   ```bash
   eb deploy
   ```

### Option 3: DigitalOcean App Platform

1. Connect your GitHub repository
2. Select the `backend` directory
3. Configure build command: `npm install`
4. Configure run command: `npm start`
5. Set environment variables
6. Deploy

### Option 4: Docker

1. **Create Dockerfile**
   ```dockerfile
   # backend/Dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --production
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t unisynth-backend ./backend
   docker run -p 3000:3000 unisynth-backend
   ```

### Environment Variables

Set these in production:
```bash
PORT=3000
NODE_ENV=production
UPLOAD_DIR=/var/data/uploads
MAX_UPLOAD_SIZE=100mb
```

## 3D Viewer Deployment

The viewer is a static web application and can be deployed to any static hosting service.

### Option 1: Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   cd viewer
   vercel --prod
   ```

3. **Update API URL**
   Edit `main.js` to point to your production backend

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build**
   ```bash
   cd viewer
   npm run build
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

### Option 3: AWS S3 + CloudFront

1. **Build**
   ```bash
   cd viewer
   npm run build
   ```

2. **Upload to S3**
   ```bash
   aws s3 sync dist/ s3://unisynth-viewer --delete
   ```

3. **Configure CloudFront** for CDN

### Option 4: GitHub Pages

1. **Build**
   ```bash
   cd viewer
   npm run build
   ```

2. **Deploy**
   ```bash
   npm install -g gh-pages
   gh-pages -d dist
   ```

## Mobile App Deployment

### iOS App Store

1. **Set up Apple Developer Account** ($99/year)

2. **Configure app.json**
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "com.yourcompany.unisynth",
         "buildNumber": "1.0.0"
       }
     }
   }
   ```

3. **Build**
   ```bash
   cd mobile
   eas build --platform ios
   ```

4. **Submit to App Store**
   ```bash
   eas submit --platform ios
   ```

### Google Play Store

1. **Set up Google Play Console** ($25 one-time)

2. **Configure app.json**
   ```json
   {
     "expo": {
       "android": {
         "package": "com.yourcompany.unisynth",
         "versionCode": 1
       }
     }
   }
   ```

3. **Build**
   ```bash
   cd mobile
   eas build --platform android
   ```

4. **Submit to Play Store**
   ```bash
   eas submit --platform android
   ```

### Over-the-Air (OTA) Updates

Expo supports OTA updates for JavaScript changes:

```bash
cd mobile
eas update --branch production --message "Bug fixes"
```

## Production Checklist

### Backend
- [ ] Set environment variables
- [ ] Configure CORS for production domains
- [ ] Set up HTTPS/SSL
- [ ] Configure WebSocket with WSS
- [ ] Set up logging and monitoring
- [ ] Configure file upload limits
- [ ] Set up database (if needed)
- [ ] Configure backup strategy
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting
- [ ] Set up health checks

### Viewer
- [ ] Update API URLs to production
- [ ] Enable production builds
- [ ] Configure CDN
- [ ] Set up analytics
- [ ] Test on multiple browsers
- [ ] Optimize assets
- [ ] Configure caching headers

### Mobile App
- [ ] Update API URLs to production
- [ ] Configure push notifications (optional)
- [ ] Set up analytics
- [ ] Test on multiple devices
- [ ] Configure app icons and splash screens
- [ ] Set up crash reporting
- [ ] Configure deep linking (optional)
- [ ] Add privacy policy and terms of service

## Security Considerations

1. **Use HTTPS everywhere**
   ```javascript
   // Enforce HTTPS
   if (process.env.NODE_ENV === 'production') {
     app.use((req, res, next) => {
       if (req.header('x-forwarded-proto') !== 'https') {
         res.redirect(`https://${req.header('host')}${req.url}`);
       } else {
         next();
       }
     });
   }
   ```

2. **Implement authentication**
   - Add JWT tokens
   - Secure WebSocket connections
   - Validate all inputs

3. **Rate limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

4. **Secure file uploads**
   - Validate file types
   - Scan for malware
   - Limit file sizes
   - Use secure storage

5. **Environment variables**
   - Never commit secrets
   - Use secret management services
   - Rotate keys regularly

## Monitoring and Logging

### Backend Monitoring
```javascript
// Add logging
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Services to Consider
- **Error Tracking**: Sentry, Rollbar
- **Performance**: New Relic, Datadog
- **Uptime**: UptimeRobot, Pingdom
- **Analytics**: Google Analytics, Mixpanel

## Scaling

### Backend Scaling
- Use load balancer (NGINX, AWS ELB)
- Implement caching (Redis)
- Add database for persistence
- Use queue system for uploads (Bull, RabbitMQ)
- Implement CDN for static files

### Database Options
- PostgreSQL for relational data
- MongoDB for document storage
- S3 for file storage
- Redis for caching and sessions

## Cost Estimates

### Small Scale (< 100 users)
- Backend: $5-10/month (Heroku, DigitalOcean)
- Viewer: Free (Netlify, Vercel)
- Mobile: $124 (one-time app store fees)
- Total: ~$200 first year, ~$60-120/year after

### Medium Scale (100-1000 users)
- Backend: $20-50/month
- Storage: $10-30/month
- CDN: $5-20/month
- Total: ~$420-1200/year

### Large Scale (1000+ users)
- Backend: $100-500/month
- Storage: $50-200/month
- CDN: $50-200/month
- Total: ~$2400-10800/year

## Support

For deployment issues:
- Check service-specific documentation
- Review error logs
- Test locally first
- Use staging environment
- Monitor after deployment
