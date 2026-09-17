# Hướng dẫn cập nhật bản 17/09/2026

Gói cập nhật này dùng để chép đè lên repository `we-academic-monitor` hiện tại. Gói không chứa `wrangler.jsonc`, nên Database ID thật đang dùng trên GitHub sẽ được giữ nguyên.

## 1. Sao lưu D1

Chạy trong Terminal trên máy tính, tại thư mục repository:

```bash
npx wrangler login
npx wrangler d1 export we-academic-monitor-db --remote --output=backup-before-2026-09-17.sql
```

Không nhập lệnh này trong D1 Console; D1 Console chỉ nhận câu lệnh SQL.

## 2. Chép bản cập nhật vào GitHub

1. Tải và giải nén file `WE-Academic-Monitor-Update-SAFE-2026-09-17.zip`.
2. Chép toàn bộ file và thư mục đã giải nén vào repository hiện tại, chọn ghi đè file trùng tên.
3. Không xóa hoặc thay `wrangler.jsonc` đang có trong repository.
4. Kiểm tra `wrangler.jsonc` vẫn chứa đúng Database ID của D1 đang hoạt động.
5. Commit và push:

```bash
git add .
git commit -m "Update academic monitor 2026-09-17"
git push
```

## 3. Cấu hình Cloudflare Workers Builds

Giữ đúng hai lệnh:

```text
Build command: npm run build
Deploy command: npm run deploy
```

Không dùng `npm wrangler deploy`.

Bản này không có migration mới. Lệnh deploy vẫn kiểm tra migration hiện có trước khi phát hành Worker.

## 4. Kiểm tra sau khi deploy

1. Đăng nhập bằng Admin, Academic Manager hoặc Academic Leader.
2. Xác nhận thanh điều hướng không còn tab **Kiểm tra học viên**.
3. Vào **Lớp học → Mở danh sách học viên → Kiểm tra ngay**.
4. Kiểm tra Baby Stars chỉ có Spelling và Writing.
5. Kiểm tra Movers hiển thị 5 nhóm ADJ, NOUN, VERB, ADV, PREPOSITION.
6. Với Starters, Movers hoặc Flyers, xác nhận có đúng 5 câu Freestyle và nút **Đổi 5 câu**.
7. Lưu một kết quả, vào **Báo cáo → Lịch sử kiểm tra học viên → Cập nhật**; xác nhận dữ liệu cũ được điền lại.
8. Cập nhật kết quả rồi làm mới trang; xác nhận chỉ bản ghi cũ thay đổi và không có dòng trùng.

## 5. Nếu Cloudflare báo không tìm thấy D1

Lỗi có Database ID `00000000-0000-4000-8000-000000000000` nghĩa là repository đang dùng file cấu hình mẫu. Mở `wrangler.jsonc`, thay ID số 0 bằng Database ID thật trong **Cloudflare Dashboard → Storage & Databases → D1 → we-academic-monitor-db**, commit rồi deploy lại.
