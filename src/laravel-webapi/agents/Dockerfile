FROM php:8.3-fpm-alpine AS base

# 必要なPHP拡張をインストール（適宜追加）
RUN apk add --no-cache \
    bash git curl libpng-dev libjpeg-turbo-dev libzip-dev oniguruma-dev icu-dev \
    zip unzip \
 && docker-php-ext-configure gd --with-jpeg \
 && docker-php-ext-install pdo_mysql gd intl zip

WORKDIR /var/www/html

FROM base AS build
COPY composer.json composer.lock ./
RUN php -d detect_unicode=0 -r "copy('https://getcomposer.org/installer','composer-setup.php');" \
 && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
 && rm composer-setup.php
COPY . .
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist \
 && php artisan config:clear || true

FROM base AS runtime
WORKDIR /var/www/html
COPY --from=build /var/www/html /var/www/html
# 権限調整（必要に応じて）
RUN addgroup -g 1000 laravel && adduser -G laravel -g laravel -s /bin/sh -D laravel \
 && chown -R laravel:laravel /var/www/html
USER laravel
CMD ["php-fpm"]
