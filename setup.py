from setuptools import setup, find_packages

setup(
    name="cleros",
    version="0.1.0",
    packages=find_packages(),
    description="Semantic analysis of Orphic Hymns",
    author="J Neumann",
    install_requires=[
        "aiohttp",
        "python-dotenv",
        "httpx",
        "pydantic",
        "spacy",
        "tiktoken",
        "tqdm",
        "matplotlib",
        "pandas",
        "seaborn",
        "wordcloud",
    ],
    python_requires=">=3.9",
) 