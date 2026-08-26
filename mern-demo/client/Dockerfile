# ---- Stage 1: Build React app ----
# Câu 51: Base Image cho quá trình build
FROM node:20-alpine AS build

# Câu 52: Thư mục làm việc
WORKDIR /app

# Câu 53: Copy package.json trước để cache
COPY package.json package-lock.json* ./

# Câu 54: Cài đặt package
RUN npm install

# Câu 55: Copy source code React
COPY . .

# Câu 56: Build production
RUN npm run build

# ---- Stage 2: Serve bằng Nginx ----
FROM nginx:alpine

# Copy kết quả build (thư mục dist) sang thư mục phục vụ mặc định của Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
