FROM node:20-alpine

WORKDIR /backend

# Install PostgreSQL client tools for pg_isready and psql
RUN apk add --no-cache postgresql-client

# Copy the rest of the application (node_modules excluded via .dockerignore)
COPY . .

# Install dependencies
RUN yarn

# Make the docker-entrypoint.sh script executable to ensure it can be run as a command
RUN chmod +x /backend/docker-entrypoint.sh

# Build the application
RUN yarn build

# Create register-aliases.js in dist directory
RUN mkdir -p dist && echo '// Register module aliases for production mode\nconst moduleAlias = require("module-alias");\n\n// Register aliases\nmoduleAlias.addAliases({\n  "~": __dirname,\n});' > dist/register-aliases.js

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["/backend/docker-entrypoint.sh"] 