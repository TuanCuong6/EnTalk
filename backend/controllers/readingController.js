//backend//controllers/readingController.js
const db = require("../config/db");

exports.getAllReadings = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, content, level, created_at, 
              CONCAT('Bài đọc #', id) AS title
       FROM readings 
       WHERE is_community_post = FALSE 
       ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi khi tải danh sách bài đọc", error: err.message });
  }
};

// GET /api/reading/topic/:id
exports.getReadingsByTopic = async (req, res) => {
  const topicId = req.params.id;
  try {
    const [rows] = await require("../config/db").execute(
      "SELECT id, content, level, created_by, topic_id, is_community_post, created_at FROM readings WHERE topic_id = ?",
      [topicId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ Lỗi khi lấy bài đọc theo topic:", err);
    res
      .status(500)
      .json({ message: "Không thể lấy bài đọc", error: err.message });
  }
};

//api lấy bài đăng cộng đồng
exports.getCommunityReadings = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT r.id, r.content, r.level, r.created_at, r.created_by,
             u.name AS author_name, u.avatar_url,
             stats.total_users, stats.avg_score, stats.max_score
      FROM readings r
      JOIN users u ON r.created_by = u.id
      LEFT JOIN community_reading_stats stats ON r.id = stats.reading_id
      WHERE r.is_community_post = TRUE
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({
        message: "Lỗi khi tải danh sách bài cộng đồng",
        error: err.message,
      });
  }
};
