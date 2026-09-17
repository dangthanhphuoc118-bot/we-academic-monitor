# Thay đổi phiên bản ngày 16 09 2026

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
- Phiên đăng nhập được kéo dài thành 30 ngày trên thiết bị, hoặc kết thúc ngay khi người dùng đăng xuất.
- Trang Lớp học có bộ lọc theo ngày/Thứ với múi giờ Việt Nam và bộ lọc tất cả lớp.
- Có thể mở từng lớp, tick nhiều học viên và đưa cả danh sách vào lịch kiểm tra của một ngày.
- Trang Kiểm tra học viên hiển thị danh sách chờ theo từng lớp; lưu xong tự chuyển sang học viên kế tiếp.
- Cập nhật khung Baby Stars và Super Kids 1–8 theo tài liệu mới; giữ nội dung Starters, Movers và Flyers từ file đính kèm.
- Tách Vocabulary và Grammar/Communication thành các khối riêng; từng mục từ vựng hiển thị riêng để không bị dồn vào một ô.
- Thêm thẻ đúng/sai `One or Many` và `Am – is – are` cho Baby Stars và Starters/Movers/Flyers.
- Báo cáo học viên ban đầu chỉ hiển thị ba thẻ Good, Average và Redflag; bấm vào thẻ mới mở danh sách chi tiết.
- Thẻ lớp mở trực tiếp danh sách học viên; mỗi học viên có nút **Kiểm tra ngay** để mở phiếu đánh giá ngay trên trang Lớp học, không cần chuyển tab.
- Việc đưa nhiều học viên vào danh sách chờ vẫn được giữ lại như một lựa chọn bổ sung và không tự chuyển trang sau khi xếp lịch.
- Xóa trường trình độ khỏi thẻ lớp và biểu mẫu tạo/sửa lớp. Trình độ chỉ còn được quản lý ở từng học viên và quyết định khung đánh giá tương ứng.
- Xóa các đoạn mô tả dài trong ba thẻ kết quả Good, Average và Redflag.
- Thêm hai biểu đồ tròn so sánh tỷ lệ Good, Average và Redflag giữa lần kiểm tra trước với lần kiểm tra mới nhất trên cùng nhóm học viên có ít nhất hai lần kiểm tra.

## Quy tắc chia vùng báo cáo

- Baby Stars: Spelling hoặc Writing dưới 50% thì Redflag. Nếu không có Redflag, lấy trung bình; trên 80% là Good, còn lại là Average.
- Super Kids: Vocabulary dưới 70% hoặc Communication dưới 60% thì Redflag. Nếu không có Redflag, lấy trung bình; trên 80% là Good, còn lại là Average.
- Starters, Movers, Flyers: Pattern hoặc Freestyle dưới 60% thì Redflag. Nếu không có Redflag, lấy trung bình; trên 80% là Good, còn lại là Average.
- Pronunciation, One or Many và Am – is – are được lưu để theo dõi chi tiết nhưng không kéo thay đổi trung bình của hai tiêu chí chính.
- Kết quả cũ `Tốt`, `Đạt`, `Cần theo dõi`, `Cần hỗ trợ` vẫn được đọc và đưa vào ba nhóm tương ứng, nên không cần sửa dữ liệu lịch sử.

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

Migration danh sách chờ là `drizzle/0004_rich_masked_marvel.sql`. Migration này chỉ tạo bảng:

- `student_check_queue`.

Migration `0004` không sửa, xóa hoặc làm trống dữ liệu hiện có.

Các chỉnh sửa theo file `Ở trang này(2).pdf` không cần migration mới. Cột trình độ lớp cũ được giữ nguyên trong cơ sở dữ liệu để tránh thay đổi phá vỡ dữ liệu, nhưng không còn hiển thị hoặc được sử dụng trong giao diện và nghiệp vụ mới.

## Kiểm tra kỹ thuật đã thực hiện

- ESLint đạt.
- Build Vinext đạt.
- Cloudflare Wrangler deploy dry run đạt.
- Năm migration D1 chạy thành công trên cơ sở dữ liệu kiểm thử mới.
- Dữ liệu mặc định sau migration gồm 20 chương trình hoặc trình độ và 8 mẫu nhận xét.
