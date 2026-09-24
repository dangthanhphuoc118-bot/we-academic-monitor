# Cập nhật WE Academic Monitor — 24/09/2026

Bản này hoàn thiện các phần giao diện còn thiếu trong tài liệu ngày 24/09. Không có migration mới và không xóa dữ liệu D1.

## Thay đổi chính

1. Tất cả Vocabulary hiển thị dạng bullet point gọn thay cho các chip từ vựng.
2. Khi kiểm tra Starters, Movers hoặc Flyers, người dùng chọn một **Chủ đề Freestyle**. Năm câu được lấy ngẫu nhiên chỉ trong chủ đề đó.
3. Chủ đề phải có tối thiểu 5 câu mới xuất hiện trong danh sách chọn. Có thể bổ sung câu tại **Khung chương trình → Chỉnh sửa ngân hàng**.
4. Pronunciation được đánh giá một lần và dùng chung cho Pattern/Free.
5. Pattern và Free có hai ô nhập điểm từ 0–100%.
6. One/Many và Am/Is/Are vẫn được đánh giá riêng cho Pattern và Free.

| Tiêu chí | Pattern | Free |
| --- | --- | --- |
| Điểm | 0–100% | 0–100% |
| Pronunciation | Dùng chung: Clear/Unclear | Dùng chung: Clear/Unclear |
| One/Many | Correct/Incorrect | Correct/Incorrect |
| Am/Is/Are | Correct/Incorrect | Correct/Incorrect |

Quy tắc kết quả không đổi: Pattern hoặc Free dưới 60% là Redflag. Nếu không có Redflag, trung bình trên 80% là Good; còn lại là Average.

## Cập nhật GitHub và Cloudflare

1. Sao lưu D1:

```bash
npx wrangler login
npx wrangler d1 export we-academic-monitor-db --remote --config wrangler.jsonc --output=../backup-before-2026-09-24.sql
```

2. Giải nén gói `WE-Academic-Monitor-Update-SAFE-2026-09-18.zip`.
3. Chép thư mục `WE-Academic-Monitor-Cloudflare` vào repository hiện tại và ghi đè file trùng tên.
4. Gói SAFE không chứa `wrangler.jsonc`; giữ nguyên file này trên GitHub để bảo toàn Database ID thật.
5. Commit và push:

```bash
git add .
git commit -m "Complete vocabulary and Cambridge evaluation UI"
git push
```

Trong Cloudflare Workers Builds, tiếp tục dùng:

```text
Build command: npm run build
Deploy command: npm run deploy
```

## Kiểm tra sau khi deploy

1. Mở **Khung chương trình** và xác nhận Vocabulary hiển thị dạng bullet point.
2. Mở một học viên Starters/Movers/Flyers và chọn một chủ đề Freestyle.
3. Bấm **Đổi 5 câu** vài lần; mọi câu phải tiếp tục nằm trong chủ đề đang chọn.
4. Nhập điểm % Pattern và Free, chọn một Pronunciation chung, rồi hoàn tất One/Many và Am/Is/Are ở hai cột.
5. Lưu và mở lại kết quả trong **Báo cáo** và **Theo dõi 48 tuần**.
6. Mở một kết quả cũ để xác nhận dữ liệu trước đây vẫn đọc được.

Nếu một chủ đề không xuất hiện, hãy kiểm tra tổng số câu YES/NO và WH QUESTIONS của chủ đề đó. Chủ đề cần ít nhất 5 câu để tạo một lượt kiểm tra.

## Kiểm thử kỹ thuật

```bash
node --import tsx --test tests/*.test.mjs
npx tsc --noEmit
npm run lint
npm run build
```

Các kiểm thử dùng cơ sở dữ liệu cục bộ và không ghi vào D1 thật.
