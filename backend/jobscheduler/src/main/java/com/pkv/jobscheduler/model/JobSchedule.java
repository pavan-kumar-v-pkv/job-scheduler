package com.pkv.jobscheduler.model;

import java.util.List;

import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

// Represnts a job record in the database
// Used in: JPA persistence, Scheduling logic, Querying job history
@Entity
@Table(name = "job_schedules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String jobName;

    @Enumerated(EnumType.STRING)
    private JobType jobType;

    @Enumerated(EnumType.STRING)
    private JobStatus status;
    private String timeZone;

    private ZonedDateTime scheduledTime;

    private String cronExpression; // for recurring jobs

    private String binaryPath; // path to the (jar/npm) file to be executed

    private String kafkaTopic; // topic to send messages to (for DElAYED jobs)

    private String metadata; // Custom payload for kafka

    private ZonedDateTime createdAt;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_week_days")
    @Column(name = "week_day")
    private List<String> weekDays;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "job_month_dates")
    @Column(name = "month_date")
    private List<Integer> monthDates;

}
