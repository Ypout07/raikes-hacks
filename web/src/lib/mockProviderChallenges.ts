import { ProviderChallenge } from "./types";

export const mockProviderChallenges: ProviderChallenge[] = [
  {
    id: "p1",
    title: "Build a Real-Time Fraud Detection Pipeline",
    company: "Capital One",
    description:
      "Design and implement a streaming data pipeline that detects fraudulent transactions in real time. You will work with synthetic transaction data and must flag anomalies using statistical or ML-based approaches within a 200ms latency window.",
    postedAt: "2026-02-26T10:00:00Z",
    deadline: "2026-03-05T23:59:00Z",
    metrics: ["p95 latency", "accuracy", "false positive rate"],
    repoUrl: "https://github.com/c*****-one/fraud-detect-***",
    submissionCount: 23,
    status: "unattempted",
  },
  {
    id: "p2",
    title: "Credit Risk Model Optimization",
    company: "Capital One",
    description:
      "Optimize the provided credit risk scoring model to reduce inference time while maintaining AUC above 0.92. The model currently runs at 450ms per batch — target is sub-100ms without dropping below the accuracy threshold.",
    postedAt: "2026-02-24T14:00:00Z",
    deadline: "2026-03-04T23:59:00Z",
    metrics: ["inference time", "AUC", "memory usage"],
    repoUrl: "https://github.com/c*****-one/risk-model-***",
    submissionCount: 41,
    status: "unattempted",
  },
  {
    id: "p3",
    title: "Secure API Gateway Hardening",
    company: "Capital One",
    description:
      "Audit and harden the provided API gateway configuration. Identify misconfigurations, implement rate limiting, add mTLS support, and ensure all OWASP API Top 10 vulnerabilities are mitigated.",
    postedAt: "2026-02-27T08:00:00Z",
    deadline: "2026-03-07T18:00:00Z",
    metrics: ["vulnerabilities patched", "latency overhead", "test coverage"],
    repoUrl: "https://github.com/c*****-one/api-gateway-***",
    submissionCount: 7,
    status: "unattempted",
  },
  {
    id: "p4",
    title: "Data Pipeline Cost Reduction",
    company: "Capital One",
    description:
      "Refactor the existing ETL pipeline to reduce AWS costs by at least 30%. The pipeline processes 2TB daily across S3, Glue, and Redshift. Maintain data freshness SLA of 15 minutes.",
    postedAt: "2026-02-22T12:00:00Z",
    deadline: "2026-03-01T23:59:00Z",
    metrics: ["cost reduction %", "data freshness", "pipeline reliability"],
    repoUrl: "https://github.com/c*****-one/etl-pipeline-***",
    submissionCount: 56,
    status: "unattempted",
  },
];
