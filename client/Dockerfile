FROM node:20-alpine

WORKDIR /app

# Install curl for healthcheck and build tools for native dependencies
RUN apk add --no-cache curl python3 make g++

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies with specific platform
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Expose the port the app runs on (Vite uses 5173 by default)
EXPOSE 5173

# Command to run the development server with host flag for Docker
CMD ["yarn", "dev", "--host"]

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:5173/ || exit 1 