# SD Tester Agent

A CAL agent example that demonstrates building a practical testing and evaluation tool with multiple capabilities for test execution, data processing, and result analysis.

## Features

- **Test Execution**: Run and manage test cases with detailed execution tracking
- **Tool Integration**: Execute custom tools with flexible parameter handling
- **Agent Prompting**: Dynamic prompt-based task execution and evaluation
- **Result Analysis**: Process and analyze test results with comprehensive reporting
- **Demo Tool Support**: Extensible architecture for demonstrating custom functionality

## Setup

1. Create a `.env` file with your API keys:

```bash
LLM_API_KEY=your_llm_api_key
```

2. Install dependencies:

```bash
pip install git+https://github.com/Creevo-App/creevo-agent-library.git python-dotenv
```

3. Run the agent:

```bash
python agent.py
```

## Example Usage

```
You: Run a test on this function

# Agent will:
# 1. Execute the test using available tools
# 2. Process the results
# 3. Provide detailed analysis

You: Evaluate the performance metrics

You: Generate a test report
```

## File Structure

```
sd_tester/
├── agent.py       # Main agent setup and run loop
├── tools.py       # Custom tool definitions (@tool decorator)
├── prompt.py      # System prompts and guidelines
├── test.py        # Test suite and execution logic
└── Tutorial.md    # This file
```

## Key CAL Concepts Demonstrated

### 1. Custom Tools with `@tool` Decorator

```python
@tool
async def execute_test(test_name: str, parameters: dict):
    """Tool description for the LLM"""
    # Tool implementation
    return {
        "content": [{"type": "text", "text": "Test Result"}],
        "metadata": {"test_id": "123", "status": "passed"}
    }
```

### 2. Prompt Configuration

```python
# prompt.py contains:
# - System role and capabilities
# - Tool usage guidelines
# - Expected interaction patterns
# - Response formatting guidelines
```

### 3. Agent Configuration

```python
agent = Agent(
    llm=llm,
    system_prompt=SYSTEM_PROMPT,
    max_calls=50,
    max_tokens=4096,
    agent_name="sd-tester",
    tools=[tool1, tool2, ...],
)
```

### 4. Test Execution Framework

The `test.py` module provides test discovery, execution, and result collection capabilities for comprehensive testing scenarios.

## Demo Tool

*Space reserved for demonstrating custom tool functionality*

### Overview

Add details about how to create and use a demo tool with this agent.

### Example Implementation

```python
# Implementation example coming soon
```

## Extending the Agent

To add new tools, use the `@tool` decorator in `tools.py`:

```python
@tool
async def custom_tool(arg1: str, arg2: int):
    """Description of what this tool does"""
    # Implementation
    return {
        "content": [{"type": "text", "text": "result"}],
        "metadata": {"key": "value"}
    }
```

Then add it to the agent's tools list in `agent.py`.