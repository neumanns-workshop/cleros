#!/bin/bash
# Build script to ensure functions and models are copied correctly

# Build the application
npm run build

# Create the functions directory if it doesn't exist
mkdir -p dist/.netlify/functions/

# Copy the Netlify functions
cp -r ../netlify/functions/* dist/.netlify/functions/

# Create models directory
mkdir -p dist/models/

# Add a placeholder file to ensure the directory exists
echo "This directory is used for model caching." > dist/models/.placeholder

echo "Build completed with functions copied to dist/.netlify/functions/"
ls -la dist/.netlify/functions/
