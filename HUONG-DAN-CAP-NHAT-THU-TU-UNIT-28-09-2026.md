# Cập nhật thứ tự Unit — 28/09/2026

## Thay đổi theo PDF mới

- Phiếu nhiều Unit hiển thị **Unit → Evaluation Criteria → Unit → Evaluation Criteria**. Khi chọn nhiều Day Baby Stars có nội dung All reviews, nhóm Day đó vẫn dùng chung một bảng chấm sau Day cuối.
- Vocabulary của các chương **All reviews** ở Super Kids được chia thành những khung có tiêu đề từng Unit. Trong Khung chương trình vẫn có thể sửa từng chương ôn tập; giữ dòng bắt đầu bằng `##` trong ô Vocabulary để các khung tiếp tục tách rõ.
- Mỗi level Super Kids có chương ôn tập của level trước **trước Unit 1**: Super Kids 1 ôn Baby Stars; Super Kids 2–8 lấy nội dung All reviews mặc định của Super Kids 1–7. Chương All reviews của chính level đó vẫn ở sau Unit cuối.
- Mã Unit cũ không đổi. Chương ôn tập trước Unit 1 dùng mã nội bộ riêng, nên lịch và phiếu đã lưu vẫn tham chiếu đúng Unit.

## Cập nhật website

1. Sao lưu D1 theo quy trình hiện tại.
2. Giải nén gói SAFE, chép toàn bộ nội dung thư mục `WE-Academic-Monitor-Cloudflare` vào gốc repository đang có `package.json`, ghi đè file trùng tên.
3. Giữ nguyên `wrangler.jsonc` của website đang chạy, nhất là `database_id` và binding `DB`.
4. Commit, push và triển khai theo quy trình Cloudflare hiện tại. Bản này không có migration D1 mới.
5. Mở Khung chương trình Super Kids 1 và Super Kids 4 để kiểm tra chương ôn tập trước Unit 1; thử chọn hai Unit trên phiếu và kiểm tra thứ tự hiển thị.

Các chỉnh sửa All reviews đã lưu trước đây trong D1 vẫn được giữ. Chương ôn tập đầu level mới được tạo từ nội dung mặc định; có thể sửa trực tiếp nếu cần dùng nội dung riêng của trung tâm.
