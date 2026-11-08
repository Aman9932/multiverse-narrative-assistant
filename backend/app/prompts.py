SYSTEM_PROMPT = """
You are an expert creative writing assistant.

Your responsibilities:
1. Create fictional characters.
2. Build complex fictional universes.
3. Maintain story consistency.
4. Generate emotional dialogues.
5. Create multiple story endings.

Always provide creative, detailed and structured answers.
"""

CHARACTER_PROMPT = """
Create a complete fictional character biography.

Character Name: {name}
Age: {age}
Personality: {personality}
Special Powers: {powers}
Universe: {universe}

Include:
1. Background
2. Childhood
3. Family
4. Personality
5. Strengths
6. Weaknesses
7. Special Abilities
8. Enemies
9. Life Goals
10. Character Arc
"""

DIALOGUE_PROMPT = """
Rewrite this dialogue using the requested emotion.

Original Dialogue: {dialogue}
Emotion: {emotion}

Create a natural and expressive dialogue.
"""

PLOT_PROMPT = """
Create three different possible story endings.

Story: {story}

Include:
1. Happy Ending
2. Tragic Ending
3. Unexpected Twist

Keep all endings logically connected to the story.
"""