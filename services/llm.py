from openai import OpenAI

from config import settings


class LLM:
    """Handles communication with the configured LLM."""

    def __init__(self):
        self.client = OpenAI(
            api_key=settings.llm_api_key,
            base_url=settings.llm_base_url,
        )

    def generate(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=1,
            stream=True

        )

        response_text = ""

        for chunk in response:
            content = chunk.choices[0].delta.content

            if content:
                response_text += content

        return response_text.strip()