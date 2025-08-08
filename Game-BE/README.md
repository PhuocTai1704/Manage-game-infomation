# Game Management Backend

Backend API cho hệ thống quản lý game, xây dựng bằng Spring Boot. Hỗ trợ JWT auth, CRUD Game/Category, full-text search với Hibernate Search (Lucene), và Swagger.

## Tính năng

- Auth: Đăng ký, đăng nhập, JWT (HS512)
- Game: CRUD, đa ngôn ngữ (EN/KO/JA), tìm kiếm
- Category: CRUD
- Swagger: Tài liệu API
- MySQL + JPA/Hibernate
- Hibernate Search (Lucene) full-text

## Công nghệ

- Java 21, Spring Boot 3.5.4
- Spring Security, Spring Data JPA
- Nimbus JOSE+JWT, SpringDoc OpenAPI
- Hibernate Search (Lucene)
- MySQL, Maven

## Cấu trúc

```
src/main/java/com/dangphuoctai/GameManage/
├─ config/        ├─ controller/   ├─ entity/      ├─ enums/
├─ exceptions/    ├─ payloads/     ├─ repository/  ├─ security/
├─ service/       ├─ specification/└─ utils/
```

## Cấu hình

- Database (trong `application.properties`):
  - `spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:manage_game}`
  - `spring.datasource.username=${DB_USERNAME:root}`
  - `spring.datasource.password=${DB_PASSWORD:}`
- JWT:
  - `jwt_secret=${SECRET_KEY}` (đặt biến môi trường `SECRET_KEY`)
- Swagger UI: `/swagger-ui.html`
- Hibernate Search (Lucene): lưu index tại `./lucene/indexes`

## Chạy dự án

```bash
mvn clean install
mvn spring-boot:run
```

## API chính

- Auth:
  - POST `/api/auth/register`
  - POST `/api/auth/login`
- Game:
  - GET `/api/public/games`
  - GET `/api/public/games/{id}`
  - POST `/api/admin/games`
  - PUT `/api/admin/games`
  - DELETE `/api/admin/games/{id}`
- Category:
  - GET `/api/public/categories`
  - GET `/api/public/categories/{id}`
  - POST `/api/admin/categories`
  - PUT `/api/admin/categories`
  - DELETE `/api/admin/categories/{id}`

## Tài liệu API

- Swagger UI: http://localhost:8080/swagger-ui.html

## License

MIT
