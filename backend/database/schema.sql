-- BDMS Maintenance Requests & Block Schedules Schema for PostgreSQL
-- Target Database: BDMS

CREATE TABLE IF NOT EXISTS maintenance_requests (
    need_id             SERIAL PRIMARY KEY,
    department          VARCHAR(10) NOT NULL,
    block_start         VARCHAR(100) NOT NULL,
    block_end           VARCHAR(100) NOT NULL,
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

-- Block Schedules table
CREATE TABLE IF NOT EXISTS block_schedules (
    block_id        VARCHAR(20) PRIMARY KEY,
    block_date      DATE NOT NULL,
    section_start   VARCHAR(100) NOT NULL,
    section_end     VARCHAR(100) NOT NULL,
    line            VARCHAR(50) NOT NULL,
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    duration_min    INTEGER NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING_APPROVAL',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_block_status CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED')),
    CONSTRAINT chk_block_time CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_block_schedules_date ON block_schedules(block_date);
CREATE INDEX IF NOT EXISTS idx_block_schedules_status ON block_schedules(status);

-- Block Tasks junction table connecting maintenance requests with scheduled blocks
CREATE TABLE IF NOT EXISTS block_tasks (
    block_task_id   SERIAL PRIMARY KEY,
    block_id        VARCHAR(20) NOT NULL REFERENCES block_schedules(block_id) ON DELETE CASCADE,
    need_id         INTEGER NOT NULL REFERENCES maintenance_requests(need_id) ON DELETE RESTRICT,
    CONSTRAINT uq_block_task UNIQUE (block_id, need_id)
);

CREATE INDEX IF NOT EXISTS idx_block_tasks_block ON block_tasks(block_id);
CREATE INDEX IF NOT EXISTS idx_block_tasks_need ON block_tasks(need_id);
