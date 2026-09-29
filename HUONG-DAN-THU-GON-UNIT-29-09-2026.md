# Cập nhật phiếu kiểm tra nhiều Unit — 29/09/2026

## Cách sử dụng

- Khi AL chọn nhiều Unit, phiếu hiển thị các dòng Unit thu gọn. Bấm một dòng để mở nội dung chương trình và bảng Evaluation Criteria tương ứng; bấm lần nữa để thu lại. Mỗi lần mở một mục.
- Khi mọi tiêu chí của mục đã hợp lệ, dòng đó chuyển xanh lá và hiển thị **Đã hoàn tất**. Có thể chuyển sang mục khác mà không mất điểm đã nhập. Nút **Lưu đánh giá** chỉ khả dụng khi tất cả mục đã hoàn tất.
- Nhiều Day Baby Stars thuộc All reviews vẫn dùng chung một bảng điểm và hiển thị thành một mục thu gọn. Nếu chỉ chọn một Unit, nội dung được mở sẵn.
- Kết quả đã lưu trước đây vẫn mở và chỉnh sửa được; các mục đủ điểm sẽ hiển thị màu xanh ngay khi mở phiếu.

## Cập nhật website đang chạy

1. Sao lưu D1 theo quy trình hiện tại.
2. Giải nén ZIP SAFE, chép toàn bộ nội dung thư mục `WE-Academic-Monitor-Cloudflare` vào gốc repository đang có `package.json`, ghi đè file trùng tên.
3. Giữ nguyên `wrangler.jsonc` đang chạy, nhất là `database_id` và binding `DB`.
4. Commit, push và triển khai theo quy trình Cloudflare hiện tại. Bản này không có migration D1 mới.
5. Chọn một học viên Starters với vài Unit. Mở Unit 1, nhập đủ tiêu chí, xác nhận dòng chuyển xanh; mở Unit 2, kiểm tra điểm Unit 1 vẫn được giữ khi quay lại. Thử lưu và mở lại phiếu.
