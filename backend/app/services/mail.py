import os
import secrets
from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class MailSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@budgetplanner.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "Budget Planner"

mail_settings = MailSettings()

conf = ConnectionConfig(
    MAIL_USERNAME=mail_settings.MAIL_USERNAME,
    MAIL_PASSWORD=mail_settings.MAIL_PASSWORD,
    MAIL_FROM=mail_settings.MAIL_FROM,
    MAIL_PORT=mail_settings.MAIL_PORT,
    MAIL_SERVER=mail_settings.MAIL_SERVER,
    MAIL_FROM_NAME=mail_settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_verification_email(email: str, token: str):
    # For local development, this URL might need to be configurable
    verify_url = f"http://localhost:3000/verify-email?token={token}"
    
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
        <h2 style="font-weight: 800; letter-spacing: -0.05em;">Verify your email</h2>
        <p style="color: #71717a;">Welcome to Budget Planner. Please click the button below to verify your email address and activate your account.</p>
        <a href="{verify_url}" style="display: inline-block; background-color: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px;">Verify Email</a>
        <p style="margin-top: 20px; font-size: 12px; color: #a1a1aa;">If you didn't create an account, you can safely ignore this email.</p>
    </div>
    """
    
    message = MessageSchema(
        subject="Budget Planner - Verify your email",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )
    
    fm = FastMail(conf)
    # If credentials are not set, we'll just log the link for development
    if not mail_settings.MAIL_USERNAME or not mail_settings.MAIL_PASSWORD:
        print(f"DEBUG: Email credentials not set. Verification link: {verify_url}")
        return

    await fm.send_message(message)
