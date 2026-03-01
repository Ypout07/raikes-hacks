package evaluator

import (
	"fmt"
	"os/exec"
)

// RevertWorkspace uses Git to violently discard any changes the AI agent made,
// returning the repository to its original, buggy state for the next agent.
func RevertWorkspace(repoPath string) error {
	fmt.Println("Reverting all AI modifications.")

	// 1. Discard all modifications to tracked files
	restoreCmd := exec.Command("git", "restore", ".")
	restoreCmd.Dir = repoPath
	if err := restoreCmd.Run(); err != nil {
		return fmt.Errorf("git restore failed. Is the directory a git repository?: %w", err)
	}

	// 2. Delete any brand new, untracked files the AI might have hallucinated
	cleanCmd := exec.Command("git", "clean", "-fd")
	cleanCmd.Dir = repoPath
	if err := cleanCmd.Run(); err != nil {
		return fmt.Errorf("git clean failed: %w", err)
	}

	fmt.Println("Workspace reverted, ready for next execution.")
	return nil
}