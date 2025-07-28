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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, 
    is_verified BOOLEAN DEFAULT FALSE,
    fcm_token TEXT
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
    transcript TEXT,                 					   -- Văn bản AI nghe được (Whisper)
    score_pronunciation FLOAT,                             -- Điểm phát âm
    score_fluency FLOAT,                                   -- Điểm lưu loát
    score_intonation FLOAT,                                -- Điểm ngữ điệu
    score_speed FLOAT,                                     -- Tốc độ nói (tuỳ chọn)
    score_overall FLOAT,                                   -- Tổng điểm trung bình
    comment TEXT,                                          -- Gợi ý chung từ AI (GPT)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    custom_text TEXT,  									-- Lưu nội dung người dùng tự tạo để đọc
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE CASCADE
);

-- hi tiết lỗi phát âm cho mỗi bài đọc (nếu dùng AI phân tích sâu)
CREATE TABLE record_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL,                                -- Bản ghi thuộc bài đọc nào
    sentence TEXT,                                         -- Câu gặp vấn đề
    error_type ENUM('pronunciation','intonation','fluency','speed') NOT NULL,
    message TEXT,                                          -- Gợi ý sửa lỗi cụ thể
    FOREIGN KEY (record_id) REFERENCES records(id) ON DELETE CASCADE
);

-- Bảng thống kê tổng thể người dùng
CREATE TABLE user_stats (
    user_id INT PRIMARY KEY,
    total_records INT DEFAULT 0,                           -- Tổng số bài đã luyện
    avg_score FLOAT DEFAULT 0,                             -- Điểm trung bình
    best_score FLOAT DEFAULT 0,                            -- Điểm cao nhất
    last_practice DATETIME,                                -- Lần luyện gần nhất
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Lịch sử điểm theo thời gian (để dựng biểu đồ tiến bộ)
CREATE TABLE score_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    score FLOAT NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE email_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    verification_code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL
);


CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,                                      -- Gửi cho người dùng cụ thể
    title VARCHAR(255) NOT NULL,                      -- Tiêu đề thông báo
    body TEXT NOT NULL,                               -- Nội dung thông báo
    reading_id INT,                                   -- Nếu là bài đọc có sẵn
    custom_text TEXT,                                 -- Nếu là bài gợi ý AI tạo, không lưu DB
    is_read BOOLEAN DEFAULT FALSE,                    -- Trạng thái đã đọc/chưa đọc
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,    -- Thời điểm gửi
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reading_id) REFERENCES readings(id) ON DELETE SET NULL,
    record_id INT
);

ALTER TABLE users ADD COLUMN last_suggestion_type INT DEFAULT 0; -- xoay vòng tiêu chí 0-4 

CREATE TABLE chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role ENUM('user', 'assistant') NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


SELECT * FROM notifications WHERE id = 35;


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

SELECT * FROM records WHERE id = 17;
SELECT * FROM readings WHERE id = 2;
select * from topics
INSERT INTO topics (name, description) VALUES 
('Khám phá', 'Bài đọc liên quan đến du lịch và khám phá'),
('Thám hiểm', 'Thông tin khoa học về thám hiểm');

INSERT INTO readings (content, level, topic_id, is_community_post)
VALUES 
('I like going to the beach in the summer. The sun is hot and the sea is blue.', 'A1', 1, FALSE),
('Paris is a beautiful city in France. Many people visit the Eiffel Tower every year.', 'A1', 1, FALSE),
('Tourists often take pictures in front of famous buildings and try local food.', 'A1', 1, FALSE);

INSERT INTO readings (content, level, topic_id, is_community_post)
VALUES 
('The sun gives us light and heat. It is very important for plants and animals.', 'A1', 2, FALSE),
('A magnet can attract some metals. It is fun to play with magnets.', 'A1', 2, FALSE),
('Plants need sunlight and water to grow. They make food using a process called photosynthesis.', 'A1', 2, FALSE);

INSERT INTO readings (content, level, topic_id, is_community_post)
VALUES 
('Today is sunny with a little wind. People are enjoying the weather in the park.', 'A1', 3, FALSE),
('A new zoo has opened in the city. Children can see lions, elephants, and monkeys.', 'A1', 3, FALSE),
('The local football team won their game last night. Fans were very happy.', 'A1', 3, FALSE);

INSERT INTO readings (content, level, topic_id, is_community_post)
VALUES 
('We went to explore a small island. It had white sand and palm trees.', 'A1', 4, FALSE),
('In the jungle, we saw many birds and monkeys. It was fun to walk and take photos.', 'A1', 4, FALSE),
('My friends and I found a quiet lake. We had a picnic and watched the sunset.', 'A1', 4, FALSE);

INSERT INTO readings (content, level, topic_id, is_community_post)
VALUES 
('Some explorers travel to the North Pole. It is very cold and full of snow.', 'A1', 5, FALSE),
('Astronauts explore space to learn more about the stars and planets.', 'A1', 5, FALSE);
