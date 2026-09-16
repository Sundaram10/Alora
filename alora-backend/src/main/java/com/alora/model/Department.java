package com.alora.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "departments")
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "head_name", length = 100)
    private String headName;

    @Column(name = "sla_target_hours")
    private Integer slaTargetHours = 24;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Department() {}

    public Department(Long id, String name, String code, String contactEmail, String headName, Integer slaTargetHours) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.contactEmail = contactEmail;
        this.headName = headName;
        this.slaTargetHours = slaTargetHours;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getHeadName() { return headName; }
    public void setHeadName(String headName) { this.headName = headName; }

    public Integer getSlaTargetHours() { return slaTargetHours; }
    public void setSlaTargetHours(Integer slaTargetHours) { this.slaTargetHours = slaTargetHours; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
