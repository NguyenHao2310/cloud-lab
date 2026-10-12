# ---- Stage 1: Build React app ----
# Câu 51: Base Image cho quá trình build
FROM node:22-alpine AS build

# Câu 52: Thư mục làm việc
WORKDIR /app

# Câu 53: Copy package.json trước để cache
COPY package.json package-lock.json* ./

# Câu 54: Cài đặt package
RUN npm ci

# Câu 55: Copy source code React
COPY . .

# Câu 56: Build production
RUN npm run build

# ---- Stage 2: Serve bằng Nginx ----
FROM nginx:alpine

# Copy kết quả build (thư mục dist) sang thư mục phục vụ mặc định của Nginx
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx-cloud-lab.template
COPY docker-entrypoint.d/40-runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
