package com.pkv.jobscheduler.scheduler;

import com.pkv.jobscheduler.model.*;
import com.pkv.jobscheduler.repository.JobScheduleRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.support.CronExpression;

import java.time.ZonedDateTime;
import java.util.List;

@Service
public class RecurringJobRunnerService {
    private final JobScheduleRepository jobRepo;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public RecurringJobRunnerService(JobScheduleRepository jobRepo, KafkaTemplate<String, String> kafkaTemplate) {
        this.jobRepo = jobRepo;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedRate = 60000)
    public void evaluateRecurringJobs() {
        List<JobSchedule> jobs = jobRepo.findAll();

        for (JobSchedule job : jobs) {
            if (job.getJobType() == JobType.RECURRING && job.getCronExpression() != null) {
                CronExpression cron = CronExpression.parse(job.getCronExpression());
                ZonedDateTime now = ZonedDateTime.now();
                ZonedDateTime next = cron.next(now.minusMinutes(1));

                if (next != null &&
                        next.withSecond(0).withNano(0).equals(now.withSecond(0).withNano(0))) {

                    boolean shouldRun = true;

                    // ✅ Weekly check
                    if (job.getWeekDays() != null && !job.getWeekDays().isEmpty()) {
                        String today = now.getDayOfWeek().toString(); // e.g., MONDAY
                        shouldRun = job.getWeekDays().stream()
                                .map(String::toUpperCase)
                                .anyMatch(day -> today.equals(day));
                    }

                    // ✅ Monthly check
                    if (shouldRun && job.getMonthDates() != null && !job.getMonthDates().isEmpty()) {
                        int todayDate = now.getDayOfMonth();
                        shouldRun = job.getMonthDates().contains(todayDate);
                    }

                    if (!shouldRun) {
                        System.out.println("🔁 Skipping recurring job ID: " + job.getId() + " (day/date not matched)");
                        continue;
                    }

                    // ✅ All conditions passed → run job
                    System.out.println("🔁 Running recurring job ID: " + job.getId() +
                            " at " + now + " → sending to topic: " + job.getKafkaTopic());

                    try {
                        kafkaTemplate.send(job.getKafkaTopic(), job.getMetadata());
                    } catch (Exception e) {
                        System.out.println("❌ Failed recurring job ID: " + job.getId());
                        e.printStackTrace();
                    }

                } else {
                    System.out.println("🕒 Skipped job ID: " + job.getId() + " (not time yet)");
                }
            }
        }
    }

}
