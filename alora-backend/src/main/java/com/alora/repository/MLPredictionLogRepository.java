package com.alora.repository;

import com.alora.model.MLPredictionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MLPredictionLogRepository extends JpaRepository<MLPredictionLog, Long> {
    Optional<MLPredictionLog> findByComplaintId(Long complaintId);
}
