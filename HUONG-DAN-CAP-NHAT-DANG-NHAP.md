# Cập nhật đăng nhập email + PIN an toàn

Bộ source này dành cho repository `we-academic-monitor` đang hoạt động.

## Trước khi cập nhật

1. Xác nhận website hiện tại vẫn mở được và D1 `we-academic-monitor-db` còn dữ liệu.
2. Trong D1 Query Console, chạy `/bookmark` và lưu mã bookmark.
3. Nếu có thể dùng Terminal, xuất thêm bản sao SQL:

```bash
npx wrangler d1 export we-academic-monitor-db --remote --output=backup-before-auth-update.sql
```

## Đưa source lên GitHub

1. Giải nén file ZIP cập nhật.
2. Mở repository GitHub hiện tại.
3. Chọn **Add file → Upload files**.
4. Kéo toàn bộ nội dung bên trong thư mục đã giải nén vào repository rồi commit.

Gói cập nhật an toàn không chứa `wrangler.jsonc`, vì vậy Database ID đang hoạt động trên GitHub sẽ được giữ nguyên. Không xóa file `wrangler.jsonc` cũ.

Cloudflare phải dùng:

```text
Build command: npm run build
Deploy command: npm run deploy
```

Deploy sẽ áp dụng các migration còn thiếu. Bản cập nhật mới nhất có `0004_rich_masked_marvel.sql`; migration này chỉ thêm bảng danh sách chờ kiểm tra và không xóa dữ liệu học viên.

## Tạo Admin đầu tiên trên Cloudflare

1. Sau khi deploy thành công, vào **Workers & Pages → we-academic-monitor → Settings**.
2. Mở **Variables and Secrets**.
3. Thêm `BOOTSTRAP_ADMIN_EMAIL` dưới dạng text, giá trị là email Admin.
4. Thêm `BOOTSTRAP_ADMIN_PIN` dưới dạng secret, giá trị là PIN 4–8 chữ số.
5. Lưu thay đổi, sau đó mở lại website.
6. Đăng nhập bằng email và PIN trên.

## Tạo hai vai trò còn lại

1. Đăng nhập bằng Admin.
2. Mở menu **Tài khoản**.
3. Chọn **Thêm tài khoản**.
4. Nhập họ tên, email, PIN và chọn một trong các vai trò:

- `Academic Manager`: quản lý học vụ, kiểm tra học viên, đánh giá giáo viên và xem báo cáo.
- `Academic Leader`: có cùng quyền học vụ với Academic Manager, bao gồm kiểm tra học viên, đánh giá giáo viên và báo cáo.

Admin có thể đổi email, đổi PIN, đổi vai trò hoặc tạm khóa từng tài khoản ngay trên website.

Phiên đăng nhập được lưu bằng cookie bảo mật trong **30 ngày** trên thiết bị. Đăng xuất sẽ xóa phiên ngay lập tức.

## Kiểm tra sau cập nhật

1. Academic Manager và Academic Leader nhìn thấy cùng các màn hình học vụ.
2. Phiếu đánh giá không còn ô **Giáo viên đánh giá**.
3. Lưu thử một kết quả; hệ thống tự ghi nhận tài khoản thực hiện ở D1.
4. Cả Academic Manager và Academic Leader mở được phần quản lý, đánh giá giáo viên và báo cáo.
5. Admin mở được toàn bộ website và menu **Tài khoản**.
6. Tại **Lớp học**, chọn ngày, chọn nhiều học viên rồi xác nhận; danh sách phải xuất hiện theo từng lớp tại **Kiểm tra học viên**.
7. Báo cáo học viên ban đầu hiển thị đúng ba thẻ **Good – Average – Redflag**; bấm từng thẻ để xem chi tiết.

Sau khi Admin đầu tiên đã được tạo trong D1, có thể xóa hai biến `BOOTSTRAP_ADMIN_EMAIL` và `BOOTSTRAP_ADMIN_PIN` khỏi Cloudflare. Không chia sẻ PIN qua ảnh chụp màn hình.
