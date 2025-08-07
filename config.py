import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Freshdesk Configuration
    FRESHDESK_DOMAIN: str = ""
    FRESHDESK_API_KEY: str = ""
    FRESHDESK_WEBHOOK_SECRET: str = ""
    
    # AI Model Configuration
    MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"  # Lightweight model for real-time
    CLASSIFICATION_MODEL: str = "facebook/bart-large-mnli"  # For ticket categorization
    MAX_SEQUENCE_LENGTH: int = 512
    
    # Ticket Classification
    TIER_1_KEYWORDS: list = [
        "password reset", "login", "account access", "basic setup", 
        "simple configuration", "download", "installation guide"
    ]
    TIER_2_KEYWORDS: list = [
        "billing", "payment", "subscription", "upgrade", "downgrade",
        "feature request", "bug report", "performance issue"
    ]
    COMPLEX_KEYWORDS: list = [
        "critical", "urgent", "system down", "data loss", "security",
        "custom integration", "api", "advanced configuration"
    ]
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./tickets.db"
    
    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = False
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "bot.log"
    
    # Vector Database
    VECTOR_DB_PATH: str = "faiss_index"
    
    # Response Templates
    AUTO_RESPONSE_TEMPLATES: dict = {
        "tier_1": {
            "greeting": "Hello! I can help you with this {category} issue.",
            "solution": "Here's how to resolve this: {solution}",
            "closing": "This should resolve your issue. Let me know if you need further assistance!"
        },
        "tier_2": {
            "greeting": "I understand your {category} concern. Let me help you with this.",
            "solution": "Here's what you need to do: {solution}",
            "closing": "I've provided a solution above. If this doesn't resolve your issue, I'll escalate it to a human agent."
        },
        "complex": {
            "greeting": "I see this is a complex {category} issue that requires specialized attention.",
            "escalation": "I'm escalating this ticket to our specialized team who will assist you shortly.",
            "closing": "A human agent will contact you within the next few hours."
        }
    }
    
    class Config:
        env_file = ".env"

settings = Settings() 