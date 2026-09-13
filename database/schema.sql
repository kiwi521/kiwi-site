CREATE TABLE IF NOT EXISTS photo_notes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  image MEDIUMTEXT NULL,
  image_thumbnail MEDIUMTEXT NULL,
  image_key VARCHAR(512) NULL,
  image_thumbnail_key VARCHAR(512) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_photo_notes_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
