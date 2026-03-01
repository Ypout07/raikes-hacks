import { Challenge } from "./types";

export const mockChallenges: Challenge[] = [
  {
    id: "1",
    title: "Build a Real-Time Fraud Detection Pipeline",
    company: "Capital One",
    description:
      "Design and implement a streaming data pipeline that detects fraudulent transactions in real time. You will work with synthetic transaction data and must flag anomalies using statistical or ML-based approaches within a 200ms latency window.",
    postedAt: "2026-02-26T10:00:00Z",
    deadline: "2026-03-05T23:59:00Z",
    status: "ongoing",
  },
  {
    id: "2",
    title: "Optimize a Legacy Search Index",
    company: "Elasticsearch",
    description:
      "Given a degraded search index serving 50k queries per second, identify bottlenecks and refactor the indexing strategy. Your solution should improve p95 latency by at least 40% without increasing infrastructure costs.",
    postedAt: "2026-02-25T14:00:00Z",
    deadline: "2026-03-04T23:59:00Z",
    status: "submitted",
  },
  {
    id: "3",
    title: "Reverse Engineer a Minified API Client",
    company: "Trail of Bits",
    description:
      "You are given an obfuscated JavaScript API client. Reconstruct its request signing algorithm and produce a clean, documented implementation that passes the provided integration test suite.",
    postedAt: "2026-02-27T08:00:00Z",
    deadline: "2026-03-06T18:00:00Z",
    status: "unattempted",
  },
  {
    id: "4",
    title: "Container Escape CTF",
    company: "CrowdStrike",
    description:
      "Exploit a deliberately misconfigured container runtime to escape to the host. Document each step of your exploit chain and propose mitigations for each vulnerability you discover.",
    postedAt: "2026-02-24T12:00:00Z",
    deadline: "2026-03-03T23:59:00Z",
    status: "expired",
  },
  {
    id: "5",
    title: "Design a Distributed Rate Limiter",
    company: "Cloudflare",
    description:
      "Implement a distributed rate limiting service that operates across multiple data centers with eventual consistency. Handle clock skew, network partitions, and burst traffic while maintaining fair request distribution.",
    postedAt: "2026-02-27T16:00:00Z",
    deadline: "2026-03-07T23:59:00Z",
    status: "unattempted",
  },
  {
    id: "6",
    title: "Patch a Vulnerable Smart Contract",
    company: "Coinbase",
    description:
      "Audit the provided Solidity smart contract, identify all exploitable vulnerabilities, write proof-of-concept exploits, and submit a patched version that passes the full security test harness.",
    postedAt: "2026-02-26T09:00:00Z",
    deadline: "2026-03-05T12:00:00Z",
    status: "ongoing",
  },
  {
    id: "7",
    title: "Build a Zero-Knowledge Proof Verifier",
    company: "StarkWare",
    description:
      "Implement a ZK-STARK verifier from scratch that can validate arithmetic circuit proofs. Your implementation must handle field arithmetic, Merkle commitments, and FRI-based polynomial verification.",
    postedAt: "2026-02-25T11:00:00Z",
    deadline: "2026-03-06T23:59:00Z",
    status: "unattempted",
  },
  {
    id: "8",
    title: "Automate Infrastructure Drift Detection",
    company: "HashiCorp",
    description:
      "Create a tool that continuously compares live cloud infrastructure against Terraform state files and alerts on drift. Support AWS EC2, S3, and IAM resources with a configurable threshold for acceptable variance.",
    postedAt: "2026-02-24T09:00:00Z",
    deadline: "2026-03-04T18:00:00Z",
    status: "ongoing",
  },
  {
    id: "9",
    title: "LLM Prompt Injection Defense",
    company: "Anthropic",
    description:
      "Design and implement a multi-layered defense system that detects and neutralizes prompt injection attacks against an LLM-powered customer service bot. Evaluate against a provided red-team dataset of 500 adversarial inputs.",
    postedAt: "2026-02-27T10:00:00Z",
    deadline: "2026-03-07T23:59:00Z",
    status: "unattempted",
  },
  {
    id: "10",
    title: "High-Frequency Trading Simulator",
    company: "Jane Street",
    description:
      "Build a matching engine simulator that processes limit and market orders with sub-microsecond precision. Implement price-time priority, handle partial fills, and support cancel/replace operations across multiple order books.",
    postedAt: "2026-02-26T15:00:00Z",
    deadline: "2026-03-06T12:00:00Z",
    status: "unattempted",
  },
  {
    id: "11",
    title: "Malware Sandbox Evasion Analysis",
    company: "Mandiant",
    description:
      "Analyze a set of malware samples that employ sandbox evasion techniques. Document each evasion method, classify them by category, and build detection signatures that identify the evasion behavior without triggering false positives.",
    postedAt: "2026-02-23T08:00:00Z",
    deadline: "2026-03-03T17:00:00Z",
    status: "submitted",
  },
  {
    id: "12",
    title: "Compiler Optimization Pass",
    company: "NVIDIA",
    description:
      "Write a custom LLVM optimization pass that identifies and vectorizes nested loop patterns common in matrix multiplication. Benchmark your pass against the baseline on provided CUDA kernel test cases.",
    postedAt: "2026-02-27T14:00:00Z",
    deadline: "2026-03-08T23:59:00Z",
    status: "unattempted",
  },
];
