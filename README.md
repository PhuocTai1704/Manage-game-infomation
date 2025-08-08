# Game Management System

Hệ thống quản lý game đa ngôn ngữ với giao diện web hiện đại, được xây dựng bằng Spring Boot (Backend) và React TypeScript (Frontend).

## 🚀 Tính năng chính

### Backend (Spring Boot)

- **Authentication & Authorization**: JWT-based authentication với OAuth2
- **Game Management**: CRUD operations cho game với hỗ trợ đa ngôn ngữ
- **Category Management**: Quản lý danh mục game
- **Advanced Search**: Full-text search với Hibernate Search (Lucene)
- **API Documentation**: Swagger/OpenAPI documentation
- **Database**: MySQL với JPA/Hibernate

### Frontend (React + TypeScript)

- **Modern UI**: Bootstrap 5 + React Bootstrap
- **Form Management**: React Hook Form với validation
- **Data Tables**: TanStack Table với sorting, filtering, pagination
- **Routing**: React Router DOM
- **HTTP Client**: Axios với interceptors
- **Build Tool**: Vite

## 🏗️ Kiến trúc hệ thống

```
Game-management/
├── Game-BE/          # Spring Boot Backend
│   ├── src/main/java/com/dangphuoctai/GameManage/
│   │   ├── controller/     # REST Controllers
│   │   ├── service/        # Business Logic
│   │   ├── entity/         # JPA Entities
│   │   ├── repository/     # Data Access Layer
│   │   ├── security/       # JWT & Security
│   │   └── config/         # Configuration
│   └── src/main/resources/
│       └── application.properties
└── Game-FE/          # React Frontend
    ├── src/
    │   ├── components/     # React Components
    │   ├── services/       # API Services
    │   ├── contexts/       # React Context
    │   └── assets/         # Static Assets
    └── package.json
```

## 📦 Dependencies

### Backend

- **Java 21**
- **Spring Boot 3.5.4**
- **Spring Security + JWT**
- **Spring Data JPA**
- **Hibernate Search (Lucene)**
- **MySQL Database**
- **Maven**

### Frontend

- **React 19.1.0**
- **TypeScript 5.8.3**
- **Vite 7.0.4**
- **React Bootstrap 2.10.10**
- **TanStack Table 8.21.3**
- **React Hook Form 7.62.0**
- **Axios 1.11.0**

## Yêu cầu hệ thống

- **Java**: JDK 21+
- **Node.js**: 18+
- **MySQL**: 8.0+
- **Maven**: 3.6+

## 🚀 Cài đặt và chạy

### 1. Clone repository

```bash
git clone <https://github.com/PhuocTai1704/Manage-game-infomation.git>
cd Game-management
```

### 2. Backend Setup

```bash
cd Game-BE
# Cấu hình database trong application.properties
mvn clean install
mvn spring-boot:run
```

### 3. Frontend Setup

```bash
cd Game-FE
npm install
npm run dev
```

## 📖 API Documentation

Sau khi chạy backend, truy cập Swagger UI tại:

```
http://localhost:8080/swagger-ui.html
```

## Authentication

Hệ thống sử dụng JWT authentication:

- **Register**: `POST /api/auth/register`
- **Login**: `POST /api/auth/login`
- **Protected Routes**: Yêu cầu Bearer token

## 📝 License

MIT License

## Tác giả

**Đặng Phước Tài**

---

Xem chi tiết:

- [Backend Documentation](./Game-BE/README.md)
- [Frontend Documentation](./Game-FE/README.md)
