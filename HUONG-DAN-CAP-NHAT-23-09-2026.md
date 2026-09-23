# Cập nhật WE Academic Monitor — 23/09/2026

Bản này cập nhật giao diện và cách nhập/hiển thị đánh giá Cambridge theo file yêu cầu mới. Không có migration D1 mới và không xóa dữ liệu hiện có.

## Nội dung cập nhật

1. Giao diện dùng nền trung tính, màu xanh giáo dục và các thẻ nội dung gọn hơn.
2. Freestyle của Starters, Movers và Flyers hiển thị thành hai cột **YES / NO** và **WH QUESTIONS**.
3. Phần chấm Cambridge dùng ma trận:

| Tiêu chí | Pattern | Free |
| --- | --- | --- |
| Pronunciation | Clear / Unclear | Clear / Unclear |
| One / Many | Correct / Incorrect | Correct / Incorrect |
| Am / Is / Are | Correct / Incorrect | Correct / Incorrect |

4. Hệ thống tự tính kết quả Pattern và Free từ sáu lựa chọn trong ma trận. Người dùng không nhập phần trăm thủ công.
5. Báo cáo và tab **Theo dõi 48 tuần** hiển thị lại đúng cấu trúc ma trận.
6. Kết quả cũ vẫn tương thích: các lựa chọn Pronunciation, One/Many và Am/Is/Are trước đây được dùng cho cả Pattern và Free khi mở lại.
7. Vocabulary 5 nhóm ADJ, NOUN, VERB, ADV và PREPOSITION được trình bày gọn hơn, không còn năm cột cao kéo dài.

## Cập nhật mã trên GitHub

1. Sao lưu D1 trước khi cập nhật:

```bash
npx wrangler login
npx wrangler d1 export we-academic-monitor-db --remote --config wrangler.jsonc --output=../backup-before-2026-09-23.sql
```

2. Giải nén `WE-Academic-Monitor-Update-SAFE-2026-09-18.zip`.
3. Chép nội dung thư mục `WE-Academic-Monitor-Cloudflare` vào repository hiện tại và ghi đè file trùng tên.
4. Giữ nguyên `wrangler.jsonc` đang có trên GitHub. Gói SAFE không chứa file này, nên Database ID thật không bị thay thế.
5. Commit và push:

```bash
git add .
git commit -m "Update Cambridge evaluation UI"
git push
```

## Cloudflare Workers Builds

Giữ cấu hình:

```text
Build command: npm run build
Deploy command: npm run deploy
```

`npm run deploy` vẫn kiểm tra và áp dụng các migration cũ còn thiếu trước khi phát hành Worker. Bản 23/09 không có migration mới.

## Kiểm tra sau khi deploy

1. Mở một học viên Starters, Movers hoặc Flyers.
2. Xác nhận năm câu Freestyle nằm trong hai cột YES/NO và WH QUESTIONS.
3. Chọn đủ sáu ô trong ma trận Pattern–Free rồi lưu.
4. Mở **Báo cáo** và **Theo dõi 48 tuần** để xác nhận cùng ma trận được hiển thị.
5. Mở một Unit Movers/Flyers và kiểm tra năm nhóm Vocabulary hiển thị dạng gọn.
6. Mở lại một kết quả cũ để kiểm tra dữ liệu cũ vẫn đọc được.

## Nếu gặp lỗi

- **Database not found / ID toàn số 0:** khôi phục `database_id` thật trong `wrangler.jsonc`; không tạo database mới nếu cần giữ dữ liệu.
- **Movers/Flyers chưa có câu Freestyle:** vào **Khung chương trình**, chọn level, bấm **Chỉnh sửa ngân hàng** và nhập tối thiểu 5 câu.
- **Không thấy giao diện mới:** kiểm tra commit mới đã được Cloudflare deploy thành công, sau đó tải lại bằng Ctrl+F5.
- Không nhập lệnh `npx` vào phần **Queries** của D1 Console; cửa sổ đó chỉ nhận SQL.

## Kiểm thử kỹ thuật

```bash
node --import tsx --test tests/*.test.mjs
npx tsc --noEmit
npm run lint
npm run build
```

Bộ kiểm thử chạy với SQLite/D1 cục bộ, không kết nối và không ghi vào D1 thật.
