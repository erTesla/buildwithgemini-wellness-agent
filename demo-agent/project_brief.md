# My agent: Who-Hum Wellness Companion

One-liner: An empathetic, supportive companion for personal wellness, habits, hobbies, healthy recipes, and mindful life adventures.

Agent Domain Items:
- Mindful Meditation & Relaxation (e.g. Zen rock garden, peaceful forest, calming stream, sunset meditation)
- Daily Habits & Fitness Routines (e.g. morning cycling, sunrise yoga, restorative nature walk)
- Mood-Boosting Nutrition & Culinary Recipes (e.g. colorful nourish bowl, antioxidant smoothie)
- Life Adventures & Hobbies (e.g. scenic travel getaways, creative hobbies, gardening)

Tool coverage:
- Memory: User daily updates, milestones, emotions, sleep, and energy levels across sessions
- Tools:
  - `search_travel_places`: Scenic spots and verified Google Maps navigation links
  - `generate_healthy_recipe_image`: Mood-boosting culinary dish images
  - `generate_wellness_video`: Short video generation for domain items using Google's Omni model (`gemini-omni-flash-preview`) in the `global` region
  - `get_weather`: Weather queries
  - `get_current_time`: Time zone queries
- Artifacts & Storage:
  - Saves video artifacts with `tool_context.save_artifact` to the Playground's Artifacts panel
  - Uploads in-memory video bytes to public Cloud Storage bucket `bwg3-qwiklabs-gcp-03-478f309b432f`
- UI: Neo-Brutalist A2UI cards
