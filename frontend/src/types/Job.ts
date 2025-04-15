export type JobType = 'DELAYED' | 'RECURRING';
export type JobStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'RUNNING';

export interface Job {
  id: number;
  jobName: string;
  jobType: JobType;
  timeZone: string;
  scheduledTime: string | null;
  binaryPath: string | null;
  kafkaTopic: string;
  metadata: string;
  cronExpression: string | null;
  status: JobStatus;
  createdAt: string;
}
