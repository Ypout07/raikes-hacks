package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// Enterprise configuration handling
const defaultBaseURL = "http://localhost:3000" // Update this to your deployed Vercel URL before the demo
const demoJudgeKey = "DEMO_BYPASS_KEY_123"     // Must match the key Person 1 hardcodes in Next.js

func getBaseURL() string {
	if url := os.Getenv("API_BASE_URL"); url != "" {
		return url
	}
	return defaultBaseURL
}

// Global HTTP Client with a strict 10-second timeout. Never allow a hanging network call.
var httpClient = &http.Client{
	Timeout: 10 * time.Second,
}

// FetchPendingJob asks the Web Platform for the next student submission.
func FetchPendingJob(problemID string) (*PendingSubmissionResponse, error) {
	url := fmt.Sprintf("%s/api/submissions/pending?problem_id=%s", getBaseURL(), problemID)

	fmt.Printf("[*] Querying Web Platform for pending jobs: %s\n", url)
	resp, err := httpClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("network error connecting to web platform: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("no pending submissions found in the queue")
	} else if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code from web platform: %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	var pendingJob PendingSubmissionResponse

	if err := json.Unmarshal(body, &pendingJob); err != nil {
		return nil, fmt.Errorf("failed to parse JSON response: %w", err)
	}

	return &pendingJob, nil
}

// SubmitResults POSTs the final telemetry back to the database.
func SubmitResults(submissionID string, passedTests bool, execTimeSeconds float64, tokens int) error {
	url := fmt.Sprintf("%s/api/submissions/results", getBaseURL())

	// Construct the exact payload Person 1 expects
	payload := SubmitResultsRequest{
		SubmissionID: submissionID,
		JudgeAPIKey:  demoJudgeKey,
		Metrics: ExecutionMetrics{
			PassedTests:          passedTests,
			ExecutionTimeSeconds: execTimeSeconds,
			TokensUsed:           tokens,
		},
	}

	jsonValue, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal JSON payload: %w", err)
	}

	fmt.Println("[*] Transmitting execution metrics to database...")
	resp, err := httpClient.Post(url, "application/json", bytes.NewBuffer(jsonValue))
	if err != nil {
		return fmt.Errorf("network error during submission: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("web platform rejected submission (Status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}
