package cmd

import (
	"fmt"
	"log"
	"time"

	"github.com/spf13/cobra"

	"github.com/Ypout07/bounty-bot/cli/pkg/api"
	"github.com/Ypout07/bounty-bot/cli/pkg/evaluator"
	"github.com/Ypout07/bounty-bot/cli/pkg/orchestrator"
)

var (
	problemID string
	repoPath  string
)

var runCmd = &cobra.Command{
	Use:   "run",
	Short: "Pulls the next pending agent and executes the evaluation loop",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("Initializing orchestrator %s\n", problemID)

		job, err := api.FetchPendingJob(problemID)
		if err != nil {
			log.Fatalf("Aborting: %v\n", err)
		}
		fmt.Printf("Got submission ID: %s\n", job.SubmissionID)

		startTime := time.Now()

		agentFailed := false
		err = orchestrator.RunAgent(job.DockerImageTag, repoPath)
		if err != nil {
			fmt.Printf("Agent execution failed/timed out: %v\n", err)
			agentFailed = true
		}

		// Calculate total execution time (we track this even if it timed out)
		execTime := time.Since(startTime).Seconds()

		var passedTests bool
		var tokensUsed int

		if agentFailed {
			// If the container crashed or timed out, it automatically fails the tests
			fmt.Println("Skipping tests due to agent failure.")
			passedTests = false
			tokensUsed = 0 // Should we charge for failed attempts?
		} else {
			// The agent finished properly, so we run pytest
			passedTests = evaluator.ExecuteTests(repoPath)
			metrics := evaluator.ParseMetrics(repoPath)
			tokensUsed = metrics.TokensUsed
		}

		err = api.SubmitResults(job.SubmissionID, passedTests, execTime, tokensUsed)
		if err != nil {
			log.Fatalf("Failed to submit results to database: %v\n", err)
		}

		fmt.Println("Execution complete.")
	},
}

func init() {
	rootCmd.AddCommand(runCmd)

	// Define the flags required for this command
	runCmd.Flags().StringVarP(&problemID, "problem-id", "p", "", "The ID of the problem to fetch pending submissions for (required)")
	runCmd.Flags().StringVarP(&repoPath, "repo-path", "r", "./execution-environment/company-private-repo", "Absolute or relative path to the private repository")

	runCmd.MarkFlagRequired("problem-id")
}
