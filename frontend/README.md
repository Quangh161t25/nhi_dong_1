# Hệ thống Ghi nhận & Theo dõi Nhiệt độ — Bệnh viện Nhi Đồng 1 (React Frontend)

Ứng dụng Web React được chuyển đổi và nâng cấp từ phiên bản biểu mẫu `form.html` gốc, phục vụ cho Khoa Xét nghiệm Huyết Học — Bệnh viện Nhi Đồng 1.

---

## 🚀 Các tính năng chính

1. **Xác thực & Phân quyền nhân viên**:
   - Tự động đồng bộ tài khoản nhân viên từ Google Sheets (`DSNV`).
   - Tạo chữ ký bảo mật RS256 JWT với Google Service Account.
   - Lưu trữ phiên đăng nhập (`localStorage`), hỗ trợ đăng xuất an toàn.

2. **Ghi nhận & Quản lý Nhiệt độ Tủ**:
   - Tra cứu thông tin tủ theo ID hoặc quét mã QR qua Camera (`html5-qrcode`).
   - Tự động điền: Tên tủ, vị trí, khoảng nhiệt độ cho phép (Min/Max), độ ẩm tiêu chuẩn.
   - Hỗ trợ giao diện đo độ ẩm đặc thù cho các phòng chỉ định.
   - Tự động đánh giá kết quả: **ĐẠT** (xanh ngọc), **THẤP** (xanh cyan), **CAO** (đỏ hồng).
   - Chọn khung giờ thông minh (2 ca hoặc 6 khung giờ đặc biệt L1–L6) theo giờ hiện tại.

3. **Chữ ký điện tử**:
   - Tích hợp khung ký tên cảm ứng trực tiếp trên màn hình (`signature_pad`).
   - Xuất dữ liệu chữ ký định dạng DataURL lưu trực tiếp về Google Sheets.

4. **Đồng bộ dữ liệu đa luồng về Google Sheets**:
   - Ghi dữ liệu vào sheet `DATA`.
   - Tự động ghi nhận sheet `CV` nếu nhập vào khung giờ sáng quy định (06:30 – 08:30).
   - Kiểm tra và ghi nhận vào sheet `DATA_ALL` theo định dạng `YYYY/MM | Tên tủ`.

---

## 🛠 Hướng dẫn cài đặt & khởi chạy

### Yêu cầu:
- Node.js (phiên bản 18+ trở lên, khuyến nghị v20+)
- npm hoặc pnpm

### Cài đặt thư viện:
```bash
cd frontend
npm install
```

### Chạy môi trường phát triển (Dev server):
```bash
npm run dev
```
Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:5173/`

### Đóng gói ứng dụng (Production Build):
```bash
npm run build
```
Kết quả build hoàn chỉnh sẽ nằm trong thư mục `dist/`, sẵn sàng triển khai lên GitHub Pages, Vercel, Netlify hoặc máy chủ nội bộ bệnh viện.
