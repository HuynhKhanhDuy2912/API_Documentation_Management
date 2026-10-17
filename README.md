# Web App Quản lý tài liệu API

Ứng dụng MERN để quản lý tài liệu api theo project. Người dùng có thể tổ chức project, khai báo API và tra cứu endpoint cùng request/response mẫu.

## Tính năng

- Đăng ký, đăng nhập bằng JWT.
- CRUD project với tên, mô tả và Base URL; tìm kiếm theo tên/mô tả.
- CRUD API document trong project; tìm kiếm theo tên, URL, mô tả và lọc theo HTTP method.
- Khai báo method GET, POST, PUT, PATCH, DELETE; Headers; Path/Query parameters; Request Body; Response fields.
- Preview URL và JSON mẫu từ dữ liệu đã nhập.
- Xóa project sẽ xóa các API document thuộc project đó.

## Công nghệ

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | React, Vite, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Validation | express-validator, Mongoose schema validation |

## Yêu cầu

- Node.js 20.19+ hoặc 22.12+ và npm.
- MongoDB local hoặc MongoDB URI có thể truy cập.
- Git để clone repository.

## Cài đặt và chạy local

1. Clone repository:

       git clone https://github.com/HuynhKhanhDuy2912/API_Documentation_Management.git
       cd API_Documentation_Management

2. Đảm bảo MongoDB đang chạy. Repository không có migration hoặc seed script; backend kết nối database khi khởi động.

3. Chạy backend trong terminal thứ nhất:

       cd backend
       npm install
       copy .env.example .env

   Mở file `backend/.env` và cấu hình các biến:

   | Biến | Giá trị mẫu | Mô tả |
   | --- | --- | --- |
   | PORT | 5000 | Cổng backend |
   | MONGODB_URI | mongodb://localhost:27017/api_doc_management | MongoDB connection string |
   | JWT_SECRET | Thay bằng secret ngẫu nhiên | Secret ký JWT |
   | JWT_EXPIRES_IN | 7d | Thời hạn token |

   Frontend dev server proxy `/api` tới `http://localhost:5000`. Nếu đổi cổng backend, cập nhật `frontend/vite.config.js`.

   Sau khi lưu cấu hình, khởi động backend:

       npm run dev

   Backend chạy tại `http://localhost:5000`. `npm start` dùng để chạy backend không qua Nodemon.

4. Chạy frontend trong terminal thứ hai:

       cd frontend
       npm install
       npm run dev

   Mở `http://localhost:3000`. Tạo tài khoản tại `/register`; không có account mặc định.

## Cấu trúc


    backend/
      config/          Kết nối MongoDB
      controllers/     HTTP handlers
      middlewares/     Authentication, validation, error handling
      models/          User, Project, ApiDocument
      routes/          Auth, project, API document routes
      services/        Nghiệp vụ và truy vấn dữ liệu
      server.js        Khởi tạo Express và đăng ký routes

    frontend/src/
      components/      UI components dùng chung
      contexts/        Trạng thái authentication
      pages/           Login, Register, ProjectList, ProjectDetail, ApiDocForm, ApiDocDetail
      services/api.js  Axios client và API calls
      utils/           Chuẩn hóa parameters và tạo sample URL
      App.jsx           Router và layout

## API routes

Các route dưới đây dùng prefix /api. Route project và API document cần JWT Bearer token.

| Method | Path | Mục đích |
| --- | --- | --- |
| POST | /api/auth/register | Đăng ký |
| POST | /api/auth/login | Đăng nhập |
| GET | /api/auth/me | Lấy user hiện tại |
| GET, POST | /api/projects | Liệt kê/tạo project |
| GET, PUT, DELETE | /api/projects/:id | Đọc/sửa/xóa project |
| GET, POST | /api/projects/:projectId/apis | Liệt kê/tạo API document |
| GET, PUT, DELETE | /api/projects/:projectId/apis/:id | Đọc/sửa/xóa API document |

## Hướng dẫn sử dụng

### 1. Đăng ký và đăng nhập

- Truy cập ứng dụng tại `http://localhost:3000`.
- Chọn chức năng đăng ký tại `/register` và nhập thông tin tài khoản.
- Đăng nhập bằng tài khoản vừa tạo để truy cập các chức năng quản lý.

### 2. Quản lý Project

- Tạo project mới bằng cách nhập tên, mô tả và Base URL.
- Xem danh sách các project đã tạo.
- Tìm kiếm project theo tên hoặc mô tả.
- Chỉnh sửa thông tin hoặc xóa project khi cần thiết.

**Lưu ý:** Xóa project sẽ xóa các API document thuộc project đó.

### 3. Quản lý API Document

- Chọn một project để xem danh sách API document.
- Tạo API document mới bằng cách nhập tên API, URL, HTTP method và mô tả.
- Khai báo Request gồm Headers, Path/Query Parameters và Request Body nếu cần.
- Khai báo Response fields và các giá trị mẫu.
- Sử dụng tab Xem trước (Preview) ngay trong giao diện thêm hoặc cập nhật API để kiểm tra cấu trúc tài liệu, URL và dữ liệu JSON mẫu trước khi lưu.
- Lưu API document để quản lý và tra cứu sau này.
- Sử dụng chức năng tìm kiếm hoặc lọc theo HTTP method để tìm API.
- Chỉnh sửa hoặc xóa API document khi cần thiết.

### 4. Xem thông tin

- Mở API document để xem thông tin chi tiết.
- Kiểm tra URL mẫu được tạo từ endpoint và các parameters đã khai báo.
- Xem cấu trúc JSON mẫu của Request Body và Response theo dữ liệu đã nhập.
