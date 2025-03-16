FROM node:20-alpine

WORKDIR /app

# Copy the rest of the application (node_modules excluded via .dockerignore)
COPY . .

# Run yarn again to ensure all dependencies are installed
RUN yarn

# Add build script
RUN yarn build

# Expose the port the app runs on (Vite uses 5173 by default)
EXPOSE 5173

# Command to serve the built application
CMD ["yarn", "preview", "--host", "--port", "5173"]