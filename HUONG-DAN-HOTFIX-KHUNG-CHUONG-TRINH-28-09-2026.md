# HOTFIX: Trang Khung chương trình không tải

Ảnh cho thấy trang báo **“This page couldn’t load”**. Chúng tôi tái hiện được lỗi khi giao diện Baby Stars mới chạy cùng file `lib/speaking-questions.ts` cũ: ngân hàng câu hỏi Baby Stars không có trong file cũ, khiến trang Khung chương trình lỗi khi render. Không có log trình duyệt đã đăng nhập nên đây là chẩn đoán dựa trên tái hiện, chưa phải xác nhận trực tiếp nguyên nhân trên website đang chạy.

## Cách cập nhật

1. Giải nén gói **WE-Academic-Monitor-Update-SAFE-2026-09-28-HOTFIX.zip**.
2. Mở thư mục `WE-Academic-Monitor-Cloudflare` và chép **toàn bộ nội dung** vào gốc repository GitHub nơi có `package.json`; chọn ghi đè các file trùng tên. Đừng chỉ chép file giao diện.
3. Trên GitHub, mở `lib/speaking-questions.ts` và kiểm tra file có `BABY_STARS` cùng 8 câu hỏi Baby Stars. Kiểm tra `app/curriculum-check.tsx` cũng là bản mới.
4. Giữ nguyên `wrangler.jsonc` của website đang chạy. Gói SAFE không chứa file này.
5. Commit/push, chờ Cloudflare build từ commit mới. Nếu vẫn lấy bản build cũ, chọn **Clear build cache and retry**. Sau khi deploy xong, tải lại trang bằng `Ctrl + F5`.

HOTFIX cho phép trang Khung chương trình tiếp tục hiển thị ngay cả khi ngân hàng Baby Stars tạm thời thiếu, đồng thời gói đầy đủ sẽ cung cấp 8 câu đúng như yêu cầu. Bản này không có migration mới so với gói cập nhật ngày 28/09; `0009` và `0010` chỉ thêm cột cho danh sách kiểm tra dự kiến, không xóa dữ liệu D1.
