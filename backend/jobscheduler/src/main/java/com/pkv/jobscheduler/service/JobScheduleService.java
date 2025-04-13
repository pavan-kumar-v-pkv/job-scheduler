package com.pkv.jobscheduler.service;

import com.pkv.jobscheduler.model.*;
import com.pkv.jobscheduler.repository.JobScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;

// Purpose: Handles business logic for creating and storing jobs.
// What it does:
// 1. Converts the input JobRequestDTO to a JobSchedule entity.
// 2. Handles ZonedDateTime conversion with proper timezone.
// 3. Saves the job to DB with initial Pending status.
// 4. Sets createdAt timestamp.
// used in: JobController when a job is scheduled
@Service
public class JobScheduleService {

    private final JobScheduleRepository jobRepo;

    public JobScheduleService(JobScheduleRepository jobRepo) {
        this.jobRepo = jobRepo;
    }

    public JobSchedule scheduleJob(JobRequestDTO dto) {
        ZonedDateTime time = ZonedDateTime.of(
                LocalDateTime.parse(dto.getScheduledTime()), // This parses "2025-04-13T22:35:00"
                ZoneId.of(dto.getTimeZone()) // e.g., "Asia/Kolkata"
        );

        JobSchedule job = JobSchedule.builder()
                .jobName(dto.getJobName())
                .jobType(dto.getJobType())
                .status(JobStatus.PENDING)
                .timeZone(dto.getTimeZone())
                .scheduledTime(time)
                .binaryPath(dto.getBinaryPath())
                .kafkaTopic(dto.getKafkaTopic())
                .metadata(dto.getMetadata())
                .cronExpression(dto.getCronExpression())
                .createdAt(ZonedDateTime.now())
                .build();

        return jobRepo.save(job);
    }

    public List<JobSchedule> getAllJobs() {
        return jobRepo.findAll();
    }
}
