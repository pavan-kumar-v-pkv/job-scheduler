package com.pkv.jobscheduler.controller;

import com.pkv.jobscheduler.model.*;
import com.pkv.jobscheduler.service.JobScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Exposes REST endpoints for clients to schedule and list jobs.
// Endpoints:
// - POST /api/jobs/schedule: Accepts a job scheduling request (JSON)
// - GET /api/jobs:(optional) Returns a list of scheduled jobs

@RestController // "Hey, this class will handle REST API calls - like GET, Post, etc."
@RequestMapping("/api/jobs") // All the endpoints in this class will be prefixed with /api/jobs
public class JobController {
    
    private final JobScheduleService jobService;

    public JobController(JobScheduleService jobService) {
        this.jobService = jobService;
    }

    @PostMapping("/schedule")
    public ResponseEntity<JobSchedule> scheduleJob(@Validated @RequestBody JobRequestDTO jobRequestDTO) {
        JobSchedule job = jobService.scheduleJob(jobRequestDTO);
        return ResponseEntity.ok(job);
    }

    @GetMapping
    public ResponseEntity<List<JobSchedule>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }
}
