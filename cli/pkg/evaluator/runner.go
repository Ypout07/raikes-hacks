package evaluator

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
)

// AgentMetrics defines the exact JSON structure we expect the AI agent
// to write to metrics.json before it exits.
type AgentMetrics struct {
	TokensUsed int `json:"tokens_used"`
}

// ExecuteTests runs the company's test suite against the newly modified code.
// It returns true if the tests pass, and false if they fail.
func ExecuteTests(repoPath string) bool {
	fmt.Println("Executing tests.")

	// Resolve absolute path
	absRepoPath, err := filepath.Abs(repoPath)
	if err != nil {
		fmt.Printf("Fatal: Could not resolve repo path: %v\n", err)
		return false
	}

	// run tests w pytest?
	cmd := exec.Command("pytest", "tests/")
	cmd.Dir = absRepoPath

	var out bytes.Buffer
	var stderr bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &stderr

	err = cmd.Run()

	if err != nil {
		// ExitError means the command ran, but returned a non-zero exit code
		if _, ok := err.(*exec.ExitError); ok {
			fmt.Println("AI Agent failed to fix the bug.")
			fmt.Printf("Test Output:\n%s\n", out.String())
			return false
		}
		// system failure
		fmt.Printf("Fatal execution error: %v\n", err)
		fmt.Printf("%s\n", stderr.String())
		return false
	}

	fmt.Println("All tests passed. ")
	return true
}

// ParseMetrics reads the telemetry file left behind by the AI container.
func ParseMetrics(repoPath string) AgentMetrics {
	metricsFilePath := filepath.Join(repoPath, "metrics.json")

	// Default metrics if the AI agent hallucinated and forgot to write the file
	defaultMetrics := AgentMetrics{TokensUsed: 0}

	fmt.Printf("Extracting from %s.\n", metricsFilePath)

	fileData, err := os.ReadFile(metricsFilePath)
	if err != nil {
		fmt.Printf("Agent did not generate metrics.json. Defaulting to 0 tokens.\n")
		return defaultMetrics
	}

	var metrics AgentMetrics
	err = json.Unmarshal(fileData, &metrics)
	if err != nil {
		fmt.Printf("metrics.json is corrupted or invalid JSON. Defaulting to 0 tokens.\n")
		return defaultMetrics
	}

	fmt.Printf("%d tokens used.\n", metrics.TokensUsed)
	return metrics
}
