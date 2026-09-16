USE alora_db;

-- 1. Insert Campus Departments
INSERT INTO departments (id, name, code, contact_email, head_name, sla_target_hours) VALUES
(1, 'Electrical Maintenance', 'DEPT_ELEC', 'electrical@campus.edu', 'Er. Rajesh Sharma', 12),
(2, 'Plumbing & Water Works', 'DEPT_PLUMB', 'plumbing@campus.edu', 'Er. Sunil Kulkarni', 8),
(3, 'IT & Network Operations', 'DEPT_IT', 'it-support@campus.edu', 'Dr. Meera Nambiar', 6),
(4, 'HVAC & Climate Control', 'DEPT_HVAC', 'hvac@campus.edu', 'Er. Vikram Patel', 16),
(5, 'Civil Works & Carpentry', 'DEPT_CIVIL', 'civil-works@campus.edu', 'Er. Anita Deshmukh', 36),
(6, 'Housekeeping & Sanitation', 'DEPT_CLEAN', 'sanitation@campus.edu', 'Mr. Ramesh Babu', 4)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Standard System Users
INSERT INTO users (id, full_name, email, password_hash, role, department_id, phone_number, campus_unit) VALUES
(1, 'Campus Admin', 'admin@alora.edu', 'admin123', 'ADMIN', NULL, '+91-9876543210', 'Main Admin Complex'),
(2, 'Aarav Patel (Student)', 'aarav.patel@alora.edu', 'user123', 'STUDENT', NULL, '+91-9876543211', 'Hostel Block A (Aryabhata)'),
(3, 'Prof. Sangeeta Sen', 'sangeeta.sen@alora.edu', 'user123', 'FACULTY', NULL, '+91-9876543212', 'Science & Technology Block'),
(4, 'Devendra Singh (Electrician)', 'elec.dev@alora.edu', 'tech123', 'TECHNICIAN', 1, '+91-9876543213', 'Electrical Workshop'),
(5, 'Manoj Kumar (Plumber)', 'plumb.manoj@alora.edu', 'tech123', 'TECHNICIAN', 2, '+91-9876543214', 'Water Plant Station'),
(6, 'Neha Reddy (SysAdmin)', 'it.neha@alora.edu', 'tech123', 'TECHNICIAN', 3, '+91-9876543215', 'Central Data Center'),
(7, 'Kiran More (Civil & Carpentry)', 'civil.kiran@alora.edu', 'tech123', 'TECHNICIAN', 5, '+91-9876543216', 'Estate Office')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 3. Insert Sample Complaints
INSERT INTO complaints (id, tracking_number, user_id, title, description, location_building, location_floor, location_room, category, department_id, severity, status, assigned_technician_id, estimated_resolution_hours, actual_resolution_hours, is_duplicate, created_at) VALUES
(1, 'ALR-2026-0001', 2, 'Main corridor lights flickering and sparking', 'The tube light near room 302 in Hostel Block A is flickering and producing a humming noise with occasional sparks.', 'Hostel Block A', '3rd Floor', 'Corridor near 302', 'Electrical', 1, 'HIGH', 'IN_PROGRESS', 4, 4.0, NULL, FALSE, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(2, 'ALR-2026-0002', 3, 'Water pipeline leaking under washbasin', 'Washbasin pipeline cracked in Faculty Restroom 2nd floor, water leaking continuously onto tile floor causing slip hazard.', 'Science & Technology Block', '2nd Floor', 'Faculty Restroom 204', 'Plumbing', 2, 'HIGH', 'ASSIGNED', 5, 3.5, NULL, FALSE, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(3, 'ALR-2026-0003', 2, 'Wi-Fi access point showing red error light', 'Hostel Block A 3rd floor Wi-Fi access point AP-09 is unreachable. Students unable to access research portal.', 'Hostel Block A', '3rd Floor', 'Wing B Study Area', 'IT & Network', 3, 'MEDIUM', 'PENDING', NULL, 2.5, NULL, FALSE, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(4, 'ALR-2026-0004', 3, 'Projector HDMI port damaged in Seminar Hall 1', 'Seminar Hall 1 projector is not accepting HDMI signal from podium laptop. Audio works but no display.', 'Academic Complex', 'Ground Floor', 'Seminar Hall 1', 'IT & Network', 3, 'MEDIUM', 'RESOLVED', 6, 2.0, 1.8, FALSE, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(5, 'ALR-2026-0005', 2, 'AC tripping circuit breaker in CS Lab 3', 'Turning on split AC unit 2 instantly trips the MCB circuit breaker in CS Lab 3.', 'Computer Science Block', '1st Floor', 'CS Lab 3', 'HVAC', 4, 'CRITICAL', 'ASSIGNED', 4, 5.0, NULL, FALSE, DATE_SUB(NOW(), INTERVAL 2 HOUR))
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. Sample Feedback
INSERT INTO feedback (complaint_id, user_id, rating, comments, satisfaction_level, is_used_for_training) VALUES
(4, 3, 5, 'Quick technician response. Replaced the faulty HDMI extender module within 2 hours.', 'VERY_SATISFIED', TRUE)
ON DUPLICATE KEY UPDATE rating=VALUES(rating);
