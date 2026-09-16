package com.alora.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false, unique = true)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "satisfaction_level", length = 30)
    private String satisfactionLevel;

    @Column(name = "is_used_for_training")
    private Boolean isUsedForTraining = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Feedback() {}

    public Feedback(Complaint complaint, User user, Integer rating, String comments, String satisfactionLevel) {
        this.complaint = complaint;
        this.user = user;
        this.rating = rating;
        this.comments = comments;
        this.satisfactionLevel = satisfactionLevel;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Complaint getComplaint() { return complaint; }
    public void setComplaint(Complaint complaint) { this.complaint = complaint; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public String getSatisfactionLevel() { return satisfactionLevel; }
    public void setSatisfactionLevel(String satisfactionLevel) { this.satisfactionLevel = satisfactionLevel; }

    public Boolean getIsUsedForTraining() { return isUsedForTraining; }
    public void setIsUsedForTraining(Boolean usedForTraining) { isUsedForTraining = usedForTraining; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
