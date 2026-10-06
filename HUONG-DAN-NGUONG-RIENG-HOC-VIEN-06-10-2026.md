# Đánh giá theo ngưỡng riêng của học viên — 06/10/2026

## Cách dùng

1. Vào **Học viên**, bấm biểu tượng bút chì tại học viên cần điều chỉnh.
2. Tích **★ Đánh dấu học viên đánh giá riêng**.
3. Nhập **Average từ (%)** và **Good từ (%)** rồi lưu. Ví dụ nhập `40` và `70`:
   - Redflag: dưới 40%.
   - Average: từ 40% đến dưới 70%.
   - Good: từ 70% trở lên.
4. Dấu ★ hiện cạnh tên học viên. Phiếu kiểm tra hiển thị trước kết quả theo ngưỡng riêng; Báo cáo và Theo dõi 12 tuần dùng cùng ngưỡng cho cả các lần kiểm tra đã lưu.

Hai mốc phải là số nguyên từ 0–100 và mốc Average phải nhỏ hơn mốc Good. Điểm gốc không đổi. Khi sửa mốc, các kết quả hiển thị được tính lại; bỏ tích ★ thì trở về phân loại trước đây. Mốc riêng được giữ lại để có thể bật lại sau này.

Các ô điểm phần trăm trong **Evaluation Criteria** cũng lấy màu theo hai mốc này. Clear/Correct vẫn xanh và Unclear/Incorrect vẫn đỏ. Học viên không được đánh dấu tiếp tục dùng ngưỡng của chương trình.

## Cập nhật website Cloudflare hiện có

1. Sao lưu D1 theo quy trình của trung tâm.
2. Giải nén gói ZIP, chép nội dung thư mục `WE-Academic-Monitor-Cloudflare` vào gốc repository đang chạy, ghi đè file trùng tên. Giữ nguyên `wrangler.jsonc`, đặc biệt `database_id` và binding `DB`.
3. Commit và push lên GitHub. Chạy `npm run deploy` theo quy trình hiện tại; lệnh này áp dụng migration `0011_sweet_titanium_man.sql` trước khi xuất bản Worker.
4. Mở một học viên đã có kết quả, đặt mốc riêng và kiểm tra ba nơi: phiếu kiểm tra, Báo cáo và Theo dõi 12 tuần.

Migration `0011` chỉ **thêm ba cột** `custom_grading`, `redflag_below`, `good_from` vào bảng `students`. Học viên hiện có mặc định chưa đánh dấu; không xóa điểm hay kết quả đã lưu. Trang đang chạy chỉ hiển thị tính năng này sau khi triển khai gói cập nhật.
