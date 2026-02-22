
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    original_image LONGTEXT NOT NULL,
    results_json JSON NOT NULL,
    created_at BIGINT NOT NULL
);
