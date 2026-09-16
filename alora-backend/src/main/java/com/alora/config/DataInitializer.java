package com.alora.config;

import com.alora.model.*;
import com.alora.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final ComplaintRepository complaintRepository;

    public DataInitializer(
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            ComplaintRepository complaintRepository
    ) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.complaintRepository = complaintRepository;
    }

    @Override
    public void run(String... args) {
        if (departmentRepository.count() == 0) {
            System.out.println("[INIT] Seeding initial Campus Departments...");
            Department d1 = departmentRepository.save(new Department(null, "Electrical Maintenance", "DEPT_ELEC", "electrical@campus.edu", "Er. Rajesh Sharma", 12));
            Department d2 = departmentRepository.save(new Department(null, "Plumbing & Water Works", "DEPT_PLUMB", "plumbing@campus.edu", "Er. Sunil Kulkarni", 8));
            Department d3 = departmentRepository.save(new Department(null, "IT & Network Operations", "DEPT_IT", "it-support@campus.edu", "Dr. Meera Nambiar", 6));
            Department d4 = departmentRepository.save(new Department(null, "HVAC & Climate Control", "DEPT_HVAC", "hvac@campus.edu", "Er. Vikram Patel", 16));
            Department d5 = departmentRepository.save(new Department(null, "Civil Works & Carpentry", "DEPT_CIVIL", "civil-works@campus.edu", "Er. Anita Deshmukh", 36));
            Department d6 = departmentRepository.save(new Department(null, "Housekeeping & Sanitation", "DEPT_CLEAN", "sanitation@campus.edu", "Mr. Ramesh Babu", 4));

            System.out.println("[INIT] Seeding System Users...");
            User admin = userRepository.save(new User(null, "Campus Admin", "admin@alora.edu", "admin123", Role.ADMIN, null, "+91-9876543210", "Main Admin Complex"));
            User student = userRepository.save(new User(null, "Aarav Patel (Student)", "aarav.patel@alora.edu", "user123", Role.STUDENT, null, "+91-9876543211", "Hostel Block A (Aryabhata)"));
            User faculty = userRepository.save(new User(null, "Prof. Sangeeta Sen", "sangeeta.sen@alora.edu", "user123", Role.FACULTY, null, "+91-9876543212", "Science & Technology Block"));
            User techElec = userRepository.save(new User(null, "Devendra Singh (Electrician)", "elec.dev@alora.edu", "tech123", Role.TECHNICIAN, d1, "+91-9876543213", "Electrical Workshop"));
            User techPlumb = userRepository.save(new User(null, "Manoj Kumar (Plumber)", "plumb.manoj@alora.edu", "tech123", Role.TECHNICIAN, d2, "+91-9876543214", "Water Plant Station"));
            User techIT = userRepository.save(new User(null, "Neha Reddy (SysAdmin)", "it.neha@alora.edu", "tech123", Role.TECHNICIAN, d3, "+91-9876543215", "Central Data Center"));
            User techHvac = userRepository.save(new User(null, "Suresh Verma (HVAC Specialist)", "hvac.suresh@alora.edu", "tech123", Role.TECHNICIAN, d4, "+91-9876543217", "AC Plant Room"));
            User techCivil = userRepository.save(new User(null, "Kiran More (Carpenter & Mason)", "civil.kiran@alora.edu", "tech123", Role.TECHNICIAN, d5, "+91-9876543216", "Estate & Carpentry Workshop"));
            User techClean = userRepository.save(new User(null, "Raju Yadav (Sanitation Supervisor)", "clean.raju@alora.edu", "tech123", Role.TECHNICIAN, d6, "+91-9876543218", "Housekeeping Depot"));

            System.out.println("[INIT] Seeding Sample Complaints...");
            Complaint c1 = new Complaint();
            c1.setTrackingNumber("ALR-2026-0001");
            c1.setUser(student);
            c1.setTitle("Main corridor lights flickering and sparking");
            c1.setDescription("Tube light near room 302 in Hostel Block A is flickering and producing a humming noise with sparks.");
            c1.setLocationBuilding("Hostel Block A");
            c1.setLocationFloor("3rd Floor");
            c1.setLocationRoom("Corridor near 302");
            c1.setCategory("Electrical");
            c1.setDepartment(d1);
            c1.setSeverity(Severity.HIGH);
            c1.setStatus(ComplaintStatus.IN_PROGRESS);
            c1.setAssignedTechnician(techElec);
            c1.setEstimatedResolutionHours(4.0);
            complaintRepository.save(c1);

            Complaint c2 = new Complaint();
            c2.setTrackingNumber("ALR-2026-0002");
            c2.setUser(faculty);
            c2.setTitle("Water pipeline leaking under washbasin");
            c2.setDescription("Washbasin pipeline cracked in Faculty Restroom 2nd floor, water leaking continuously onto floor.");
            c2.setLocationBuilding("Science & Technology Block");
            c2.setLocationFloor("2nd Floor");
            c2.setLocationRoom("Faculty Restroom 204");
            c2.setCategory("Plumbing");
            c2.setDepartment(d2);
            c2.setSeverity(Severity.HIGH);
            c2.setStatus(ComplaintStatus.ASSIGNED);
            c2.setAssignedTechnician(techPlumb);
            c2.setEstimatedResolutionHours(3.5);
            complaintRepository.save(c2);

            System.out.println("[OK] Campus database primed with initial departments, technicians, and complaints!");
        }

        ensureTechniciansExist();
    }

    private void ensureTechniciansExist() {
        departmentRepository.findByNameIgnoreCase("HVAC & Climate Control").ifPresent(d4 -> {
            if (userRepository.findByRoleAndDepartment(Role.TECHNICIAN, d4).isEmpty()) {
                userRepository.save(new User(null, "Suresh Verma (HVAC Specialist)", "hvac.suresh@alora.edu", "tech123", Role.TECHNICIAN, d4, "+91-9876543217", "AC Plant Room"));
                System.out.println("[INIT] Backfilled technician for HVAC & Climate Control.");
            }
        });
        departmentRepository.findByNameIgnoreCase("Civil Works & Carpentry").ifPresent(d5 -> {
            if (userRepository.findByRoleAndDepartment(Role.TECHNICIAN, d5).isEmpty()) {
                userRepository.save(new User(null, "Kiran More (Carpenter & Mason)", "civil.kiran@alora.edu", "tech123", Role.TECHNICIAN, d5, "+91-9876543216", "Estate & Carpentry Workshop"));
                System.out.println("[INIT] Backfilled technician for Civil Works & Carpentry.");
            }
        });
        departmentRepository.findByNameIgnoreCase("Housekeeping & Sanitation").ifPresent(d6 -> {
            if (userRepository.findByRoleAndDepartment(Role.TECHNICIAN, d6).isEmpty()) {
                userRepository.save(new User(null, "Raju Yadav (Sanitation Supervisor)", "clean.raju@alora.edu", "tech123", Role.TECHNICIAN, d6, "+91-9876543218", "Housekeeping Depot"));
                System.out.println("[INIT] Backfilled technician for Housekeeping & Sanitation.");
            }
        });
    }
}
