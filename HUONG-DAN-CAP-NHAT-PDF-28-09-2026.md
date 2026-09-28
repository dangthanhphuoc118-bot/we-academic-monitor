# Cập nhật theo PDF — 28/09/2026

## Nội dung

- Khi chọn nhiều Unit, mỗi Unit có bảng **Evaluation Criteria** riêng. Kết quả tổng của lượt kiểm tra tính trên các tiêu chí của tất cả bảng; chỉ cần một tiêu chí dưới ngưỡng là Redflag.
- Riêng các Day Baby Stars có nội dung **All reviews** được gộp vào một bảng Evaluation Criteria khi chọn cùng lúc. Day khác vẫn có bảng riêng.
- Starters, Movers và Flyers: chọn chủ đề Freestyle để xem toàn bộ câu YES/NO và WH QUESTIONS; không còn nút **Đổi 5 câu**. Những lượt đã lưu 5 câu trước đây vẫn hiển thị và cập nhật được.
- Tab **Theo dõi 12 tuần** chỉ hiển thị 12 tuần gần nhất. Chính sách lưu dữ liệu 48 tuần cũ vẫn giữ nguyên để tránh xóa thêm kết quả đã có.
- Mỗi level Super Kids 1–8 có **All reviews** sau Unit cuối, với nội dung tổng hợp các Unit trước đó. Có thể chỉnh chương này ở Khung chương trình.

## Cập nhật website đang chạy

1. Sao lưu D1 theo hướng dẫn đang dùng trước khi cập nhật.
2. Giải nén ZIP, chép toàn bộ nội dung thư mục `WE-Academic-Monitor-Cloudflare` vào gốc repository đang có `package.json` và ghi đè file cùng tên.
3. Giữ nguyên file `wrangler.jsonc` của website đang chạy, nhất là `database_id` và binding `DB`. ZIP SAFE không chứa file này.
4. Commit và push; chạy quy trình build/deploy Cloudflare hiện tại. Bản này không có migration D1 mới.
5. Thử một lượt kiểm tra Super Kids có hai Unit, Baby Stars có hai Day All reviews và một lượt Starters chọn chủ đề nhiều hơn 5 câu. Xem lại các bảng điểm trong Báo cáo và Theo dõi 12 tuần.

Các phiếu cũ không bị chuyển đổi hàng loạt. Phiếu có một bảng điểm chung tiếp tục hiển thị như trước; khi mở để cập nhật, các giá trị cũ được điền vào từng bảng Unit để AL rà soát và lưu lại.
