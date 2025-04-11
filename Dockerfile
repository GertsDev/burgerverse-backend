# Use Node.js 18 Alpine as the base image (lightweight Linux distribution)
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 for the Express application
EXPOSE 3000

# Start the application using pnpm
CMD ["pnpm", "start"]
