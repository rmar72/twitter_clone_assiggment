# Use Node.js LTS image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for better build caching)
COPY package*.json ./

# Install dependencies within the container
RUN npm install

# Copy the application code
COPY . .

# Expose the app port
EXPOSE 8080

# Start the server
CMD ["node", "twitter_trending_service.js"]
