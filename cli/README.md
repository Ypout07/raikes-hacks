# CLI

## What is this?

- This is the code written in Golang to more easily let companies assess solutions securely. 
- It provides support for querying the website and getting the batch of Docker tags. From there, it can spin up a Docker container on the company's local machine and let the agent run. 
- Once the agent has finished, it runs the testing and records benchmarking results. It returns the benchmarks and other measurements (such as how many credits were used, how long the program ran for, etc.) for us to compile and assign a score to.
