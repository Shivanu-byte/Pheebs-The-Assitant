from services.llm import LLM
from config import settings


def main():
    llm = LLM()

    response = llm.generate(
        "Your name is Pheebs and I am Shivanu."
    )

    print("LLM Response:")
    print(response)


if __name__ == "__main__":
    main()