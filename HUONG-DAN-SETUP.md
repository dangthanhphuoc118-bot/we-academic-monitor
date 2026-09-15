# Hướng dẫn triển khai WE Academic Monitor

Quy trình: **File mã nguồn → GitHub → Cloudflare Workers Builds → Worker → D1**.

## 1. Giải nén và đưa mã nguồn lên GitHub

### Cách đơn giản bằng trình duyệt

1. Đăng nhập GitHub.
2. Chọn **New repository**.
3. Đặt tên repository là `we-academic-monitor`.
4. Chọn **Private** để bảo vệ mã nguồn.
5. Không tạo thêm README hoặc `.gitignore` vì bộ source đã có sẵn.
6. Tạo repository.
7. Chọn **Add file → Upload files**.
8. Giải nén file ZIP, kéo toàn bộ nội dung bên trong thư mục vào GitHub.
9. Chọn **Commit changes**.

Không tải nguyên file ZIP vào repository. GitHub cần nhìn thấy trực tiếp `package.json`, `wrangler.jsonc`, thư mục `app/`, `db/` và `drizzle/` ở thư mục gốc.

### Cách dùng Git trên máy tính

```bash
git init
git add .
git commit -m "Initial WE Academic Monitor"
git branch -M main
git remote add origin https://github.com/TEN-TAI-KHOAN/we-academic-monitor.git
git push -u origin main
```

## 2. Tạo cơ sở dữ liệu D1

1. Đăng nhập Cloudflare Dashboard.
2. Vào **Storage & Databases → D1 SQL Database**.
3. Chọn **Create database**.
4. Đặt tên chính xác: `we-academic-monitor-db`.
5. Sau khi tạo xong, sao chép **Database ID**.
6. Mở file `wrangler.jsonc` trên GitHub.
7. Tìm dòng:

```jsonc
"database_id": "00000000-0000-4000-8000-000000000000"
```

8. Thay chuỗi số 0 bằng Database ID vừa sao chép rồi commit thay đổi.

Giữ nguyên hai giá trị sau:

```jsonc
"binding": "DB",
"database_name": "we-academic-monitor-db"
```

## 3. Khởi tạo các bảng trong D1

Thực hiện bước này trên máy tính trước lần deploy đầu tiên:

```bash
npm install
npx wrangler login
npm run db:migrate:remote
```

Khi Wrangler hỏi xác nhận, chọn `Yes`.

Kiểm tra các bảng:

```bash
npm run db:tables:remote
```

Kết quả phải có các bảng chính:

- `teachers`
- `classes`
- `students`
- `criteria`
- `student_assessments`
- `student_assessment_items`
- `teacher_reviews`
- `teacher_review_items`
- `curriculum_overrides`
- `learning_checks`
- `level_options`
- `student_feedback_options`
- `auth_users`
- `auth_sessions`
- `auth_login_attempts`

D1 có thể hiển thị thêm bảng quản lý migration; đây là bình thường.

## 4. Kết nối GitHub với Cloudflare

1. Trong Cloudflare, vào **Workers & Pages**.
2. Chọn **Create application**.
3. Chọn **Import a repository**.
4. Kết nối tài khoản GitHub nếu Cloudflare yêu cầu.
5. Chọn repository `we-academic-monitor`.
6. Đặt tên Worker chính xác là `we-academic-monitor`. Tên này phải trùng trường `name` trong `wrangler.jsonc`.
7. Production branch: `main`.
8. Root directory: `/` hoặc để trống.
9. Build command:

```text
npm run build
```

10. Deploy command:

```text
npm run deploy
```

11. Nếu có mục phiên bản Node.js, dùng Node.js 22.13 trở lên. Node.js 24 cũng phù hợp.
12. Chọn **Save and Deploy**.

`npm run deploy` sẽ kiểm tra và áp dụng các migration D1 chưa chạy, sau đó mới triển khai Worker.

Khi thành công, Cloudflare cung cấp địa chỉ dạng:

```text
https://we-academic-monitor.TEN-SUBDOMAIN.workers.dev
```

## 5. Tạo tài khoản Admin ban đầu

Sau khi deploy thành công:

1. Mở **Workers & Pages → we-academic-monitor → Settings**.
2. Vào **Variables and Secrets**.
3. Thêm biến `BOOTSTRAP_ADMIN_EMAIL` với email Admin của bạn.
4. Thêm secret `BOOTSTRAP_ADMIN_PIN` với PIN gồm 4–8 chữ số. Nên dùng 6 chữ số khó đoán.
5. Lưu thay đổi và mở lại địa chỉ `workers.dev`.
6. Đăng nhập bằng email và PIN vừa cấu hình.
7. Vào **Tài khoản** để đổi tên Admin, đổi PIN và tạo tài khoản Academic Manager hoặc Academic Leader.

Sau khi đăng nhập và tạo Admin thành công, có thể xóa hai biến bootstrap khỏi Cloudflare. Tài khoản đã được lưu trong D1 và không bị mất khi xóa biến.

Không ghi PIN thật vào `wrangler.jsonc`, GitHub, README hoặc ảnh chụp màn hình.

### Phân quyền mặc định

| Vai trò | Quyền sử dụng |
| --- | --- |
| Admin | Toàn bộ website, bao gồm quản lý tài khoản |
| Academic Manager | Quản lý học vụ, kiểm tra học viên, đánh giá giáo viên và xem báo cáo |
| Academic Leader | Quản lý học vụ, kiểm tra học viên, đánh giá giáo viên và xem báo cáo |

PIN được băm trước khi lưu. Sau 5 lần nhập sai từ cùng email và địa chỉ truy cập, đăng nhập sẽ bị khóa tạm thời 15 phút.

## 6. Kiểm tra sau khi triển khai

1. Mở địa chỉ `workers.dev`.
2. Đăng nhập bằng tài khoản Admin vừa tạo.
3. Vào **Tài khoản**, tạo thử một Academic Manager và một Academic Leader.
4. Vào **Giáo viên** và thêm một giáo viên thử.
5. Vào **Lớp học**, tạo lớp và chọn đúng chương trình như `Super Kids 1`.
6. Vào **Học viên**, thêm học viên vào lớp.
7. Đăng nhập bằng Academic Leader, mở **Kiểm tra học viên**, chọn Unit/Day và lưu một đánh giá thử.
8. Kiểm tra cả Academic Manager và Academic Leader đều mở được phần quản lý học vụ, đánh giá giáo viên và báo cáo.

## 7. Bảo vệ bổ sung bằng Cloudflare Access

Website `workers.dev` có thể công khai nếu chưa có lớp bảo vệ. Không nhập dữ liệu học viên thật trước khi hoàn thành phần này.

1. Vào **Cloudflare Zero Trust**.
2. Chọn **Access → Applications → Add an application**.
3. Chọn **Self-hosted**.
4. Nhập domain Worker hoặc custom domain của website.
5. Tạo policy **Allow** chỉ cho email của quản lý và giáo viên.
6. Kiểm tra bằng cửa sổ ẩn danh: người ngoài danh sách phải bị chặn.

Cloudflare Access kiểm soát thêm một lớp bên ngoài. Bên trong ứng dụng vẫn có email, PIN và ba vai trò riêng.

## 8. Cập nhật website về sau

### Cập nhật phiên bản chỉnh sửa theo file PDF ngày 15/09/2026

1. Sao lưu D1 trước khi cập nhật:

```bash
npx wrangler d1 export we-academic-monitor-db --remote --output=backup-before-update.sql
```

2. Giải nén bộ source mới và chép các file vào repository GitHub hiện tại.
3. Giữ nguyên **Database ID đang hoạt động** trong `wrangler.jsonc`. Nếu file mới đang có chuỗi số 0, thay lại bằng Database ID của D1 hiện tại trước khi commit.
4. Commit lên nhánh `main`.
5. Trong Cloudflare, dùng đúng:

```text
Build command: npm run build
Deploy command: npm run deploy
```

Không nhập `npm wrangler deploy`; đây không phải cú pháp npm hợp lệ.

Lệnh `npm run deploy` sẽ tự chạy các migration chưa áp dụng. Bản đăng nhập mới chạy `0003_dazzling_susan_delgado.sql`; migration này chỉ thêm ba bảng đăng nhập và không xóa danh sách học viên, lớp, giáo viên hay lịch sử hiện có.

6. Sau khi deploy, cấu hình Admin ban đầu theo mục 5 rồi kiểm tra lần lượt: **Tài khoản → Khung chương trình → Mẫu nhận xét → Kiểm tra học viên → Báo cáo**.

### Quy trình cập nhật thông thường

Mỗi khi sửa code:

```bash
git add .
git commit -m "Mô tả thay đổi"
git push
```

Cloudflare Workers Builds sẽ tự build và deploy lại khi branch `main` có commit mới.

Nếu thay đổi cấu trúc database:

1. Sửa `db/schema.ts`.
2. Chạy `npm run db:generate`.
3. Commit file migration mới trong `drizzle/`.
4. Không sửa hoặc chạy lại migration cũ đã áp dụng.
5. Push lên GitHub; lệnh deploy sẽ chỉ áp dụng migration mới.

## 9. Sao lưu dữ liệu trước khi cập nhật lớn

Chạy tại thư mục dự án:

```bash
npx wrangler d1 export we-academic-monitor-db --remote --output=backup-before-update.sql
```

Lưu file `backup-before-update.sql` ở nơi an toàn và không commit file chứa dữ liệu học viên lên GitHub.

Cloudflare D1 có Time Travel để phục hồi theo thời điểm trong thời hạn Cloudflare hỗ trợ, nhưng vẫn nên xuất file SQL trước thay đổi lớn.

## 10. Chuyển dữ liệu từ một D1 cũ

Mã nguồn và dữ liệu là hai phần riêng biệt. Nếu muốn dùng lại dữ liệu từ một D1 cũ:

1. Xuất D1 cũ:

```bash
npx wrangler d1 export TEN-DATABASE-CU --remote --output=old-database.sql
```

2. Đảm bảo D1 mới chưa có dữ liệu trùng.
3. Nhập vào D1 mới:

```bash
npx wrangler d1 execute we-academic-monitor-db --remote --file=old-database.sql
```

Không nhập file dump vào D1 đang có dữ liệu thật nếu chưa có bản sao lưu.

Dữ liệu của website ChatGPT Sites hiện tại không tự động xuất hiện trong Cloudflare D1 mới. Nếu chưa có dữ liệu thật, chỉ cần dùng D1 mới và nhập dữ liệu từ đầu.

## 11. Xử lý lỗi thường gặp

### Lỗi `no such table`

Migration chưa được áp dụng vào D1 đang bind:

```bash
npm run db:migrate:remote
```

### Lỗi `D1 binding DB is unavailable`

- Kiểm tra binding trong `wrangler.jsonc` phải là `DB`.
- Kiểm tra `database_id` có đúng D1 đang dùng hay không.
- Build và deploy lại sau khi sửa.

### Không thấy `dist/server/index.js`

Build chưa hoàn tất hoặc Build command bị đặt sai. Đặt lại:

```text
npm run build
```

Sau đó deploy bằng:

```text
npm run deploy
```

### Cloudflare báo tên Worker không trùng

Tên project trong Dashboard phải là `we-academic-monitor`, giống trường `name` trong `wrangler.jsonc`.

### Website mở được nhưng dữ liệu cũ biến mất

Thường là Worker đang bind nhầm một D1 mới. Không tạo thêm database. So sánh Database ID trong `wrangler.jsonc` với D1 chứa dữ liệu cũ rồi deploy lại.

### Website báo chưa có tài khoản Admin ban đầu

- Kiểm tra `BOOTSTRAP_ADMIN_EMAIL` là email hợp lệ.
- Kiểm tra `BOOTSTRAP_ADMIN_PIN` là PIN gồm 4–8 chữ số.
- Hai giá trị phải được thêm trong **Worker Settings → Variables and Secrets**, không nhập vào D1 Query Console.
- Tải lại website sau khi lưu biến.

### Nhập sai PIN quá nhiều lần

Hệ thống khóa tổ hợp email và địa chỉ truy cập trong 15 phút sau 5 lần sai. Chờ đủ thời gian rồi thử lại hoặc nhờ Admin đặt PIN mới trong trang **Tài khoản**.

### Build dùng sai thư mục

Cloudflare phải thấy `package.json` ở Root directory. Nếu repository chỉ chứa một thư mục con, đặt Root directory thành tên thư mục đó hoặc đưa toàn bộ nội dung dự án ra root repository.
