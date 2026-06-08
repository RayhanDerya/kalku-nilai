CREATE TABLE IF NOT EXISTS course_score_entries (
    course_id VARCHAR(10) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    component_id VARCHAR(20) NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (course_id, component_id)
);

CREATE TABLE IF NOT EXISTS course_sks_entries (
    course_id VARCHAR(10) PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
    sks INTEGER NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);