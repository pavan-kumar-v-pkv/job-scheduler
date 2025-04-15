package com.pkv.jobscheduler.service;

import com.pkv.jobscheduler.model.*;
import com.pkv.jobscheduler.repository.JobScheduleRepository;
import org.springframework.scheduling.support.CronExpression;
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

        ZonedDateTime time = null;

        // ✅ Handle only for non-recurring jobs
        // if (dto.getJobType() != JobType.RECURRING)`
        if (dto.getJobType() == JobType.DELAYED || dto.getJobType() == JobType.ONE_TIME) {
            time = ZonedDateTime.of(
                    LocalDateTime.parse(dto.getScheduledTime()),
                    ZoneId.of(dto.getTimeZone()));
        }

        // ✅ Validate cron expression for recurring jobs
        if (dto.getJobType() == JobType.RECURRING) {
            if (dto.getCronExpression() == null || !CronExpression.isValidExpression(dto.getCronExpression())) {
                throw new IllegalArgumentException("Invalid cron expression for recurring job.");
            }
        }

        JobSchedule job = JobSchedule.builder()
                .jobName(dto.getJobName())
                .jobType(dto.getJobType())
                .status(JobStatus.PENDING)
                .timeZone(dto.getTimeZone())
                .scheduledTime(time) // Will be null for RECURRING
                .binaryPath(dto.getBinaryFileName())
                .kafkaTopic(dto.getKafkaTopic())
                .metadata(dto.getMetadata())
                .cronExpression(dto.getCronExpression())
                .createdAt(ZonedDateTime.now())
                .build();

        return jobRepo.save(job);
    }

    public JobSchedule updateJob(Long id, JobRequestDTO dto) {
        JobSchedule job = jobRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Job not found"));
    
        job.setJobName(dto.getJobName());
        job.setJobType(dto.getJobType());
        job.setTimeZone(dto.getTimeZone());
        job.setKafkaTopic(dto.getKafkaTopic());
        job.setMetadata(dto.getMetadata());
    
        if (dto.getScheduledTime() != null && dto.getTimeZone() != null) {
            LocalDateTime localDateTime = LocalDateTime.parse(dto.getScheduledTime());
            ZoneId zoneId = ZoneId.of(dto.getTimeZone());
            ZonedDateTime newScheduledTime = ZonedDateTime.of(localDateTime, zoneId);
    
            if (!newScheduledTime.equals(job.getScheduledTime())) {
                job.setScheduledTime(newScheduledTime);
                job.setStatus(JobStatus.PENDING); // Reset status if time was updated
            }
        }
    
        job.setCronExpression(dto.getCronExpression());
        job.setBinaryPath(dto.getBinaryFileName());
    
        return jobRepo.save(job);
    }
    
    public List<JobSchedule> getAllJobs() {
        return jobRepo.findAll();
    }
}