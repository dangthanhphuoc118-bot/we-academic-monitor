# Cập nhật WE Academic Monitor — 28/09/2026

## Tính năng mới

- Pronunciation Clear/Unclear được chấm riêng trong Pattern và Free. Khi mở kết quả cũ, giá trị Pronunciation chung được điền vào cả hai cột để có thể chỉnh sửa tiếp.
- Baby Stars có 8 câu Freestyle chung cho level; xem trong phiếu kiểm tra và sửa tại Khung chương trình. Các câu đã tự chỉnh trong D1 không bị ghi đè.
- Trang **Kiểm tra dự kiến** cho phép chọn học viên, ngày và nhiều Unit/Day. Bấm **Kiểm tra ngay** để mở phiếu đã chọn sẵn. Mỗi lượt lưu một kết quả tổng hợp, lịch chuyển sang Đã kiểm tra. Nếu xóa kết quả đó, lịch trở về Chờ kiểm tra.

## Cập nhật website đang hoạt động

1. Sao lưu D1 trước khi cập nhật: `npx wrangler d1 export we-academic-monitor-db --remote --config wrangler.jsonc --output=backup-before-28-09.sql` (chạy trong thư mục repository đang có `wrangler.jsonc`).
2. Giải nén ZIP mới, mở thư mục `WE-Academic-Monitor-Cloudflare`, chép **toàn bộ nội dung** vào gốc repository GitHub, nơi có `package.json`. Chọn ghi đè các file trùng tên.
3. **Giữ nguyên `wrangler.jsonc` đang chạy**, nhất là `database_id` và binding `DB`. ZIP SAFE không chứa file này.
4. Commit và push. Cloudflare dùng `npm run build` để build, `npm run deploy` để áp dụng migration và triển khai.
5. Kiểm tra log: migration `0009_yellow_bullseye` và `0010_powerful_vindicator` thành công; sau đó thử tạo một mục ở **Kiểm tra dự kiến**.

Gói phải được chép đầy đủ, đặc biệt `app/planned-checks.tsx`, `lib/speaking-questions.ts`, `db/schema.ts`, cả thư mục `drizzle/` và `package-lock.json`. Upload thiếu file sẽ khiến build hoặc trang danh sách lỗi.

Hai migration mới chỉ thêm các cột có giá trị mặc định vào `student_check_queue`. Chúng không xóa học viên, lịch kiểm tra, kết quả học tập hay ngân hàng câu hỏi đã lưu.

## Lưu ý sử dụng

- Với nhiều Unit, phiếu hiển thị nội dung của từng Unit. Vocabulary của Super Kids cộng tổng số từ của các Unit; các tiêu chí được chấm một lần cho cả lượt kiểm tra.
- Mỗi học viên có một mục dự kiến cho mỗi ngày. Có thể sửa danh sách Unit của mục đang chờ; nếu trình độ học viên thay đổi, cần chọn lại Unit trước khi kiểm tra.
- Baby Stars hiện hiển thị cả 8 câu Freestyle như phần tham khảo; điểm của Baby Stars vẫn dựa trên Spelling và Writing.
- D1 hiện có cơ chế lưu lịch sử 48 tuần theo phiên bản trước. Nếu cần giữ dữ liệu lâu hơn, lưu bản sao D1 riêng.
