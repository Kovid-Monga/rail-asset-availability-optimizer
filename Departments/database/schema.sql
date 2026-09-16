-- BDMS Maintenance Requests Schema for PostgreSQL
-- Target Database: BDMS

CREATE TABLE IF NOT EXISTS maintenance_requests (
    need_id             SERIAL PRIMARY KEY,
    department          VARCHAR(10) NOT NULL,
    block_section       VARCHAR(100) NOT NULL,
    line                VARCHAR(50),
    work_location       VARCHAR(100),
    reason_code         VARCHAR(20),
    reason_description  TEXT,
    asset_impact        VARCHAR(20),
    duration_min        INTEGER NOT NULL,
    due_date            DATE NOT NULL,
    status              VARCHAR(30) DEFAULT 'DRAFT',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_department CHECK (department IN ('TMS', 'TDMS', 'SMMS')),
    CONSTRAINT chk_asset_impact CHECK (asset_impact IN ('High', 'Medium', 'Low') OR asset_impact IS NULL),
    CONSTRAINT chk_status CHECK (status IN ('DRAFT', 'SUBMITTED')),
    CONSTRAINT chk_duration CHECK (duration_min > 0)
);

-- Index for fast department filtering and status checks
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_dept ON maintenance_requests(department);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON maintenance_requests(status);
