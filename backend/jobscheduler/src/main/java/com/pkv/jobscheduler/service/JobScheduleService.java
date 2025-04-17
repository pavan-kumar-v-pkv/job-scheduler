package com.pkv.jobscheduler.service;

import com.pkv.jobscheduler.model.*;
import com.pkv.jobscheduler.repository.JobScheduleRepository;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeParseException;
import java.util.List;

@Service
public class JobScheduleService {

    private final JobScheduleRepository jobRepo;

    public JobScheduleService(JobScheduleRepository jobRepo) {
        this.jobRepo = jobRepo;
    }

    public JobSchedule scheduleJob(JobRequestDTO dto) {
        ZonedDateTime time = null;

        // ✅ Handle delayed job using delayMinutes
        if (dto.getJobType() == JobType.DELAYED) {
            if (dto.getDelayMinutes() == null || dto.getDelayMinutes() <= 0) {
                throw new IllegalArgumentException("Delay duration must be a positive number of minutes.");
            }
            time = ZonedDateTime.now(ZoneId.of(dto.getTimeZone())).plusMinutes(dto.getDelayMinutes());
        }

        // ✅ Handle one-time job with datetime string
        else if (dto.getJobType() == JobType.ONE_TIME) {
            time = ZonedDateTime.of(
                LocalDateTime.parse(dto.getScheduledTime()),
                ZoneId.of(dto.getTimeZone()));
        }

        // ✅ Handle recurring jobs with cron expression
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
                .scheduledTime(time) // null for RECURRING
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

        // ✅ Parse scheduledTime safely handling both Z and local datetime formats
        if (dto.getScheduledTime() != null && !dto.getScheduledTime().isEmpty() && dto.getTimeZone() != null) {
            try {
                ZonedDateTime newScheduledTime;

                if (dto.getScheduledTime().endsWith("Z")) {
                    Instant instant = Instant.parse(dto.getScheduledTime());
                    newScheduledTime = instant.atZone(ZoneId.of(dto.getTimeZone()));
                } else {
                    LocalDateTime localDateTime = LocalDateTime.parse(dto.getScheduledTime());
                    newScheduledTime = ZonedDateTime.of(localDateTime, ZoneId.of(dto.getTimeZone()));
                }

                if (!newScheduledTime.equals(job.getScheduledTime())) {
                    job.setScheduledTime(newScheduledTime);
                    job.setStatus(JobStatus.PENDING); // Reset status if time was updated
                }
            } catch (DateTimeParseException e) {
                throw new RuntimeException("Failed to parse scheduledTime: " + dto.getScheduledTime(), e);
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
