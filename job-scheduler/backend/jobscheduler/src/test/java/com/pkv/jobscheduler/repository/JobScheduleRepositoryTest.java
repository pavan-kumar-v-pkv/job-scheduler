package com.pkv.jobscheduler.repository;

import com.pkv.jobscheduler.model.JobSchedule;
import com.pkv.jobscheduler.model.JobStatus;
import com.pkv.jobscheduler.model.JobType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE) // ✅ Add this line
@Testcontainers
@ExtendWith(SpringExtension.class)
public class JobScheduleRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
            .withDatabaseName("testdb")
            .withUsername("testuser")
            .withPassword("testpass");

    @DynamicPropertySource
    static void config(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired
    private JobScheduleRepository jobScheduleRepository;

    @Test
    public void testSaveJob() {
        JobSchedule job = JobSchedule.builder()
                .jobName("Integration Test Job")
                .jobType(JobType.ONE_TIME)
                .status(JobStatus.PENDING)
                .timeZone("Asia/Kolkata")
                .scheduledTime(ZonedDateTime.now(ZoneId.of("Asia/Kolkata")).plusMinutes(10))
                .kafkaTopic("test-topic")
                .metadata("{\"msg\": \"test\"}")
                .build();

        JobSchedule saved = jobScheduleRepository.save(job);
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getJobName()).isEqualTo("Integration Test Job");
    }
}
