package com.pkv.jobscheduler.scheduler;

import com.pkv.jobscheduler.model.*;
import com.pkv.jobscheduler.repository.JobScheduleRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.List;

@Service
public class JobRunnerService {

    private final JobScheduleRepository jobRepo;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public JobRunnerService(JobScheduleRepository jobRepo, KafkaTemplate<String, String> kafkaTemplate) {
        this.jobRepo = jobRepo;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedRate = 10000) // Check every 10 seconds
    public void runPendingJobs() {
        List<JobSchedule> jobs = jobRepo.findAll();

        for (JobSchedule job : jobs) {
            if (job.getStatus() != JobStatus.PENDING || job.getJobType() == JobType.RECURRING) {
                continue; // ❌ Skip non-pending or recurring jobs
            }

            // ✅ Handle IMMEDIATE job type FIRST
            if (job.getJobType() == JobType.IMMEDIATE) {
                System.out.println("⚡ Running IMMEDIATE job ID: " + job.getId());

                try {
                    job.setStatus(JobStatus.RUNNING);
                    jobRepo.save(job);

                    kafkaTemplate.send(job.getKafkaTopic(), job.getMetadata())
                            .whenComplete((result, ex) -> {
                                if (ex == null) {
                                    System.out.println("✅ [IMMEDIATE] Kafka message sent for job ID: " + job.getId()
                                            + " to topic: " + job.getKafkaTopic());
                                    System.out.println("📨 Message: " + job.getMetadata());

                                    job.setStatus(JobStatus.SUCCESS);
                                } else {
                                    System.out.println("❌ Kafka send failed for job ID: " + job.getId());
                                    ex.printStackTrace();
                                    job.setStatus(JobStatus.FAILED);
                                }
                                jobRepo.save(job);
                            });

                } catch (Exception e) {
                    job.setStatus(JobStatus.FAILED);
                    jobRepo.save(job);
                    System.out.println("❌ Job ID: " + job.getId() + " failed with error: " + e.getMessage());
                    e.printStackTrace();
                }

                continue; // ✅ IMMEDIATE handled, skip rest
            }

            // ✅ Handle DELAYED and ONE_TIME jobs
            System.out.println("⏳ Evaluating job ID: " + job.getId() + ", Type: " + job.getJobType());
            System.out.println("Scheduled Time: " + job.getScheduledTime() +
                    " | Current Time: " + ZonedDateTime.now(job.getScheduledTime().getZone()));

            if (shouldRunNow(job)) {
                try {
                    job.setStatus(JobStatus.RUNNING);
                    jobRepo.save(job);

                    if (job.getJobType() == JobType.DELAYED) {
                        kafkaTemplate.send(job.getKafkaTopic(), job.getMetadata())
                                .whenComplete((result, ex) -> {
                                    if (ex == null) {
                                        System.out.println("✅ Kafka message sent for job ID: " + job.getId()
                                                + " to topic: " + job.getKafkaTopic());
                                        System.out.println("📨 Message: " + job.getMetadata());

                                        job.setStatus(JobStatus.SUCCESS);
                                    } else {
                                        System.out.println("❌ Kafka send failed for job ID: " + job.getId());
                                        ex.printStackTrace();

                                        job.setStatus(JobStatus.FAILED);
                                    }

                                    jobRepo.save(job);
                                });

                    } else {
                        System.out.println("🚀 Simulating binary run: " + job.getBinaryPath());

                        job.setStatus(JobStatus.SUCCESS);
                        jobRepo.save(job);
                    }

                } catch (Exception e) {
                    job.setStatus(JobStatus.FAILED);
                    jobRepo.save(job);
                    System.out.println("❌ Job ID: " + job.getId() + " failed with error: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("⌛ Skipping job ID: " + job.getId() + " — not yet time to run.");
            }
        }
    }

    private boolean shouldRunNow(JobSchedule job) {
        if (job.getJobType() == JobType.IMMEDIATE)
            return true;
        if (job.getJobType() == JobType.ONE_TIME || job.getJobType() == JobType.DELAYED) {
            ZonedDateTime now = ZonedDateTime.now(job.getScheduledTime().getZone());
            return !now.isBefore(job.getScheduledTime());
        }
        return false;
    }
}
