# Thay đổi phiên bản ngày 19/09/2026

- Chuyển Freestyle từ từng Unit thành một ngân hàng chung cho toàn bộ level Starters, Movers hoặc Flyers.
- Nạp 46 câu Starters từ PDF mới, chia thành 7 nhóm chủ đề và hai cột YES/NO, WH QUESTIONS.
- Để trống ngân hàng Movers và Flyers để người dùng tự tạo nhóm, thêm, sửa hoặc xóa câu trực tiếp trong Khung chương trình.
- Phiếu kiểm tra lấy ngẫu nhiên đúng 5 câu từ ngân hàng chung của level; không cho tạo lượt kiểm tra mới nếu level chưa đủ 5 câu.
- Giữ nguyên 5 câu đã nằm trong `evaluation_json` của các kết quả cũ, kể cả khi ngân hàng chung được sửa hoặc để trống sau này.
- Migration `0008_closed_jack_murdock.sql` tạo bảng `freestyle_banks` và xóa có chủ đích toàn bộ nội dung Freestyle cũ theo Unit của Starters/Movers/Flyers trong D1. Các dữ liệu học vụ và lịch sử kết quả khác không bị migration xóa.
- 17/17 kiểm thử API/migration/giao diện đạt; TypeScript, ESLint và build production đạt.

---

# Thay đổi phiên bản ngày 18/09/2026

- Cập nhật toàn bộ 12 Unit Flyers từ PDF mới; Vocabulary chia 5 nhóm ADJ, NOUN, VERB, ADV, PREPOSITION như Movers.
- Thêm nút nạp Vocabulary Flyers mới trong trình chỉnh sửa Unit, giữ các trường tự chỉnh khác.
- Bỏ điểm tổng dạng `/5` và thanh tiến độ tổng trên các phiếu/báo cáo; giữ tiêu chí chi tiết và phân loại kết quả.
- Phiếu giáo viên chuyển sang Classroom Observation theo PDF: Date, Time, Class, Teacher/TA; 4 tiêu chí Academic và 3 tiêu chí Attitude, mỗi tiêu chí có checkbox và Note.
- Observation được lưu trong D1, có tìm kiếm, xem chi tiết, cập nhật, xóa và xuất hiện trong Báo cáo giáo viên. Không quy đổi ô chọn thành điểm.
- Đưa ngân hàng Freestyle vào từng Unit Starters, Movers và Flyers trong Khung chương trình; cho phép sửa từng câu và lấy ngẫu nhiên đúng 5 câu từ Unit đang kiểm tra.
- Cho phép một lớp phân công nhiều giáo viên; thẻ lớp hiển thị toàn bộ giáo viên và thống kê số lớp của giáo viên dùng bảng phân công mới.
- Tab Theo dõi 48 tuần dùng cửa sổ cuốn chiếu gồm tuần hiện tại và 47 tuần trước; tự xóa kết quả của tuần thứ 49 trong quá khứ, hỗ trợ kiểm tra bổ sung và cập nhật từ lịch sử.
- Endpoint lịch sử đọc đủ 48 tuần theo từng học viên, gồm cả đánh giá cũ và không áp giới hạn 300 bản ghi của tổng quan.
- Migration `0005_strong_violations.sql` tạo hai bảng, `0006_awesome_turbo.sql` thêm ngân hàng Freestyle và `0007_unique_polaris.sql` tạo bảng phân công nhiều giáo viên, tự chuyển phân công cũ. Migration không xóa dữ liệu cũ. Việc dọn kết quả ngoài 48 tuần chạy sau khi người dùng đăng nhập tải hệ thống. Session vẫn 30 ngày, Manager và Leader vẫn có quyền học vụ ngang nhau.
- Chi tiết triển khai: `HUONG-DAN-CAP-NHAT-18-09-2026.md`.

---

# Thay đổi phiên bản ngày 17/09/2026

## Nội dung cập nhật mới

- Xóa nút **Bắt đầu kiểm tra** trên Tổng quan và tab **Kiểm tra học viên** khỏi thanh điều hướng.
- Tại **Lớp học**, mở danh sách học viên rồi bấm **Kiểm tra ngay** để mở phiếu trực tiếp.
- Lớp không còn trường chương trình/trình độ; trình độ được quản lý riêng trên từng học viên.
- Xóa toàn bộ Writing Reference. Baby Stars chỉ còn Spelling và Writing, không còn hai thẻ đúng/sai.
- Xóa mô tả ngưỡng Redflag/Average/Good dưới các ô chấm điểm.
- Thay toàn bộ 12 Unit Movers theo tài liệu mới và chia từ vựng thành 5 nhóm **ADJ, NOUN, VERB, ADV, PREPOSITION**.
- Thêm ngân hàng câu hỏi Freestyle cho Starters, Movers và Flyers; mỗi phiếu lấy ngẫu nhiên đúng 5 câu và có nút **Đổi 5 câu**.
- Năm câu đã dùng được lưu cùng kết quả để khi mở lại vẫn hiển thị đúng bộ câu cũ.
- Báo cáo hiển thị chi tiết **Evaluation Criteria**, hai biểu đồ so sánh lần trước/lần mới nhất và lịch sử kiểm tra.
- Có thể mở kết quả vừa lưu hoặc kết quả cũ để cập nhật đúng bản ghi, không tạo bản trùng.
- Bản này không thêm migration và không xóa dữ liệu hiện có.

## Kiểm tra kỹ thuật bản 17/09/2026

- ESLint đạt.
- TypeScript `tsc --noEmit` đạt.
- Build Vinext production đạt.
- Toàn bộ 5 migration D1 chạy thành công trên cơ sở dữ liệu local mới.
- Ngân hàng câu hỏi gồm 60 câu Starters, 71 câu Movers khả dụng từ phần scan nhìn thấy và 32 câu Flyers.

Gói `SAFE` không chứa `wrangler.jsonc`, do đó Database ID thật trong repository GitHub hiện tại không bị ghi đè khi chép bản cập nhật.

---

# Thay đổi phiên bản ngày 16/09/2026

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

## Kiểm tra kỹ thuật đã thực hiện

- ESLint đạt.
- Build Vinext đạt.
- Cloudflare Wrangler deploy dry run đạt.
- Năm migration D1 chạy thành công trên cơ sở dữ liệu kiểm thử mới.
- Dữ liệu mặc định sau migration gồm 20 chương trình hoặc trình độ và 8 mẫu nhận xét.
