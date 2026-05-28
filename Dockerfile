FROM php:8.2-apache

# Install FreeTDS and compile PDO DBLib extension for SQL Server connection
RUN apt-get update && apt-get install -y \
    freetds-dev \
    libsybdb5 \
    && ln -s /usr/lib/x86_64-linux-gnu/libsybdb.a /usr/lib/ \
    && docker-php-ext-install pdo_dblib

# Enable Apache rewrite module
RUN a2enmod rewrite

# Copy current directory files to Apache public root
COPY . /var/www/html/

# Expose port 80
EXPOSE 80
