# Câu 32: Base Image
FROM node:20-alpine

# Câu 33: Thư mục làm việc trong container
WORKDIR /app

# Câu 34: Copy package.json để cài dependencies
COPY package.json package-lock.json* ./

# Câu 35: Cài đặt package
RUN npm install

# Câu 36: Copy toàn bộ source code Backend
COPY . .

# Câu 37: Khai báo port Backend lắng nghe
EXPOSE 5000

# Câu 38: Lệnh khởi động khi container chạy
CMD ["npm", "start"]
