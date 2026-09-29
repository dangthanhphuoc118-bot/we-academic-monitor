# Cập nhật điểm Vocabulary và màu Evaluation Criteria — 29/09/2026

## Trên phiếu kiểm tra

- Vocabulary của Super Kids là **số từ trả lời đúng**, không phải phần trăm. Ví dụ Unit có 8 từ, đúng 50% thì nhập **4/8**. Nhập 50/8 sẽ hiện cảnh báo tại ô điểm và lý do ở dòng Unit; dòng chỉ chuyển xanh khi sửa về 0–8 và các tiêu chí khác đã hợp lệ.
- Khi nhập nhiều Unit, những mục đã chấm đủ chuyển xanh. Cần bấm **Lưu đánh giá** để lưu kết quả cuối cùng.

## Trong Báo cáo và Theo dõi 12 tuần

- Mỗi tiêu chí có màu riêng: **Good** xanh lá nếu điểm trên 80%; **Redflag** đỏ nếu dưới ngưỡng của tiêu chí; còn lại **Average** vàng.
- Ngưỡng Redflag: Baby Stars Spelling/Writing dưới 50%; Super Kids Vocabulary dưới 70% hoặc Communication dưới 60%; Cambridge Pattern/Free dưới 60%.
- Pronunciation **Clear** và lựa chọn **Correct** có màu xanh; **Unclear** và **Incorrect** có màu đỏ. Màu ở từng ô mô tả tiêu chí đó, không thay đổi kết quả tổng đã lưu.

## Cập nhật website đang chạy

1. Sao lưu D1 theo quy trình hiện tại.
2. Giải nén ZIP SAFE, chép toàn bộ nội dung thư mục `WE-Academic-Monitor-Cloudflare` vào gốc repository đang có `package.json`, ghi đè file trùng tên.
3. Giữ nguyên `wrangler.jsonc` đang chạy, nhất là `database_id` và binding `DB`.
4. Commit, push và triển khai theo quy trình Cloudflare hiện tại. Bản này không có migration D1 mới.
5. Thử nhập 50 tại một Unit có 8 từ, kiểm tra cảnh báo; sửa thành 4, nhập Communication và Pronunciation. Mở Báo cáo để đối chiếu màu từng tiêu chí trên một phiếu Super Kids và một phiếu Cambridge.
