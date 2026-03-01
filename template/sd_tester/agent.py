import os
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
print(result.content)