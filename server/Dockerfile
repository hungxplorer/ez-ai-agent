FROM node:18-alpine

WORKDIR /app

# Install dependencies needed for health checks and wait script
RUN apk add --no-cache postgresql-client curl

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entrypoint script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Create register-aliases.js in dist directory
RUN mkdir -p dist && echo '// Register module aliases for production mode\nconst moduleAlias = require("module-alias");\n\n// Register aliases\nmoduleAlias.addAliases({\n  "~": __dirname,\n});' > dist/register-aliases.js

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables with defaults
ENV DB_MAX_RETRIES=5 \
    DB_RETRY_INTERVAL=2000

# Command to run the application
CMD ["/app/docker-entrypoint.sh"] 