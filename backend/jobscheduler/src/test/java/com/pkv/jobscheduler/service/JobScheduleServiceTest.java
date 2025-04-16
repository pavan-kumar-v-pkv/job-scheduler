package com.pkv.jobscheduler.service;

import com.pkv.jobscheduler.model.*;
import com.pkv.jobscheduler.repository.JobScheduleRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JobScheduleServiceTest {

    @Mock
    private JobScheduleRepository jobRepo;

    @InjectMocks
    private JobScheduleService jobService;

    public JobScheduleServiceTest() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testScheduleJob_createsJobSuccessfully() {
        JobRequestDTO dto = new JobRequestDTO();
        dto.setJobName("Test Job");
        dto.setJobType(JobType.ONE_TIME);
        dto.setTimeZone("Asia/Kolkata");
        dto.setScheduledTime("2025-04-20T12:00");
        dto.setKafkaTopic("test-topic");
        dto.setMetadata("{\"key\":\"value\"}");

        when(jobRepo.save(any(JobSchedule.class))).thenAnswer(i -> i.getArguments()[0]);

        JobSchedule scheduledJob = jobService.scheduleJob(dto);

        assertNotNull(scheduledJob);
        assertEquals("Test Job", scheduledJob.getJobName());
        assertEquals(JobType.ONE_TIME, scheduledJob.getJobType());
        assertEquals("test-topic", scheduledJob.getKafkaTopic());
    }
}
