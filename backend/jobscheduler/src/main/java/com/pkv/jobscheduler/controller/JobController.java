package com.pkv.jobscheduler.controller;

import com.pkv.jobscheduler.model.*;
import com.pkv.jobscheduler.service.JobScheduleService;
import com.pkv.jobscheduler.repository.JobScheduleRepository;

// import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Pageable;
// import org.springframework.boot.autoconfigure.data.web.SpringDataWebProperties.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

// Exposes REST endpoints for clients to schedule and list jobs.
// Endpoints:
// - POST /api/jobs/schedule: Accepts a job scheduling request (JSON)
// - GET /api/jobs:(optional) Returns a list of scheduled jobs

@RestController // "Hey, this class will handle REST API calls - like GET, Post, etc."
@RequestMapping("/api/jobs") // All the endpoints in this class will be prefixed with /api/jobs
public class JobController {

    private final JobScheduleService jobService;
    private final JobScheduleRepository jobScheduleRepository;

    public JobController(JobScheduleService jobService, JobScheduleRepository jobScheduleRepository) {
        this.jobService = jobService;
        this.jobScheduleRepository = jobScheduleRepository;
    }

    @PostMapping("/schedule")
    public ResponseEntity<JobSchedule> scheduleJob(@Validated @RequestBody JobRequestDTO jobRequestDTO) {
        JobSchedule job = jobService.scheduleJob(jobRequestDTO);
        return ResponseEntity.ok(job);
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<JobSchedule>> getAllJobsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<JobSchedule> jobPage = jobScheduleRepository.findAll(pageable);
        return ResponseEntity.ok(jobPage);
    }

    @GetMapping
    public ResponseEntity<List<JobSchedule>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobSchedule> updateJob(
            @PathVariable Long id,
            @RequestBody JobRequestDTO updatedJob) {

        JobSchedule job = jobService.updateJob(id, updatedJob);
        return ResponseEntity.ok(job);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobScheduleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

}
