# Cập nhật WE Academic Monitor — 18/09/2026

Gói này dùng cho repository GitHub và Cloudflare Workers/D1 đang hoạt động của bạn. Các bước dưới đây áp dụng cho bản cập nhật mới nhất; các hướng dẫn ngày 15–17/09 được giữ để tham khảo lịch sử.

## Những thay đổi trong bản này

1. **Flyers:** cập nhật 12 Unit theo PDF mới, chia Vocabulary thành **ADJ, NOUN, VERB, ADV, PREPOSITION**, cùng cách hiển thị với Movers. Nhóm không có từ vẫn được hiển thị.
2. **Bỏ điểm tổng:** không còn các số như `2/5`, `2.03/5`, `3.25/5` trên phiếu kiểm tra, danh sách và báo cáo. Giữ các tiêu chí chi tiết như Pattern/Freestyle theo %, Vocabulary theo số từ đúng, CLEAR/UNCLEAR và ĐÚNG/SAI. Nhãn Good/Average/Redflag giữ nguyên quy tắc hiện tại. Không xóa số liệu lịch sử trong D1.
3. **Đánh giá giáo viên:** thay phiếu chấm điểm bằng **Class Observation Form** theo file bạn cung cấp, có Date, Time, Class, Teacher/TA; mỗi tiêu chí có ô chọn và Note. Có thể xem lại, tìm và sửa/xóa từng phiếu tại trang Đánh giá giáo viên hoặc Báo cáo → Giáo viên. Người ghi nhận được lấy từ tài khoản đăng nhập.
4. **Theo dõi 48 tuần:** tab riêng theo lớp và học viên; lưu mốc bắt đầu riêng cho mỗi học viên; xem kết quả theo từng tuần, mở nhận xét và tiêu chí, thêm hoặc sửa lần kiểm tra.

| Academic | Attitude |
| --- | --- |
| English Use | Phone Use |
| Classroom Control | Leaving Class |
| Student Engagement | Professional Behaviour |
| Learning in Progress | |

Mẫu Observation không có thang điểm. Website lưu nguyên ô chọn và ghi chú, không tự hiểu ô chưa chọn là đạt hay chưa đạt. Các phiếu đánh giá giáo viên trước đây vẫn nằm trong phần lịch sử của Báo cáo.

## Bước 1 — Sao lưu dữ liệu đang dùng

Tại thư mục repository trên máy tính, mở Terminal / PowerShell và chạy:

```bash
npx wrangler login
npx wrangler d1 export we-academic-monitor-db --remote --config wrangler.jsonc --output=../backup-before-2026-09-18.sql
```

Lưu file sao lưu ở máy riêng. **Không nhập lệnh `npx` vào D1 Console:** phần Queries ở Cloudflare chỉ nhận SQL. Đây là lệnh xuất dữ liệu theo [hướng dẫn Cloudflare D1](https://developers.cloudflare.com/d1/best-practices/import-export-data/).

## Bước 2 — Cập nhật mã trên GitHub

1. Giải nén `WE-Academic-Monitor-Update-SAFE-2026-09-18.zip`.
2. Chép nội dung thư mục `WE-Academic-Monitor-Cloudflare` bên trong gói vào **đúng thư mục gốc repository hiện tại** — cùng nơi có `package.json`. Chọn ghi đè file trùng tên; không tạo thêm một thư mục lồng bên trong repository.
3. **Giữ nguyên `wrangler.jsonc` đang có trên GitHub.** Gói SAFE cố ý không chứa file này để giữ Database ID thật. D1 binding phải tiếp tục là `DB`, tên database là `we-academic-monitor-db`, và `migrations_dir` là `drizzle`.
4. Giữ thư mục `drizzle` cũ và thêm file `0005_strong_violations.sql` cùng metadata mới từ gói cập nhật. Không tạo database mới; không xóa bảng hoặc sửa migration cũ.
5. Nếu dùng GitHub trên trình duyệt: mở đúng repository → **Add file → Upload files**, đưa các file/thư mục đã giải nén vào, rồi **Commit changes**. Nếu GitHub giới hạn số file mỗi lần, chia thành vài lượt tải lên.

Nếu dùng Git trên máy tính:

```bash
git add .
git commit -m "Update Flyers, classroom observation and 48-week tracking"
git push
```

## Bước 3 — Build và deploy Cloudflare

Trong cấu hình Builds của Worker hiện tại, giữ:

```text
Build command: npm run build
Deploy command: npm run deploy
```

Tham khảo [cấu hình Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

`npm run deploy` của dự án sẽ áp dụng migration còn thiếu rồi chạy `wrangler deploy`. Migration mới **chỉ tạo hai bảng**:

- `teacher_observations`: phiếu dự giờ mới và ghi chú.
- `student_tracking`: ngày bắt đầu theo dõi của từng học viên.

Nó không xóa/sửa học viên, lớp, tài khoản, kết quả học viên hoặc phiếu giáo viên cũ. Wrangler ghi nhận các migration đã áp dụng và chỉ chạy phần còn thiếu; xem [cơ chế migration D1](https://developers.cloudflare.com/d1/reference/migrations/).

Nếu thao tác từ máy tính thay vì Workers Builds:

```bash
npm ci
npm run build
npm run deploy
```

## Bước 4 — Kiểm tra và sử dụng

### Flyers

Mở **Khung chương trình → Flyers**, kiểm tra Vocabulary của từng Unit đã có 5 nhóm. Sau đó mở phiếu kiểm tra của một học viên Flyers để đối chiếu.

Nếu Unit từng được chỉnh sửa và lưu trên website, nội dung tự chỉnh vẫn được ưu tiên. Để cập nhật Vocabulary của Unit đó: **Chỉnh sửa → Nạp vocab Flyers mới → Lưu nội dung**. Thao tác này chỉ thay ô Vocabulary trong bản nháp, giữ các trường khác. Có thể chỉnh lại từ vựng trước khi lưu. Nút Khôi phục nội dung gốc là thao tác khác, thay cả Unit; chỉ dùng khi muốn khôi phục toàn bộ Unit.

### Observation

1. Vào **Đánh giá giáo viên**.
2. Chọn ngày, giờ, lớp và Teacher/TA. Trợ giảng được thêm trong mục Giáo viên như các nhân sự khác, sau đó chọn vai trò TA trên phiếu.
3. Tick và ghi chú cho các tiêu chí cần ghi nhận; phải có ít nhất một ô được chọn hoặc một ghi chú.
4. Bấm **Lưu Observation**. Mở phiếu vừa lưu trong Lịch sử Observation để xem hoặc cập nhật.
5. Vào **Báo cáo → Giáo viên** để xem tổng hợp. Phiếu cũ nằm riêng trong phần Đánh giá giáo viên trước đây.

### Theo dõi 48 tuần

1. Vào **Theo dõi 48 tuần**, chọn lớp và học viên.
2. Lần đầu, hệ thống đề xuất tuần có kết quả đầu tiên; nếu chưa có kết quả thì dùng tuần hiện tại.
3. Chọn ngày bắt đầu → **Xem khoảng này**. Ngày được đưa về thứ Hai của tuần đó.
4. Bấm **Lưu mốc cho học viên** để lần mở sau, kể cả trên thiết bị khác, dùng cùng mốc.
5. Mỗi dòng là một tuần từ thứ Hai đến Chủ nhật. Có nhãn Good/Average/Redflag nếu đã kiểm tra; tuần đã qua chưa có kết quả và tuần chưa đến được phân biệt.
6. Mở tuần để xem các lần kiểm tra, tiêu chí và nhận xét. Bấm **Kiểm tra học viên** để thêm hoặc **Cập nhật kết quả** để sửa bản ghi đã có. Kiểm tra ngày đánh giá trên phiếu trước khi lưu, nhất là khi nhập bù cho tuần cũ.
7. Nếu cùng tuần có nhiều lần kiểm tra, tất cả được giữ lại; nhãn tuần dùng lần có ngày mới nhất. Không tự ghi đè lần kiểm tra trước.
8. Dùng **48 tuần trước / 48 tuần tiếp** để xem các khoảng khác. Chỉ khi bấm **Lưu mốc cho học viên** thì mốc dùng chung mới thay đổi.

Kết quả lấy trực tiếp từ D1 theo học viên và khoảng ngày, không bị giới hạn bởi danh sách 300 lượt gần nhất ở trang tổng quan. **48 tuần là khoảng hiển thị, không phải thời hạn xóa dữ liệu.** Đổi lớp hay đổi mốc theo dõi không xóa lịch sử; thao tác xóa học viên vẫn xóa dữ liệu liên quan như chức năng hiện tại.

### Quyền và đăng nhập

Admin, Academic Manager và Academic Leader đều được dùng Observation và Theo dõi 48 tuần. Riêng quản lý tài khoản vẫn chỉ dành cho Admin. Phiên đăng nhập vẫn là 30 ngày, hoặc kết thúc khi đăng xuất/hết hiệu lực.

## Nếu gặp lỗi

- **Database ID toàn số 0 / database not found:** sửa `database_id` trong `wrangler.jsonc` về ID thật của D1 hiện tại, không tạo D1 mới để thay thế dữ liệu cũ.
- **`no such table: teacher_observations` hoặc `student_tracking`:** kiểm tra Deploy command là `npm run deploy`; xem log migration `0005`. Có thể chạy `npm run db:migrate:remote` trong Terminal tại repository đúng cấu hình rồi deploy lại.
- **`table already exists` ở migration cũ:** giữ nguyên dữ liệu và gửi log để kiểm tra lịch sử migration; không DROP TABLE, không chạy lại file khởi tạo thủ công.
- **Không thấy tab mới:** xác nhận lần deploy mới thành công, đúng commit và đúng Worker, rồi tải lại trang bằng Ctrl+F5.

## Kiểm thử bản cập nhật

Các bài kiểm thử tự động nằm trong `tests/`, chạy bằng:

```bash
node --experimental-strip-types --test tests/*.test.mjs
npm run lint
npx tsc --noEmit
npm run build
```

Kiểm thử API dùng SQLite độc lập với bộ chuyển đổi D1 tại máy kiểm tra; không kết nối hoặc ghi vào D1 thật. Cần kiểm tra lại một phiếu Observation và một kết quả học viên sau khi bạn deploy lên tài khoản Cloudflare của mình.

Kết quả kiểm tra ngày 18/09: 14 bài kiểm thử tự động đạt; ESLint, TypeScript và production build đạt; cả 6 migration chạy thành công trên D1 local mới; Wrangler deploy dry-run đạt. Chưa kiểm tra giao diện bằng trình duyệt hoặc triển khai lên Worker thật trong môi trường này.
