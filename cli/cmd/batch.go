package cmd

import (
	"errors"
	"fmt"
	"time"

	"github.com/spf13/cobra"

	"github.com/Ypout07/bounty-bot/cli/pkg/api"
	"github.com/Ypout07/bounty-bot/cli/pkg/evaluator"
	"github.com/Ypout07/bounty-bot/cli/pkg/orchestrator"
)

var batchRepoPath string

var batchCmd = &cobra.Command{
	Use:   "batch",
	Short: "Executes all pending submissions in the queue and terminates",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("=====================================================")
		fmt.Println("INITIATING BATCH EVALUATION...")
		fmt.Println("=====================================================")

		processedCount := 0

		for {
			job, err := api.FetchNextJob()
			if err != nil {
				if errors.Is(err, api.ErrQueueEmpty) {
					fmt.Printf("\nQueue is empty. Batch processing complete.\n")
					break
				}
				panic(fmt.Sprintf("Fatal: API error: %v", err))
			}

			processedCount++
			fmt.Printf("\nProcessing job %d: %s (Tag: %s)\n", processedCount, job.SubmissionID, job.DockerImageTag)

			startTime := time.Now()
			agentFailed := false

			err = orchestrator.RunAgent(job.DockerImageTag, batchRepoPath)
			if err != nil {
				fmt.Printf("Agent Execution Failed/Timed Out: %v\n", err)
				agentFailed = true
			}

			execTime := time.Since(startTime).Seconds()

			var passedTests bool
			var tokensUsed int

			if agentFailed {
				fmt.Println("[*] Skipping local test suite due to agent failure.")
				passedTests = false
				tokensUsed = 0
			} else {
				passedTests = evaluator.ExecuteTests(batchRepoPath)
				metrics := evaluator.ParseMetrics(batchRepoPath)
				tokensUsed = metrics.TokensUsed
			}

			err = api.SubmitResults(job.SubmissionID, passedTests, execTime, tokensUsed)
			if err != nil {
				fmt.Printf("Failed to submit results for %s: %v\n", job.SubmissionID, err)
			} else {
				fmt.Println("Results successfully transmitted.")
			}

			err = evaluator.RevertWorkspace(batchRepoPath)
			if err != nil {
				panic(fmt.Sprintf("Failed to revert workspace state: %v", err))
			}
		}

		fmt.Println("=====================================================")
		fmt.Printf("BATCH EVALUATION TERMINATED. %d SUBMISSIONS PROCESSED.\n", processedCount)
		fmt.Println("=====================================================")
	},
}

func init() {
	rootCmd.AddCommand(batchCmd)
	batchCmd.Flags().StringVarP(&batchRepoPath, "repo-path", "r", "./execution-environment/company-private-repo", "Path to private repository")
}