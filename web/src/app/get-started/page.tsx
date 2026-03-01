"use client";

import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import Navbar from "@/components/Navbar";

/* ── Template file contents embedded for client-side download ── */

const TEMPLATE_FILES: { name: string; content: string }[] = [
  {
    name: "agent.py",
    content: `import os
from CAL import Agent, GeminiLLM, StopTool, FullCompressionMemory
from dotenv import load_dotenv
from tools import get_file_structure_context, read_contents_of_file, execute_file, write_file
from prompt import SYSTEM_PROMPT

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
llm = GeminiLLM(model="gemini-3-flash-preview", api_key=api_key, max_tokens=4096)
summarizer_llm = GeminiLLM(model="gemini-3-flash-preview", api_key=api_key, max_tokens=2048)
memory = FullCompressionMemory(summarizer_llm=summarizer_llm, max_tokens=50000)

agent = Agent(
    llm=llm,
    system_prompt=SYSTEM_PROMPT,
    max_calls=10,
    max_tokens=4096,
    memory=memory,
    agent_name="DebugBot",
    tools=[StopTool(), get_file_structure_context, read_contents_of_file, execute_file, write_file]
)

result = agent.run("Find the main source code and run it. Look at the stacktrace and tell me what is the problem in simple terms")
print(result.content)`,
  },
  {
    name: "tools.py",
    content: `from CAL import tool
from dotenv import load_dotenv
import subprocess
import sys

load_dotenv()

@tool
async def get_file_structure_context(path: str = "./"):
    """
    Generates a visual tree representation of the directory structure.

    Args:
        path: The directory path to map. Defaults to the current directory.

    Returns:
        A dictionary containing the text-based tree structure of the files.
    """
    try:
        cmd = ["tree", "/f", path]
        tree_output = subprocess.check_output(cmd, shell=True).decode("utf-8", errors="ignore")
    except subprocess.CalledProcessError as e:
        tree_output = f"Error retrieving structure: {str(e)}"

    return {
        "content": [{"type": "text", "text": tree_output}],
        "metadata": {"path": path, "output_length": len(tree_output)}
    }

@tool
async def read_contents_of_file(filepath: str):
    """
    Reads and returns the full text content of a specified file.

    Args:
        filepath: The relative or absolute path to the file.

    Returns:
        The text content of the file or an error message.
    """
    try:
        with open(filepath, "r", encoding="utf-8") as file:
            content_text = file.read()

        return {
            "content": [{"type": "text", "text": content_text}],
            "metadata": {"filepath": filepath, "char_count": len(content_text)}
        }
    except Exception as e:
        return {
            "content": [{"type": "text", "text": f"Error reading file: {str(e)}"}],
            "metadata": {"filepath": filepath, "status": "failed"}
        }

@tool
async def execute_file(filepath: str):
    """
    Executes a Python file and captures its output, errors, and exit code.

    Args:
        filepath: The path to the Python script to be executed.

    Returns:
        A dictionary containing stdout, stderr, and the exit status.
    """
    cmd = [sys.executable, filepath]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")

    output_data = {
        "status": "success" if result.returncode == 0 else "error",
        "stdout": result.stdout,
        "stderr": result.stderr,
        "exit_code": result.returncode
    }

    return {
        "content": [{"type": "text", "text": str(output_data)}],
        "metadata": {"executed_file": filepath}
    }

@tool
async def write_file(filename: str, data: str):
    """
    Writes or overwrites a file with the provided data and verifies the write.

    Args:
        filename: The name/path of the file to create or modify.
        data: The string content to write into the file.

    Returns:
        The content of the file after the write operation for verification.
    """
    try:
        with open(filename, "w", encoding="utf-8") as file:
            file.write(data)

        with open(filename, "r", encoding="utf-8") as file:
            verification_content = file.read()

        return {
            "content": [{"type": "text", "text": verification_content}],
            "metadata": {"filename": filename, "bytes_written": len(data)}
        }
    except Exception as e:
        return {
            "content": [{"type": "text", "text": f"Error writing file: {str(e)}"}],
            "metadata": {"filename": filename, "status": "failed"}
        }`,
  },
  {
    name: "prompt.py",
    content: `ROLE_PROMPT = """
<role>
You are an expert Software Developer AI agent. Your purpose is to diagnose, resolve, and implement code solutions by:
- Mapping and understanding existing project architectures.
- Reading and analyzing source code for bugs, bottlenecks, or anti-patterns.
- Safely implementing changes and new features.
- Validating solutions through execution and testing.

You are precise, cautious with legacy code, and highly logical. You prioritize code readability, maintainability, and security.
</role>
"""

GUIDELINES_PROMPT = """
<guidelines>
## Engineering Best Practices

1. **Context First**: Never modify code without first understanding its dependencies.
2. **Incremental Changes**: Make small, atomic changes rather than massive refactors.
3. **Verify Assumptions**: Use file execution to confirm bugs exist before fixing them.
4. **Style Consistency**: Match the existing codebase's conventions.
5. **Dry Principle**: Look for opportunities to reduce redundancy.

## Communication Style

- Use technical, precise language.
- Provide diff-like explanations for changes.
- Clearly state the "Why" behind a fix, not just the "What."
- Warn the user before performing destructive operations.
</guidelines>
"""

TOOL_USAGE_PROMPT = """
<tool-usage>
## Available Tools

### \`get_file_structure_context\`: Map the workspace
### \`read_contents_of_file\`: Analyze specific code
### \`execute_file\`: Validate and Test
### \`write_file\`: Implement changes

## Workflow
1. **Analyze**: Use \`get_file_structure_context\` to find the relevant module.
2. **Diagnose**: Use \`read_contents_of_file\` to find the bug.
3. **Reproduce**: Use \`execute_file\` to see the error in action.
4. **Fix**: Use \`write_file\` to apply the solution.
5. **Verify**: Use \`execute_file\` again to ensure the test passes.
</tool-usage>
"""

SYSTEM_PROMPT = ROLE_PROMPT + GUIDELINES_PROMPT + TOOL_USAGE_PROMPT`,
  },
  {
    name: "requirements.txt",
    content: `creevo-agent-library[mcp]`,
  },
];

const lightColorful = {
  plain: { color: "#1d1d1f", backgroundColor: "#f5f5f7" },
  styles: [
    { types: ["comment", "prolog", "doctype", "cdata"], style: { color: "#6a737d" } },
    { types: ["punctuation"], style: { color: "#444" } },
    { types: ["property", "tag", "boolean", "number", "constant", "symbol"], style: { color: "#0550ae" } },
    { types: ["attr-name", "string", "char", "builtin", "inserted"], style: { color: "#22863a" } },
    { types: ["operator", "entity", "url"], style: { color: "#d63384" } },
    { types: ["atrule", "attr-value", "keyword"], style: { color: "#cf222e" } },
    { types: ["function", "class-name"], style: { color: "#8250df" } },
    { types: ["regex", "important", "variable"], style: { color: "#e36209" } },
    { types: ["decorator", "annotation"], style: { color: "#e36209" } },
    { types: ["triple-quoted-string", "template-string"], style: { color: "#22863a" } },
  ],
};

function CodeBlock({ code, language = "python" }: { code: string; language?: string }) {
  return (
    <Highlight theme={lightColorful} code={code.trim()} language={language}>
      {({ style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className="rounded-xl p-4 mb-4 overflow-x-auto text-xs leading-relaxed border border-surface-hover"
          style={{ ...style }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

function downloadAll() {
  TEMPLATE_FILES.forEach((f) => {
    const blob = new Blob([f.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = f.name;
    a.click();
    URL.revokeObjectURL(url);
  });
}

export default function GetStartedPage() {
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const previewed = TEMPLATE_FILES.find((f) => f.name === previewFile);

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <Navbar />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-12">
          {/* Page header */}
          <h1 className="text-4xl font-bold text-heading mb-2">Get Started</h1>
          <p className="text-muted text-sm mb-10">
            Everything you need to build and submit your agent.
          </p>

          {/* Download + preview section */}
          <section className="rounded-2xl bg-surface-overlay border border-surface-hover p-6 mb-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-heading">
                  Starter Template
                </h2>
                <p className="text-xs text-muted mt-1">
                  Preview files below, or download the full template.
                </p>
              </div>
              <button
                onClick={downloadAll}
                className="px-5 py-2 text-sm font-medium text-white bg-accent rounded-full hover:bg-accent-dim transition-colors"
              >
                Download All
              </button>
            </div>

            {/* File tabs */}
            <div className="flex gap-2 mb-4">
              {TEMPLATE_FILES.map((file) => (
                <button
                  key={file.name}
                  onClick={() =>
                    setPreviewFile(
                      previewFile === file.name ? null : file.name
                    )
                  }
                  className={`px-4 py-2 text-xs font-medium rounded-full border transition-colors ${
                    previewFile === file.name
                      ? "bg-heading text-white border-heading"
                      : "bg-white text-body border-surface-hover hover:border-muted/30"
                  }`}
                >
                  {file.name}
                </button>
              ))}
            </div>

            {/* Preview pane */}
            {previewed && (
              <div className="rounded-xl overflow-hidden bg-white border border-surface-hover">
                <div className="flex items-center justify-between px-4 py-2 border-b border-surface-hover bg-surface-raised">
                  <span className="text-xs font-medium text-heading">
                    {previewed.name}
                  </span>
                  <span className="text-xs text-muted">
                    {previewed.content.split("\n").length} lines
                  </span>
                </div>
                <Highlight
                  theme={lightColorful}
                  code={previewed.content}
                  language="python"
                >
                  {({ style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                      className="p-4 overflow-auto max-h-96 text-xs leading-relaxed"
                      style={{ ...style }}
                    >
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line })}>
                          <span className="inline-block w-8 text-right mr-4 select-none text-muted/50">
                            {i + 1}
                          </span>
                          {line.map((token, key) => (
                            <span key={key} {...getTokenProps({ token })} />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              </div>
            )}
          </section>

          {/* Tutorial content */}
          <article className="prose-custom">
            <h2>SD Tester Agent</h2>
            <p>
              A CAL agent example that demonstrates building a practical testing
              and evaluation tool with multiple capabilities for test execution,
              data processing, and result analysis.
            </p>

            <h3>Features</h3>
            <ul>
              <li>
                <strong>Test Execution</strong> &mdash; Run and manage test
                cases with detailed execution tracking
              </li>
              <li>
                <strong>Tool Integration</strong> &mdash; Execute custom tools
                with flexible parameter handling
              </li>
              <li>
                <strong>Agent Prompting</strong> &mdash; Dynamic prompt-based
                task execution and evaluation
              </li>
              <li>
                <strong>Result Analysis</strong> &mdash; Process and analyze
                test results with comprehensive reporting
              </li>
              <li>
                <strong>Demo Tool Support</strong> &mdash; Extensible
                architecture for demonstrating custom functionality
              </li>
            </ul>

            <h3>Setup</h3>
            <p>
              1. Create a <code>.env</code> file with your API keys:
            </p>
            <CodeBlock language="bash" code="LLM_API_KEY=your_llm_api_key" />

            <p>2. Install dependencies:</p>
            <CodeBlock language="bash" code="pip install git+https://github.com/Creevo-App/creevo-agent-library.git python-dotenv" />

            <p>3. Run the agent:</p>
            <CodeBlock language="bash" code="python agent.py" />

            <h3>File Structure</h3>
            <CodeBlock language="bash" code={`sd_tester/
├── agent.py       # Main agent setup and run loop
├── tools.py       # Custom tool definitions (@tool decorator)
├── prompt.py      # System prompts and guidelines
├── test.py        # Test suite and execution logic
└── Tutorial.md    # This file`} />

            <h3>Key CAL Concepts</h3>

            <h4>1. Custom Tools with @tool Decorator</h4>
            <CodeBlock code={`@tool
async def execute_test(test_name: str, parameters: dict):
    """Tool description for the LLM"""
    return {
        "content": [{"type": "text", "text": "Test Result"}],
        "metadata": {"test_id": "123", "status": "passed"}
    }`} />

            <h4>2. Prompt Configuration</h4>
            <p>
              <code>prompt.py</code> contains the system role, tool usage
              guidelines, expected interaction patterns, and response formatting
              guidelines.
            </p>

            <h4>3. Agent Configuration</h4>
            <CodeBlock code={`agent = Agent(
    llm=llm,
    system_prompt=SYSTEM_PROMPT,
    max_calls=50,
    max_tokens=4096,
    agent_name="sd-tester",
    tools=[tool1, tool2, ...],
)`} />

            <h4>4. Test Execution Framework</h4>
            <p>
              The <code>test.py</code> module provides test discovery,
              execution, and result collection capabilities for comprehensive
              testing scenarios.
            </p>

            <h3>Extending the Agent</h3>
            <p>
              To add new tools, use the <code>@tool</code> decorator in{" "}
              <code>tools.py</code>:
            </p>
            <CodeBlock code={`@tool
async def custom_tool(arg1: str, arg2: int):
    """Description of what this tool does"""
    return {
        "content": [{"type": "text", "text": "result"}],
        "metadata": {"key": "value"}
    }`} />
            <p>
              Then add it to the agent&apos;s tools list in{" "}
              <code>agent.py</code>.
            </p>
          </article>
        </div>
      </div>
    </main>
  );
}
