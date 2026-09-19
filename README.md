# WE Academic Monitor — GitHub + Cloudflare

Website nội bộ để theo dõi học viên, lớp học, giáo viên, khung chương trình và báo cáo đánh giá. Bản này đã được chuẩn bị để triển khai độc lập bằng **GitHub + Cloudflare Workers + D1**.

## Chức năng chính

- Quản lý lớp, học viên và giáo viên.
- Một lớp có thể phân công nhiều giáo viên; số lớp của từng giáo viên được tính theo toàn bộ phân công.
- Khung chương trình Baby Stars, Super Kids 1–8, Starters, Movers và Flyers.
- Tự thêm, đổi tên, sắp xếp và tạm ẩn chương trình hoặc trình độ.
- Phiếu đánh giá thay đổi theo chương trình của học viên.
- Mở phiếu kiểm tra trực tiếp từ từng học viên trong danh sách lớp.
- Lọc lớp theo ngày học thực tế với múi giờ Việt Nam hoặc xem tất cả lớp; lớp không còn gắn cứng với một trình độ.
- Chỉnh sửa từng Unit/Day và khôi phục nội dung gốc.
- Khung Movers và Flyers hiển thị riêng 5 nhóm ADJ, NOUN, VERB, ADV và PREPOSITION.
- Mỗi level Starters, Movers và Flyers có một ngân hàng Freestyle chung cho toàn bộ Unit; có thể tự tạo nhóm, sửa từng câu và phiếu kiểm tra chọn ngẫu nhiên đúng 5 câu từ level của học viên.
- Starters có sẵn 46 câu theo 7 chủ đề từ tài liệu mới; Movers và Flyers để trống để nhập trực tiếp trong Khung chương trình.
- Tự quản lý mẫu nhận xét để giáo viên tick nhanh khi đánh giá.
- Đánh giá giáo viên theo Classroom Observation: 7 tiêu chí Academic/Attitude, ô chọn và ghi chú; lưu, xem, sửa/xóa từng phiếu.
- Tab Theo dõi 48 tuần: tự động giữ tuần hiện tại và 47 tuần trước; sang tuần mới sẽ xóa vĩnh viễn kết quả của tuần thứ 49 trong quá khứ.
- Không hiển thị điểm tổng dạng `/5`; giữ các tiêu chí chi tiết và nhãn Good/Average/Redflag.
- Báo cáo học viên theo ba vùng Good, Average và Redflag, hiển thị chi tiết Evaluation Criteria, biểu đồ so sánh và lịch sử kiểm tra.
- Cập nhật lại kết quả vừa lưu hoặc kết quả cũ trên đúng bản ghi, không tạo bản trùng.
- Quy tắc Good/Average/Redflag riêng cho Baby Stars, Super Kids và Starters/Movers/Flyers.
- Đăng nhập bằng email và mã PIN, có ba vai trò Admin, Academic Manager và Academic Leader.
- Admin tự tạo, chỉnh sửa, phân quyền, đổi PIN hoặc khóa tài khoản trên website.
- Academic Manager và Academic Leader có cùng quyền quản lý học vụ, kiểm tra học viên, đánh giá giáo viên và xem báo cáo.
- Người thực hiện được ghi nhận tự động từ tài khoản đăng nhập; phiếu không còn ô nhập tên giáo viên.

## Yêu cầu

- Tài khoản GitHub.
- Tài khoản Cloudflare đã kích hoạt Workers.
- Node.js 22.13 trở lên nếu chạy lệnh trên máy tính.
- Tên Worker: `we-academic-monitor`.
- Tên D1: `we-academic-monitor-db`.
- Binding D1 bắt buộc giữ là `DB`.

## Hướng dẫn nhanh

**Đang có website hoạt động?** Làm theo [hướng dẫn cập nhật ngày 18/09/2026](HUONG-DAN-CAP-NHAT-18-09-2026.md), giữ nguyên `wrangler.jsonc` và D1 đang dùng.

Toàn bộ hướng dẫn từng bước nằm trong file [HUONG-DAN-SETUP.md](HUONG-DAN-SETUP.md).

Các lệnh quan trọng:

```bash
npm install
npx wrangler login
npm run db:migrate:remote
npm run build
npm run deploy
```

## Lưu ý dữ liệu

- GitHub chỉ chứa mã nguồn, không chứa danh sách học viên hoặc kết quả đánh giá.
- Dữ liệu thật nằm trong Cloudflare D1.
- D1 mới sẽ trống. Dữ liệu trên website ChatGPT Sites hiện tại không tự động chuyển sang D1 mới.
- Không chỉnh sửa hoặc xóa các migration cũ trong thư mục `drizzle/` sau khi đã triển khai.
- Migration `0002_grey_sentinels.sql` chỉ bổ sung cấu hình và nhận xét; không xóa dữ liệu học viên hiện có.
- Migration `0003_dazzling_susan_delgado.sql` chỉ tạo các bảng đăng nhập; không sửa hoặc xóa dữ liệu học vụ hiện có.
- Migration `0004_rich_masked_marvel.sql` chỉ tạo bảng danh sách chờ kiểm tra; không sửa hoặc xóa dữ liệu học vụ hiện có.
- Migration `0005_strong_violations.sql` chỉ tạo bảng Observation và mốc theo dõi 48 tuần; giữ nguyên mọi dữ liệu cũ.
- Migration `0006_awesome_turbo.sql` chỉ thêm cột ngân hàng Freestyle theo Unit; giữ nguyên mọi dữ liệu cũ.
- Migration `0007_unique_polaris.sql` tạo bảng phân công nhiều giáo viên và tự chuyển giáo viên đang gắn với từng lớp; không làm mất phân công cũ.
- Migration `0008_closed_jack_murdock.sql` tạo ngân hàng Freestyle theo level và chủ động xóa nội dung Freestyle cũ theo từng Unit của Starters, Movers và Flyers. Migration không xóa 5 câu đã lưu trong lịch sử kết quả kiểm tra.
- Việc xóa dữ liệu học viên ngoài 48 tuần không nằm trong migration. Nó chạy khi người dùng đã đăng nhập tải dashboard hoặc tab Theo dõi 48 tuần. Vì vậy phải sao lưu D1 trước khi triển khai bản này nếu cần giữ lịch sử lâu hơn.
- Trước mỗi thay đổi lớn, xuất bản sao D1 theo hướng dẫn trong `HUONG-DAN-SETUP.md`.

## Bảo mật

Website yêu cầu email và PIN trước khi tải dữ liệu. PIN được băm trước khi lưu, phiên đăng nhập dùng cookie bảo mật trong 30 ngày và tài khoản bị chặn tạm thời sau nhiều lần nhập sai. Cloudflare Access vẫn có thể được bật như một lớp bảo vệ bổ sung.
