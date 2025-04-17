package com.pkv.jobscheduler.model;
import java.util.List;
import lombok.Data;

// Purpose: Captures user input from the frontend or API request
// Contains: all fields required to create a job, 
          // helps decouple the database structure from incoming JSON         
// Used in: JobController receives this client, processes it, 
          // and passes it to the JobSchedulerService for scheduling
@Data
public class JobRequestDTO {
    private String jobName;
    private JobType jobType;
    private String timeZone; // E.g., Asia/Kolkata
    private String scheduledTime; // ISO string, to be converted to ZOnedDateTime
    // private String binaryPath;
    private String kafkaTopic;
    private String metadata;
    private String cronExpression; 
    private String binaryFileName; 
    private Integer delayMinutes;

    private List<String> weekDays;     
    private List<Integer> monthDates;

}
