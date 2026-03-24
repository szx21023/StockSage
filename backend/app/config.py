from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    anthropic_api_key: str
    news_api_key: str = ""
    fmp_api_key: str = ""
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    debug: bool = False

    class Config:
        env_file = ".env"


settings = Settings()
