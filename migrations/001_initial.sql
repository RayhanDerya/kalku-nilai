CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(10) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    default_sks INTEGER NOT NULL DEFAULT 3
);

CREATE TABLE IF NOT EXISTS course_components (
    id BIGSERIAL PRIMARY KEY,
    course_id VARCHAR(10) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    component_id VARCHAR(20) NOT NULL,
    label VARCHAR(255) NOT NULL,
    weight NUMERIC(5,2) NOT NULL,
    UNIQUE (course_id, component_id)
);

INSERT INTO courses (id, name, default_sks) VALUES
('bd', '1. Basis Data', 3),
('pkpl', '2. Pengantar Keamanan Perangkat Lunak', 3),
('si', '3. Sistem Interaksi', 3),
('mpti', '4. Manajemen Proyek TI', 3),
('msi', '5. Manajemen Sistem Informasi', 3),
('sipa', '6. Sistem Info. Perusahaan & Akuntansi', 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO course_components (course_id, component_id, label, weight) VALUES
-- Data Basis Data ('bd')
('bd', 'ti', 'Tugas Individu (Rata-rata 4x)', 16.00),
('bd', 'lab', 'Latihan Lab (Rata-rata 3x)', 6.00),
('bd', 'tk13', 'Tugas Kelompok 1-3 (Rata-rata)', 12.00),
('bd', 'tk4', 'Tugas Kelompok 4', 6.00),
('bd', 'quiz', 'Quiz (Rata-rata 2x)', 10.00),
('bd', 'uts', 'Ujian Tengah Semester (UTS)', 25.00),
('bd', 'uas', 'Ujian Akhir Semester (UAS)', 25.00),

-- Data Pengantar Keamanan Perangkat Lunak ('pkpl')
('pkpl', 'gp', 'Group Project (Rata-rata 9x)', 36.00),
('pkpl', 'quiz', 'Weekly Individual Quiz', 10.00),
('pkpl', 'hadir', 'Kehadiran', 4.00),
('pkpl', 'uts', 'Midterm (UTS)', 25.00),
('pkpl', 'uas', 'Final (UAS)', 25.00),

-- Data Sistem Interaksi ('si')
('si', 'lk', 'Lembar Kerja (LK - 11 Dokumen)', 20.00),
('si', 'proyek', 'Proyek Kelompok (Template & Presentasi)', 30.00),
('si', 'kontribusi', 'Kontribusi Kelas', 10.00),
('si', 'hadir', 'Kehadiran di Sesi Sinkronus', 5.00),
('si', 'esai', 'Tugas Esai', 5.00),
('si', 'uts', 'Ujian Tengah Semester', 20.00),
('si', 'kuis', 'Kuis', 10.00),

-- Data Manajemen Proyek TI ('mpti')
('mpti', 'tk_plan', 'Tugas Kelompok Project Plan', 15.00),
('mpti', 'ti1', 'Tugas Individu 1', 9.00),
('mpti', 'ti2', 'Tugas Individu 2', 10.00),
('mpti', 'kuis1', 'KUIS 1', 5.00),
('mpti', 'kuis2', 'KUIS 2', 5.00),
('mpti', 'uts', 'UTS', 22.00),
('mpti', 'uas', 'UAS', 20.00),
('mpti', 'posttest', 'Post-Test Evaluation', 6.00),
('mpti', 'partisipasi', 'Partisipasi dalam kelas', 8.00),

-- Data Manajemen Sistem Informasi ('msi')
('msi', 'ti1', 'Tugas Individu 1', 10.00),
('msi', 'ti2', 'Tugas Individu 2', 10.00),
('msi', 'tk', 'Tugas Kelompok', 20.00),
('msi', 'kuis1', 'Kuis 1', 5.00),
('msi', 'kuis2', 'Kuis 2', 5.00),
('msi', 'quizizz', 'Quizizz', 5.00),
('msi', 'diskusi', 'Diskusi Kelas', 10.00),
('msi', 'uts', 'UTS', 17.50),
('msi', 'uas', 'UAS', 17.50),

-- Data Sistem Info. Perusahaan & Akuntansi ('sipa')
('sipa', 'ti', 'Tugas Individu', 7.00),
('sipa', 'tk_erp', 'Tugas Kelompok: ERP Implementation', 10.00),
('sipa', 'ti_lab', 'Tugas Individu: Lab Odoo', 8.00),
('sipa', 'uts', 'UTS', 30.00),
('sipa', 'uas', 'UAS', 30.00),
('sipa', 'partisipasi', 'Partisipasi', 7.50),
('sipa', 'pr', 'PR Individu', 7.50)
ON CONFLICT (course_id, component_id) DO NOTHING;