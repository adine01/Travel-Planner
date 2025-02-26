# Use an official Node runtime as the parent image
FROM node:20-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm ci

# Copy the rest of the application code to the working directory
COPY . .

# Build the Next.js application
RUN npm run build

# Expose port 3000 for the application
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]

