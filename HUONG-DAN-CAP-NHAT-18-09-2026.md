# Cập nhật WE Academic Monitor — 18/09/2026

Gói này dùng để cập nhật repository GitHub và Cloudflare Workers/D1 đang hoạt động. Bản cập nhật giữ các chức năng trước đó, đồng thời bổ sung ngân hàng Freestyle theo từng Unit và đổi lịch sử học viên thành cửa sổ cuốn chiếu 48 tuần.

## Nội dung của bản cập nhật

1. **Flyers:** 12 Unit có Vocabulary chia thành ADJ, NOUN, VERB, ADV và PREPOSITION, giống Movers.
2. **Freestyle trong Khung chương trình:** mỗi Unit Starters, Movers và Flyers hiển thị một ngân hàng câu hỏi riêng. Academic Manager/Leader có thể mở Unit, nhập mỗi câu trên một dòng và lưu; cần ít nhất 5 câu. Phiếu kiểm tra chọn ngẫu nhiên đúng 5 câu từ ngân hàng của Unit đang mở và có nút đổi 5 câu.
3. **Bỏ điểm tổng dạng /5:** không còn các số như `2/5`, `2.03/5` hoặc `3.25/5` trên giao diện. Các tiêu chí chi tiết và nhãn Good/Average/Redflag vẫn giữ nguyên.
4. **Class Observation:** đánh giá giáo viên/TA bằng 7 tiêu chí Academic/Attitude, ô chọn và ghi chú; không dùng thang điểm.
5. **Theo dõi cuốn chiếu 48 tuần:** luôn giữ tuần hiện tại và 47 tuần trước đó. Khi sang tuần mới, kết quả cũ hơn ngày bắt đầu của cửa sổ được xóa vĩnh viễn khỏi D1.

| Academic | Attitude |
| --- | --- |
| English Use | Phone Use |
| Classroom Control | Leaving Class |
| Student Engagement | Professional Behaviour |
| Learning in Progress | |

## Cảnh báo trước khi cập nhật

Việc xóa lịch sử quá hạn là chủ đích của bản này. Migration không xóa dữ liệu ngay, nhưng sau khi Worker mới được triển khai, lần đầu một người dùng đã đăng nhập tải dashboard hoặc tab **Theo dõi 48 tuần** sẽ bắt đầu dọn dữ liệu quá hạn.

Hệ thống xóa:

- Kết quả kiểm tra trong `learning_checks` có ngày trước cửa sổ 48 tuần.
- Đánh giá học viên kiểu cũ trong `student_assessments` có ngày trước cửa sổ; chi tiết liên quan được xóa theo quan hệ dữ liệu.
- Lịch kiểm tra đã hoàn thành trước cửa sổ.

Hệ thống không xóa học viên, lớp, tài khoản, Observation, đánh giá giáo viên, khung chương trình hoặc lịch kiểm tra cũ vẫn đang ở trạng thái chờ.

Ví dụ vào ngày 18/09/2026, tuần hiện tại là 14–20/09/2026. Cửa sổ giữ lại là **20/10/2025–20/09/2026**; kết quả trước 20/10/2025 bị xóa. Mốc này tự dịch thêm một tuần vào mỗi thứ Hai theo múi giờ Việt Nam.

## Bước 1 — Bắt buộc sao lưu D1

Tại thư mục repository trên máy tính, mở Terminal/PowerShell:

```bash
npx wrangler login
npx wrangler d1 export we-academic-monitor-db --remote --config wrangler.jsonc --output=../backup-before-2026-09-18.sql
```

Giữ file SQL ở máy riêng. Không nhập lệnh `npx` vào phần **Queries** của D1 Console vì ô đó chỉ nhận câu lệnh SQL.

Nếu lệnh export thất bại, dừng cập nhật và kiểm tra lại tài khoản Cloudflare, tên database và `database_id`. Không tiếp tục deploy trước khi có bản sao lưu nếu bạn cần giữ dữ liệu quá 48 tuần.

## Bước 2 — Cập nhật mã trên GitHub

1. Giải nén `WE-Academic-Monitor-Update-SAFE-2026-09-18.zip`.
2. Chép nội dung thư mục `WE-Academic-Monitor-Cloudflare` vào đúng thư mục gốc repository hiện tại, cùng nơi có `package.json`.
3. Chọn ghi đè file trùng tên, nhưng **giữ nguyên `wrangler.jsonc` đang có trên GitHub**. Gói SAFE không chứa file này để tránh thay Database ID thật.
4. D1 binding phải là `DB`, tên database là `we-academic-monitor-db`, và `migrations_dir` là `drizzle`.
5. Giữ toàn bộ migration cũ và thêm `0005_strong_violations.sql`, `0006_awesome_turbo.sql` cùng metadata mới. Không sửa/xóa migration đã chạy và không tạo database mới.

Nếu dùng Git:

```bash
git add .
git commit -m "Add per-unit Freestyle banks and rolling 48-week history"
git push
```

## Bước 3 — Build và deploy Cloudflare

Trong Workers Builds:

```text
Build command: npm run build
Deploy command: npm run deploy
```

`npm run deploy` áp dụng migration còn thiếu trước khi deploy Worker:

- `0005_strong_violations.sql` tạo bảng Observation và bảng mốc theo dõi cũ.
- `0006_awesome_turbo.sql` thêm cột `freestyle_questions` vào `curriculum_overrides`.

Hai migration đều chỉ bổ sung cấu trúc, không xóa dữ liệu. Bảng mốc theo dõi cũ được giữ để tương thích nhưng giao diện mới không còn cho đặt mốc thủ công.

Nếu deploy từ máy tính:

```bash
npm ci
npm run build
npm run deploy
```

## Bước 4 — Kiểm tra sau deploy

### Ngân hàng Freestyle

1. Mở **Khung chương trình → Starters/Movers/Flyers**.
2. Mở một Unit và kiểm tra mục **Freestyle question bank**.
3. Bấm sửa Unit, nhập mỗi câu trên một dòng; không nhập dòng trùng và cần ít nhất 5 câu.
4. Lưu, sau đó mở phiếu kiểm tra đúng Unit. Xác nhận phiếu hiện 5 câu lấy từ ngân hàng vừa lưu.
5. Bấm **Đổi 5 câu** để lấy mẫu khác. Kết quả đã lưu vẫn giữ nguyên 5 câu đã dùng lúc kiểm tra, kể cả khi ngân hàng Unit được sửa sau đó.

Unit từng được chỉnh sửa trước bản này sẽ tự dùng ngân hàng mặc định của chương trình cho đến khi bạn mở và lưu ngân hàng riêng của Unit. Nút **Khôi phục nội dung gốc** thay toàn bộ nội dung Unit, bao gồm cả ngân hàng Freestyle.

### Theo dõi 48 tuần

1. Mở **Theo dõi 48 tuần**, chọn lớp và học viên.
2. Phạm vi ngày được tính tự động; không còn ô đặt hoặc lưu mốc bắt đầu.
3. Tuần hiện tại nằm trên cùng, tiếp theo là 1 tuần trước đến 47 tuần trước.
4. Mở một tuần để xem tất cả lần kiểm tra, tiêu chí và nhận xét.
5. Dùng **Kiểm tra học viên** để nhập bù trong cửa sổ hoặc **Cập nhật kết quả** để sửa bản ghi hiện có.
6. Hệ thống không cho lưu ngày trước 48 tuần hoặc sau Chủ nhật của tuần hiện tại.

Nếu một tuần có nhiều lượt kiểm tra, tất cả lượt trong cửa sổ vẫn được giữ. Tab lấy dữ liệu trực tiếp từ D1 theo học viên nên không bị giới hạn bởi 300 dòng gần nhất của dashboard.

### Observation và quyền

Admin, Academic Manager và Academic Leader đều có thể quản lý học vụ, kiểm tra học viên, dùng Observation và xem báo cáo. Quản lý tài khoản chỉ dành cho Admin. Phiên đăng nhập kéo dài tối đa 30 ngày, hoặc kết thúc sớm khi đăng xuất, tài khoản bị khóa hay phiên hết hiệu lực.

## Nếu gặp lỗi

- **Database not found / ID toàn số 0:** thay `database_id` trong `wrangler.jsonc` bằng ID thật của D1 hiện tại. Không tạo D1 mới nếu muốn giữ dữ liệu.
- **`no such table: teacher_observations`:** kiểm tra log migration `0005` và Deploy command `npm run deploy`.
- **`no such column: freestyle_questions`:** kiểm tra migration `0006` đã được tải lên GitHub và được áp dụng.
- **`table already exists`:** không DROP TABLE và không chạy lại migration khởi tạo thủ công; giữ dữ liệu rồi kiểm tra bảng `d1_migrations`.
- **Không thấy thay đổi:** kiểm tra đúng commit/Worker, deploy thành công, rồi tải lại bằng Ctrl+F5.

## Kiểm thử bản cập nhật

```bash
node --import tsx --test tests/*.test.mjs
npx tsc --noEmit
npm run lint
npm run build
```

Kiểm thử API dùng SQLite độc lập, không kết nối hoặc ghi vào D1 thật. Bản này có 15 kiểm thử cho migration, quyền, Observation, Freestyle theo Unit và dọn lịch sử tuần thứ 49.
