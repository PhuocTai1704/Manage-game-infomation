# Game Management Frontend

Frontend React + TypeScript + Vite cho hệ thống quản lý game. Giao diện Bootstrap, quản lý form với React Hook Form, bảng dữ liệu với TanStack Table, routing với React Router DOM.

## Tính năng

- Auth: Login/ProtectedRoute
- Game: Bảng dữ liệu (sort/filter/paginate), tìm kiếm, thêm/sửa/xóa, đa ngôn ngữ
- Category: Danh sách và CRUD
- Axios interceptors

## Công nghệ

- React 19, TypeScript 5, Vite 7
- Bootstrap 5, React-Bootstrap
- React Hook Form + Yup
- TanStack Table
- React Router DOM
- Axios

## Cấu trúc

```
src/
├─ components/
│  ├─ Games/         # Games.tsx, GameForm.tsx
│  ├─ Categories/
│  └─ common/
├─ contexts/         # AuthContext.tsx
├─ services/         # axiosInstance.ts, api.ts
└─ main.tsx
```

## Cấu hình môi trường

Tạo file `.env` tại `Game-FE/`:

```
VITE_API_BASE_URL=url_your_backend
```

## Lệnh chạy

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run preview
```

## License

MIT
