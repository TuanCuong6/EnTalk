DROP DATABASE IF EXISTS entalk;
CREATE DATABASE entalk;
USE entalk;

-- 1. Bảng người dùng
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,                            -- Tên người dùng
    email VARCHAR(100) UNIQUE NOT NULL,                    -- Email đăng nhập
    password_hash VARCHAR(255) NOT NULL,                   -- Mật khẩu đã mã hoá
    level ENUM('A1','A2','B1','B2','C1','C2') DEFAULT 'A1', -- Trình độ tiếng Anh mặc định
    avatar_url TEXT,                                       -- Ảnh đại diện (tuỳ chọn)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng chủ đề bài đọc (du lịch, khoa học, tin tức,...)
CREATE TABLE topics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,                     -- Tên chủ đề
    description TEXT                                        -- Mô tả (nếu cần)
);

-- 3. Bảng bài đọc
CREATE TABLE readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,                                 -- Nội dung đoạn văn
    level ENUM('A1','A2','B1','B2','C1','C2'),              -- Trình độ
    created_by INT,                                        -- ID người tạo (null nếu của hệ thống)
    topic_id INT,                                          -- Chủ đề bài
    is_community_post BOOLEAN DEFAULT FALSE,               -- TRUE nếu do người dùng đăng
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE SET NULL
);

-- 4. Bảng ghi âm và kết quả
CREATE TABLE records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,                                  -- Người đọc
    reading_id INT NOT NULL,                               -- Bài đọc tương ứng
    audio_url TEXT NOT NULL,                               -- URL file ghi âm
    transcript TEXT,                 					   -- Văn bản AI nghe được (Whisper)
    score_pronunciation FLOAT,                             -- Điểm phát âm
    score_fluency FLOAT,                                   -- Điểm lưu loát
    score_intonation FLOAT,                                -- Điểm ngữ điệu
    score_speed FLOAT,                                     -- Tốc độ nói (tuỳ chọn)
    score_overall FLOAT,                                   -- Tổng điểm trung bình
    comment TEXT,                                          -- Gợi ý chung từ AI (GPT)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE CASCADE
);

-- 5. Chi tiết lỗi phát âm cho mỗi bài đọc (nếu dùng AI phân tích sâu)
CREATE TABLE record_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL,                                -- Bản ghi thuộc bài đọc nào
    sentence TEXT,                                         -- Câu gặp vấn đề
    error_type ENUM('pronunciation','intonation','fluency','speed') NOT NULL,
    message TEXT,                                          -- Gợi ý sửa lỗi cụ thể
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
);

-- 6. Bảng thống kê tổng thể người dùng
CREATE TABLE user_stats (
    user_id INT PRIMARY KEY,
    total_records INT DEFAULT 0,                           -- Tổng số bài đã luyện
    avg_score FLOAT DEFAULT 0,                             -- Điểm trung bình
    best_score FLOAT DEFAULT 0,                            -- Điểm cao nhất
    last_practice DATETIME,                                -- Lần luyện gần nhất
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Lịch sử điểm theo thời gian (để dựng biểu đồ tiến bộ)
CREATE TABLE score_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score FLOAT NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Like bài cộng đồng
CREATE TABLE reading_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reading_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, reading_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE CASCADE
);

-- 9. Bình luận bài đọc
CREATE TABLE reading_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    reading_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE CASCADE
);

-- 10. Huy hiệu người dùng
CREATE TABLE user_badges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    badge_name VARCHAR(100) NOT NULL,                      -- VD: "5 ngày liên tục"
    awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Bảng xếp hạng (có thể dùng view hoặc tạm tính)
CREATE VIEW leaderboard AS
SELECT 
    u.id AS user_id,
    u.name,
    COUNT(r.id) AS total_readings,
    AVG(r.score_overall) AS avg_score,
    MAX(r.score_overall) AS best_score
FROM users u
LEFT JOIN records r ON u.id = r.user_id
GROUP BY u.id
ORDER BY avg_score DESC
LIMIT 100;

-- 12. View thống kê bài cộng đồng
CREATE VIEW community_reading_stats AS
SELECT 
    r.id AS reading_id,
    COUNT(DISTINCT re.user_id) AS total_users,
    AVG(re.score_overall) AS avg_score,
    MAX(re.score_overall) AS max_score
FROM readings r
JOIN records re ON r.id = re.reading_id
WHERE r.is_community_post = TRUE
GROUP BY r.id;

-- 13. Bảng thông báo (notifications)
CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    receiver_id INT NOT NULL,                          -- Người nhận thông báo
    sender_id INT,                                     -- Người gây ra hành động (có thể null nếu hệ thống)
    reading_id INT,                                    -- Bài đọc liên quan (nếu có)
    comment_id INT,                                    -- Bình luận liên quan (nếu có)
    type ENUM('like','comment','record','system') NOT NULL, -- Loại thông báo
    message TEXT NOT NULL,                             -- Nội dung thông báo (ví dụ: "User A đã luyện bài của bạn")
    is_read BOOLEAN DEFAULT FALSE,                     -- Đã đọc hay chưa
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE SET NULL,
    FOREIGN KEY (comment_id) REFERENCES reading_comments(id) ON DELETE SET NULL
);
CREATE TABLE email_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    verification_code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL
);
ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

select * from users
select * from readings

-- Thêm chủ đề mẫu
INSERT INTO topics (name, description) VALUES 
('Du lịch', 'Bài đọc liên quan đến du lịch và khám phá'),
('Khoa học', 'Thông tin khoa học thường thức'),
('Tin tức', 'Bài đọc về các bản tin tiếng Anh ngắn');

-- Thêm bài đọc mẫu
INSERT INTO readings (content, level, topic_id, is_community_post) VALUES 
('London is the capital city of England. It has many famous landmarks such as Big Ben and the London Eye.', 'A1', 1, FALSE),
('Water is made of two elements: hydrogen and oxygen. It is essential for life on Earth.', 'A2', 2, FALSE),
('The stock market had a surprising increase yesterday, with major tech companies reporting record profits.', 'B1', 3, FALSE);

SELECT * FROM records WHERE user_id =2 ;

ALTER TABLE records DROP COLUMN audio_url;

INSERT INTO topics (name, description) VALUES 
('Khám phá', 'Bài đọc liên quan đến du lịch và khám phá'),
('Thám hiểm', 'Thông tin khoa học về thám hiểm');