# Cleros Deployment Guide

This document outlines the steps required to deploy the Cleros application to a production environment.

## Prerequisites

- Node.js (v16+)
- Python 3.9+
- Nginx (for production hosting)
- A server or cloud hosting service (AWS, DigitalOcean, Netlify, Vercel, etc.)

## Web Application Deployment

### Building the React Application

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the production version:
   ```bash
   npm run build
   ```

4. The build folder will contain static files ready for deployment.

### Option 1: Static Hosting (Recommended)

The Cleros web application is a static site that can be hosted on any static file hosting service:

1. Upload the contents of the `web/build` directory to your static hosting service (Netlify, Vercel, GitHub Pages, etc.)

2. Configure your hosting service to handle SPA routing by redirecting all requests to index.html

### Option 2: Server Deployment with Nginx

If you prefer to host on your own server:

1. Copy the build directory to your server:
   ```bash
   scp -r web/build user@your-server:/var/www/cleros
   ```

2. Set up Nginx configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com;

       root /var/www/cleros;
       index index.html;

       # Handle routing for SPA
       location / {
           try_files $uri $uri/ /index.html;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
           expires 30d;
           add_header Cache-Control "public, no-transform";
       }
   }
   ```

3. Test and reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

## Python Backend (Optional)

If you're using the Python scripts for data processing:

1. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Ensure your data files are properly organized in the data directory

## Automating Deployment (Optional)

### GitHub Actions

You can set up GitHub Actions to automatically deploy the application when changes are pushed to the main branch:

1. Create a `.github/workflows/deploy.yml` file:
   ```yaml
   name: Deploy

   on:
     push:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '16'
             
         - name: Install dependencies
           run: cd web && npm install
           
         - name: Build
           run: cd web && npm run build
           
         - name: Deploy to Netlify/Vercel/etc
           # Add appropriate deployment steps for your hosting provider
   ```

## Production Best Practices

1. **Monitoring**: Consider setting up application monitoring with services like Sentry or LogRocket

2. **Analytics**: Implement analytics tracking to understand user behavior

3. **Performance**: Regularly check website performance using tools like Lighthouse

4. **Security**: Ensure all dependencies are kept updated to avoid security vulnerabilities

5. **Backup**: Implement a regular backup solution for your data

## Troubleshooting

### Common Issues

- If routing doesn't work properly, ensure your server is configured to redirect all requests to index.html

- If the application appears unstyled, check that CSS files are being properly served

- For performance issues, analyze the build size and consider code splitting

### Getting Help

For specific deployment issues, please open an issue on the GitHub repository with detailed information about the problem and your deployment environment. 