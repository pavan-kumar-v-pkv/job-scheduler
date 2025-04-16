package com.pkv.jobscheduler.repository;

import com.pkv.jobscheduler.model.JobSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// Purpose: Handles database operations for JobSchedule
@Repository
public interface JobScheduleRepository extends JpaRepository<JobSchedule, Long> {
    // Custom query methods can be defined here if needed
    // For example, find by job type or status
    
}
