package com.pkv.jobscheduler.model;

// Purpose: Tracks the execution status of a job
// Used in JobSchedule to store the status of a job
// Helps show job history and debug failures
public enum JobStatus {
    PENDING, // Job is created but not run yet.
    RUNNING, // Job is currently running.
    SUCCESS, // Job completed successfully.
    FAILED // Job failed during execution.
}
