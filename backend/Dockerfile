# Backend Dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port (adjust if your backend uses a different port)
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
