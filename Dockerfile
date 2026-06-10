FROM nginx:1.27-alpine

# Upgrade packages, create nginx.pid, and change ownership of writable directories to nginx
RUN apk upgrade --no-cache && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy the custom nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy all static website files
COPY out .

# Change ownership of website files to nginx
RUN chown -R nginx:nginx /usr/share/nginx/html

# Switch to non-root user
USER nginx

# Expose port 8080
EXPOSE 8080
