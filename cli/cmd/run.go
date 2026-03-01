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
	runProblemID string
	runRepoPath  string
)

var runCmd = &cobra.Command{
	Use:   "run",
	Short: "Pulls a specific pending agent and executes the evaluation loop",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("Single run beginning for: %s\n", runProblemID)

		job, err := api.FetchPendingJob(runProblemID)
		if err != nil {
			log.Fatalf("Aborting: %v\n", err)
		}
		fmt.Printf("Acquired Submission ID: %s\n", job.SubmissionID)

		startTime := time.Now()
		agentFailed := false

		err = orchestrator.RunAgent(job.DockerImageTag, runRepoPath, job.APIKey)
		if err != nil {
			fmt.Printf("Agent Execution Failed/Timed Out: %v\n", err)
			agentFailed = true
		}

		execTime := time.Since(startTime).Seconds()

		var passedTests bool
		var tokensUsed int

		if agentFailed {
			fmt.Println("Skipping tests due to agent failure.")
			passedTests = false
			tokensUsed = 0
		} else {
			passedTests = evaluator.ExecuteTests(runRepoPath)
			metrics := evaluator.ParseMetrics(runRepoPath)
			tokensUsed = metrics.TokensUsed
		}

		err = api.SubmitResults(job.SubmissionID, passedTests, execTime, tokensUsed)
		if err != nil {
			log.Fatalf("Failed to submit results: %v\n", err)
		}

		// Enterprise cleanup for the single run as well
		_ = evaluator.RevertWorkspace(runRepoPath)

		fmt.Println("Execution complete.")
	},
}

func init() {
	rootCmd.AddCommand(runCmd)
	runCmd.Flags().StringVarP(&runProblemID, "problem-id", "p", "", "The ID of the problem (required)")
	runCmd.Flags().StringVarP(&runRepoPath, "repo-path", "r", "./execution-environment/company-private-repo", "Path to private repo")
	runCmd.MarkFlagRequired("problem-id")
}
