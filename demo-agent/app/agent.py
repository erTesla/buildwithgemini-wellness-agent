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

from a2ui.basic_catalog.provider import BasicCatalog
from a2ui.schema.manager import A2uiSchemaManager
from google.adk.agents import Agent
from google.adk.agents.callback_context import CallbackContext
from google.adk.apps import App
from google.adk.models import Gemini
from google.adk.tools.preload_memory_tool import PreloadMemoryTool
from google.genai import types

from app.a2ui_utils import a2ui_callback

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


# WRITE: after each turn, send the session to Memory Bank for extraction.
async def generate_memories_callback(callback_context: CallbackContext):
    await callback_context.add_session_to_memory()
    return None


# Build A2UI 0.8 system prompt with the Basic Catalog
schema_manager = A2uiSchemaManager(
    version="0.8",
    catalogs=[BasicCatalog.get_config("0.8")],
)

ROLE_DESCRIPTION = """You are an empathetic, structured personal wellness, performance, and hobby management assistant.
You maintain memory of user daily check-ins, mood, physical energy, sleep, tasks, and hobbies across sessions.
Whenever the user asks for daily updates, summaries, check-ins, tasks, or recommendations, you present your output as rich, visually striking Neo-Brutalist A2UI cards."""

WORKFLOW_DESCRIPTION = """Analyze the user's wellness state, energy level, tasks, and requests.
Generate an A2UI interface when summarizing check-ins, goals, tasks, or recommendations.
The A2UI response must follow the v0.8 A2UI schema rules."""

UI_DESCRIPTION = """NEO-BRUTALISM DESIGN SPECIFICATION & GUIDELINES:
1. Neo-Brutalist Visual Identity:
   - High-contrast, bold, playful, and expressive layout.
   - Distinct bold multi-colors representing functional cards and categories.
   - Card headers should use bold, crisp typography (usageHint: 'h1' or 'h2').

2. Dynamic Mood-Based Color Adaptation:
   - Detect or reference how the user feels today and adapt the primary card theme:
     * Happy / Energetic: Vibrant Electric Yellow / Lime Green (#FFE600 / #22C55E) theme.
     * Calm / Peaceful: Deep Refreshing Sky Cyan / Soft Mint (#06B6D4 / #A7F3D0) theme.
     * Stressed / Overwhelmed: Calming Lavender / Soft Rose / Coral Accent (#DDD6FE / #FDA4AF) theme.
     * Low Energy / Tired: Warm Amber / Sunset Orange (#FDBA74 / #FB923C) theme.
     * Focused / Motivated: Electric Cobalt Blue / Ultra Violet (#3B82F6 / #8B5CF6) theme.
   - Mention the theme color accent and mood badge prominently in the card title (e.g., "[Mood: Energetic ⚡] Daily Focus").

3. Responsive, Clean & Non-Overlapping Layout:
   - Must be fully mobile and web friendly.
   - Components MUST NOT overlap, overflow, or override each other.
   - Keep surface structure uniform, flat, and balanced:
     * Single Root Card containing ONE Column.
     * Inside the Column, use neatly ordered Rows or Text elements with uniform spacing.
     * Never nest a Card inside another Card.
     * Use Divider components to cleanly separate sections without crowding.
   - Equal and uniform visual rhythm: keep labels and values aligned.

4. Component Constraints:
   - Supported components: Card, Column, Row, Text, Divider, List, Icon, Image.
   - Do NOT use Table or Heading components (unsupported in adk web; build tables using Row/Column of Text, and use usageHint='h1'/'h2'/'body').
   - Do NOT use Buttons or interactive form actions (display-only).
   - Images: Only include an Image if a valid, public https:// URL is available. Otherwise, use descriptive Text.
   - Output ONLY the raw A2UI JSON array matching version 0.8."""

a2ui_instruction = schema_manager.generate_system_prompt(
    role_description=ROLE_DESCRIPTION,
    workflow_description=WORKFLOW_DESCRIPTION,
    ui_description=UI_DESCRIPTION,
    include_schema=True,
    include_examples=True,
)

root_agent = Agent(
    name="root_agent",
    model=Gemini(
        model=MODEL,
        retry_options=types.HttpRetryOptions(attempts=3),
    ),
    instruction=a2ui_instruction,
    # READ: PreloadMemoryTool retrieves memories at the start of every turn and
    # injects them into the system instruction automatically.
    tools=[PreloadMemoryTool(), get_weather, get_current_time],
    after_model_callback=a2ui_callback,
    after_agent_callback=generate_memories_callback,
)

app = App(
    root_agent=root_agent,
    name="app",
)
