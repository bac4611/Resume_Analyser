# Resume Analyser — Nền tảng tuyển dụng và quản lý CV

Resume Analyser kết nối ứng viên với nhà tuyển dụng, hỗ trợ quản lý hồ sơ, CV, tin tuyển dụng, đơn ứng tuyển và lịch phỏng vấn. Hệ thống có chức năng trích xuất dữ liệu từ CV PDF bằng Gemini để lưu thông tin kỹ năng, kinh nghiệm, học vấn và chứng chỉ dưới dạng có cấu trúc.

Tài liệu mô tả nghiệp vụ theo controller, service và model hiện có trong repository. Chức năng có API backend không đồng nghĩa đã có giao diện hoàn chỉnh trên cả web và mobile.

## 1. Công nghệ và cấu trúc dự án

| Thành phần | Công nghệ / Vai trò |
| --- | --- |
| Web frontend | React JS, Vite, React Router, Tailwind CSS |
| Mobile | React Native, Expo, TypeScript |
| Backend | Java 21, Spring Boot, Spring Security, Spring Data MongoDB |
| Database | MongoDB |
| Xác thực | JWT Bearer Token, mật khẩu mã hóa bằng BCrypt |
| Trích xuất CV | Gemini API |

```text
Resume_Analyser/
├── backend/       # REST API, nghiệp vụ, phân quyền và truy cập dữ liệu
├── frontend/      # Ứng dụng web React JS
├── mobile/        # Ứng dụng Expo React Native
├── docs/          # API contract và hướng dẫn kiểm tra API
├── mongo-init/    # Tài nguyên khởi tạo MongoDB
└── monitoring/    # Cấu hình giám sát
```

Backend tổ chức theo Controller–Service–Repository: controller nhận yêu cầu HTTP, service thực thi quy tắc nghiệp vụ, repository truy cập MongoDB.

## 2. Vai trò người dùng

| Vai trò | Phạm vi nghiệp vụ |
| --- | --- |
| Khách truy cập | Tìm kiếm và xem tin đã công khai, xem thông tin công ty, xem mẫu CV, đăng ký và đăng nhập. |
| Ứng viên (`candidate`) | Quản lý hồ sơ cá nhân và CV, nộp/rút đơn ứng tuyển, theo dõi đơn, xem thống kê và thông tin nghề nghiệp. |
| Nhà tuyển dụng (`recruiter` / HR) | Theo dõi trạng thái duyệt công ty; khi công ty được duyệt, quản lý tin tuyển dụng, hồ sơ ứng tuyển, lịch phỏng vấn, dashboard và cài đặt HR. |
| Quản trị viên (`admin`) | Xem và kiểm duyệt công ty, xem tin tuyển dụng và duyệt công khai tin đủ điều kiện. |

## 3. Đăng ký, đăng nhập và phân quyền

1. Người dùng đăng ký bằng email, mật khẩu và thông tin hồ sơ theo vai trò.
2. Hệ thống kiểm tra email trùng, mã hóa mật khẩu và tạo tài khoản cùng hồ sơ tương ứng.
3. Ứng viên được tạo hồ sơ ứng viên. Nhà tuyển dụng phải cung cấp thông tin công ty; hệ thống tạo công ty ở trạng thái chờ duyệt và liên kết hồ sơ HR với công ty đó.
4. Khi đăng nhập, hệ thống kiểm tra mật khẩu và trạng thái tài khoản rồi cấp JWT.
5. Client gửi `Authorization: Bearer <token>` khi gọi API cần xác thực. Backend kiểm tra danh tính, vai trò và quyền sở hữu tài nguyên.

Các API `/api/hr/**` yêu cầu tài khoản recruiter và công ty liên kết đã được duyệt (`passed`). HR có thể kiểm tra trạng thái công ty qua `/api/auth/company-status`. Các API `/api/admin/**` yêu cầu vai trò admin.

Đăng ký công khai phục vụ ứng viên và nhà tuyển dụng; không phải luồng cấp quyền quản trị viên.

## 4. Nghiệp vụ ứng viên

### 4.1. Quản lý hồ sơ cá nhân

- Xem và cập nhật hồ sơ của tài khoản đang đăng nhập.
- Lưu thông tin liên hệ và các dữ liệu hồ sơ được API hỗ trợ.
- Xem thống kê hồ sơ/ứng tuyển và thông tin nghề nghiệp qua các API dành cho ứng viên.

### 4.2. Quản lý CV

- Tải CV PDF lên hệ thống, dung lượng tối đa 5 MB; backend kiểm tra cả nội dung tệp PDF.
- Xem danh sách và thông tin CV thuộc tài khoản.
- Xem hoặc tải tệp CV qua API có kiểm tra quyền sở hữu.
- Tạo CV từ mẫu có sẵn bằng dữ liệu người dùng nhập.
- Yêu cầu phân tích CV PDF bằng Gemini.
- Xóa CV khi CV không được sử dụng trong đơn ứng tuyển hoặc báo cáo phân tích.

Luồng phân tích CV:

```text
Chọn CV thuộc tài khoản → Yêu cầu phân tích → processing
                                         ├── Thành công → completed → Lưu dữ liệu trích xuất
                                         └── Thất bại   → failed
```

Kết quả được chuẩn hóa vào các nhóm kỹ năng, kinh nghiệm, học vấn và chứng chỉ. Một CV đang `processing` không được nhận thêm yêu cầu phân tích đồng thời. Chức năng này cần cấu hình Gemini và tệp PDF hợp lệ.

### 4.3. Tìm kiếm và xem tin tuyển dụng

- Tìm tin theo từ khóa, chuyên môn và địa điểm, có phân trang.
- Xem nội dung tin đã công khai: mô tả, yêu cầu, địa điểm, mức lương, kinh nghiệm, quyền lợi và hạn ứng tuyển theo dữ liệu thực có.
- Xem thông tin công ty liên quan.

API công khai chỉ trả tin `published`. Việc nộp hồ sơ còn kiểm tra hạn ứng tuyển tại thời điểm gửi.

### 4.4. Ứng tuyển và theo dõi đơn

1. Ứng viên chọn tin tuyển dụng và một CV thuộc tài khoản của mình.
2. Có thể gửi kèm lời nhắn ứng tuyển (`coverNote`).
3. Backend kiểm tra tin đang `published`, còn hạn và ứng viên chưa có đơn cho tin đó.
4. Hệ thống tạo đơn ở trạng thái `applied`, lưu thời gian nộp và lịch sử trạng thái.
5. Ứng viên xem danh sách đơn, lọc và theo dõi trạng thái xử lý.
6. Chỉ được rút đơn khi đơn vẫn là `applied`; đơn đã rút có trạng thái `withdrawn`.

Kiểm tra trùng đơn hiện dựa trên cặp tin tuyển dụng–ứng viên, nên rút đơn không đồng nghĩa được nộp lại cho cùng tin.
