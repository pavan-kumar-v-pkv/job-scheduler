package com.pkv.jobscheduler.model;

// Defines types of jobs users can schedule
// Used in JobRequestDTO to specify the type of job
// and in JobSchedule to store the type of job
public enum JobType {
    ONE_TIME,
    RECURRING, // runns repeatedly using a cron expression
    IMMEDIATE,
    DELAYED
}
