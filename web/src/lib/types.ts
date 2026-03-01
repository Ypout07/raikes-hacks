export type ChallengeStatus = "submitted" | "ongoing" | "unattempted" | "expired";

export interface Challenge {
  id: string;
  title: string;
  company: string;
  description: string;
  request: string;
  postedAt: string;      // ISO date string
  deadline: string;       // ISO date string
  status: ChallengeStatus;
}

export interface ProviderChallenge extends Challenge {
  metrics: string[];
  repoUrl: string;
  submissionCount: number;
}
