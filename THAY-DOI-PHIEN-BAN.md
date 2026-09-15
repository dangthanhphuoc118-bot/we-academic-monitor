# Thay đổi phiên bản ngày 15 09 2026

Phiên bản này cập nhật website theo bốn trang yêu cầu trong file PDF.

## Nội dung đã hoàn thành

- Xóa khối Quy trình kiểm tra khỏi trang Tổng quan.
- Xóa dòng Trung tâm Anh ngữ Học vụ trên thanh phía trên.
- Thêm khu vực quản lý chương trình và trình độ: thêm, đổi tên, sắp xếp, tạm ẩn và xóa khi chưa được sử dụng.
- Khi đổi tên trình độ, tên trong lớp và học viên đang sử dụng được cập nhật theo.
- Hiển thị riêng Vocabulary và Grammar hoặc Communication trong bảng khung chương trình.
- Giữ chức năng chỉnh sửa từng Unit hoặc Day và khôi phục nội dung gốc.
- Thêm trang Mẫu nhận xét để quản lý các nhận xét thường gặp.
- Giáo viên có thể tick nhiều mẫu nhận xét và nhập thêm Nhận xét hoặc lý do khác.
- Xóa phần Kế hoạch theo dõi khỏi phiếu kiểm tra học viên.
- Chuyển báo cáo học viên thành ba vùng Good, Average và Redflag.
- Mỗi học viên trong báo cáo hiển thị lớp, trình độ, nội dung kiểm tra, ngày, giáo viên, điểm và nhận xét hoặc lý do.
- Xóa ô nhập Giáo viên đánh giá khỏi phiếu kiểm tra; hệ thống tự ghi nhận tài khoản đang đăng nhập.
- Thêm đăng nhập bằng email và PIN cho Admin, Academic Manager và Academic Leader.
- Thêm trang Tài khoản để Admin tự tạo người dùng, phân quyền, đổi PIN và khóa/mở tài khoản.
- Academic Manager và Academic Leader có cùng quyền học vụ: quản lý dữ liệu, kiểm tra học viên, đánh giá giáo viên và xem báo cáo.
- PIN được băm bằng PBKDF2; phiên đăng nhập dùng cookie HttpOnly, Secure và SameSite; có giới hạn số lần nhập sai.

## Quy tắc chia vùng báo cáo

- Good: kết quả Tốt.
- Average: kết quả Đạt.
- Redflag: kết quả Cần theo dõi hoặc Cần hỗ trợ.

Mỗi học viên được xếp theo lần kiểm tra gần nhất. Học viên chưa từng được đánh giá được đếm riêng và chưa nằm trong ba vùng.

## Cập nhật cơ sở dữ liệu

Migration mới là `drizzle/0002_grey_sentinels.sql`. Migration chỉ bổ sung:

- Bảng `level_options`.
- Bảng `student_feedback_options`.
- Cột `feedback_json` trong bảng `learning_checks`.

Migration không xóa hoặc làm trống dữ liệu học viên, lớp, giáo viên và lịch sử đánh giá hiện có.

Migration đăng nhập là `drizzle/0003_dazzling_susan_delgado.sql`. Migration này chỉ tạo:

- Bảng `auth_users`.
- Bảng `auth_sessions`.
- Bảng `auth_login_attempts`.

Migration `0003` không thay đổi các bảng học viên, lớp, giáo viên hoặc lịch sử đánh giá.

## Kiểm tra kỹ thuật đã thực hiện

- ESLint đạt.
- Build Vinext đạt.
- Cloudflare Wrangler deploy dry run đạt.
- Ba migration D1 chạy thành công trên cơ sở dữ liệu kiểm thử mới.
- Dữ liệu mặc định sau migration gồm 20 chương trình hoặc trình độ và 8 mẫu nhận xét.
