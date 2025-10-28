FROM node:22.15-alpine as builder

# Set working directory
WORKDIR /app
# Copy package files
COPY package.json package-lock.json ./
# Install dependencies
RUN npm ci
# Copy the rest of the application code
COPY . .
# Build the application
RUN npm run build

FROM nginx:alpine
# Copy built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

#copy custom nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80
# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]