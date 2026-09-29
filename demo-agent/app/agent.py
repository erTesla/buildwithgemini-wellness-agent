# ruff: noqa
# Copyright 2026 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import datetime
from zoneinfo import ZoneInfo

from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.apps import App
from google.adk.models import Gemini
from google.adk.tools.preload_memory_tool import PreloadMemoryTool
from google.genai import types


MODEL = "gemini-3.6-flash"


def get_weather(query: str) -> str:
    """Simulates a web search. Use it get information on weather.

    Args:
        query: A string containing the location to get weather information for.

    Returns:
        A string with the simulated weather information for the queried location.
    """
    if "sf" in query.lower() or "san francisco" in query.lower():
        return "It's 60 degrees and foggy."
    return "It's 90 degrees and sunny."


def get_current_time(query: str) -> str:
    """Simulates getting the current time for a city.

    Args:
        city: The name of the city to get the current time for.

    Returns:
        A string with the current time information.
    """
    if "sf" in query.lower() or "san francisco" in query.lower():
        tz_identifier = "America/Los_Angeles"
    else:
        return f"Sorry, I don't have timezone information for query: {query}."

    tz = ZoneInfo(tz_identifier)
    now = datetime.datetime.now(tz)
    return f"The current time for query {query} is {now.strftime('%Y-%m-%d %H:%M:%S %Z%z')}"


# WRITE: after each turn, send the full session to Memory Bank for durable extraction
async def generate_memories_callback(callback_context: CallbackContext):
    """Sends session conversation turns to Vertex AI Memory Bank for automatic extraction."""
    await callback_context.add_session_to_memory()
    return None


AGENT_INSTRUCTION = """You are a helpful, empathetic, and attentive personal wellness, performance, and hobby management assistant.

Your goal is to support the user's daily well-being, habit consistency, and daily routine.

Memory & Daily Updates Guidelines:
1. Cross-Session Memory: You remember the user's stated daily updates, wellness check-ins, mood, physical energy levels, stress levels, sleep quality, tasks, priorities, constraints, and hobbies across conversations.
2. Capturing Daily Updates: When the user shares updates about their day (e.g. how they feel, what happened today, what tasks they completed or struggled with, what they ate, how they slept, or hobbies they engaged in), acknowledge these details empathetically and reflect that you retain this context.
3. Tailored Advice: Use their historical daily updates and stated preferences to personalize suggestions—adapting recommendations to their current energy level, time available, and past experiences.
4. Non-Medical Support: Provide thoughtful lifestyle and habits guidance, keeping safety first without providing clinical diagnosis.
"""

root_agent = Agent(
    name="root_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=AGENT_INSTRUCTION,
    # READ: PreloadMemoryTool retrieves memories at the start of every turn and
    # injects them into the system instruction automatically.
    tools=[PreloadMemoryTool(), get_weather, get_current_time],
    after_agent_callback=generate_memories_callback,
)

app = App(
    root_agent=root_agent,
    name="app",
)
