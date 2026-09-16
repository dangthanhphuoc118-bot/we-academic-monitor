# WE Academic Monitor — GitHub + Cloudflare

Website nội bộ để theo dõi học viên, lớp học, giáo viên, khung chương trình và báo cáo đánh giá. Bản này đã được chuẩn bị để triển khai độc lập bằng **GitHub + Cloudflare Workers + D1**.

## Chức năng chính

- Quản lý lớp, học viên và giáo viên.
- Khung chương trình Baby Stars, Super Kids 1–8, Starters, Movers và Flyers.
- Tự thêm, đổi tên, sắp xếp và tạm ẩn chương trình hoặc trình độ.
- Phiếu đánh giá thay đổi theo chương trình của học viên.
- Chọn nhiều học viên theo lớp/ngày và đưa vào danh sách chờ kiểm tra được nhóm theo lớp.
- Lọc lớp theo ngày học thực tế với múi giờ Việt Nam hoặc xem tất cả lớp.
- Chỉnh sửa từng Unit/Day và khôi phục nội dung gốc.
- Hiển thị riêng Vocabulary và Grammar / Communication trong khung chương trình.
- Tự quản lý mẫu nhận xét để giáo viên tick nhanh khi đánh giá.
- Đánh giá giáo viên.
- Báo cáo học viên theo ba vùng Good, Average và Redflag kèm nhận xét/lý do.
- Quy tắc Good/Average/Redflag riêng cho Baby Stars, Super Kids và Starters/Movers/Flyers.
- Đăng nhập bằng email và mã PIN, có ba vai trò Admin, Academic Manager và Academic Leader.
- Admin tự tạo, chỉnh sửa, phân quyền, đổi PIN hoặc khóa tài khoản trên website.
- Academic Manager và Academic Leader có cùng quyền quản lý học vụ, kiểm tra học viên, đánh giá giáo viên và xem báo cáo.
- Tên người thực hiện đánh giá được ghi nhận tự động từ tài khoản đăng nhập, không cần nhập thủ công.

## Yêu cầu

- Tài khoản GitHub.
- Tài khoản Cloudflare đã kích hoạt Workers.
- Node.js 22.13 trở lên nếu chạy lệnh trên máy tính.
- Tên Worker: `we-academic-monitor`.
- Tên D1: `we-academic-monitor-db`.
- Binding D1 bắt buộc giữ là `DB`.

## Hướng dẫn nhanh

Toàn bộ hướng dẫn từng bước nằm trong file [HUONG-DAN-SETUP.md](HUONG-DAN-SETUP.md).

Các lệnh quan trọng:

```bash
npm install
npx wrangler login
npm run db:migrate:remote
npm run build
npm run deploy
```

## Lưu ý dữ liệu

- GitHub chỉ chứa mã nguồn, không chứa danh sách học viên hoặc kết quả đánh giá.
- Dữ liệu thật nằm trong Cloudflare D1.
- D1 mới sẽ trống. Dữ liệu trên website ChatGPT Sites hiện tại không tự động chuyển sang D1 mới.
- Không chỉnh sửa hoặc xóa các migration cũ trong thư mục `drizzle/` sau khi đã triển khai.
- Migration `0002_grey_sentinels.sql` chỉ bổ sung cấu hình và nhận xét; không xóa dữ liệu học viên hiện có.
- Migration `0003_dazzling_susan_delgado.sql` chỉ tạo các bảng đăng nhập; không sửa hoặc xóa dữ liệu học vụ hiện có.
- Migration `0004_rich_masked_marvel.sql` chỉ tạo bảng danh sách chờ kiểm tra; không sửa hoặc xóa dữ liệu học vụ hiện có.
- Trước mỗi thay đổi lớn, xuất bản sao D1 theo hướng dẫn trong `HUONG-DAN-SETUP.md`.

## Bảo mật

Website yêu cầu email và PIN trước khi tải dữ liệu. PIN được băm trước khi lưu, phiên đăng nhập dùng cookie bảo mật trong 30 ngày và tài khoản bị chặn tạm thời sau nhiều lần nhập sai. Cloudflare Access vẫn có thể được bật như một lớp bảo vệ bổ sung.
