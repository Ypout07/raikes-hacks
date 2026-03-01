package api

// PendingSubmissionResponse matches the JSON payload returned by your Next.js GET endpoint.
type PendingSubmissionResponse struct {
	SubmissionID   string `json:"submission_id"`
	DockerImageTag string `json:"docker_image_tag"`
	Status         string `json:"status"`
	APIKey         string `json:"api_key"`
}

// ExecutionMetrics defines the nested telemetry object.
type ExecutionMetrics struct {
	PassedTests          bool    `json:"passed_tests"`
	ExecutionTimeSeconds float64 `json:"execution_time_seconds"`
	TokensUsed           int     `json:"tokens_used"`
}

// SubmitResultsRequest matches the exact JSON expected by your Next.js POST endpoint.
type SubmitResultsRequest struct {
	SubmissionID string           `json:"submission_id"`
	JudgeAPIKey  string           `json:"judge_api_key"`
	Metrics      ExecutionMetrics `json:"metrics"`
}
