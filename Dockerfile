# Use a slim Node.js base image
FROM node:18-alpine AS builder

# Set working directory for the build stage
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Install dependencies (assuming npm)
RUN npm install

# Switch to a smaller runtime image for the final container
FROM node:18-alpine

# Copy the entire backend directory (including node_modules)
COPY . .


# Expose the port your Node.js server listens on (replace 3000 with your actual port)
EXPOSE 3000

# Set the entrypoint to run your Node.js application (replace index.js if your entry script has a different name)
CMD [ "node", "index.js" ]

RUN chmod +x /index.js