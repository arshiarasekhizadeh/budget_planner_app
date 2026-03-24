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
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    FRONTEND_URL: str = "http://localhost:3000"

mail_settings = MailSettings()

conf = ConnectionConfig(
    MAIL_USERNAME=mail_settings.MAIL_USERNAME,
    MAIL_PASSWORD=mail_settings.MAIL_PASSWORD,
    MAIL_FROM=mail_settings.MAIL_FROM,
    MAIL_PORT=mail_settings.MAIL_PORT,
    MAIL_SERVER=mail_settings.MAIL_SERVER,
    MAIL_FROM_NAME=mail_settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=mail_settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=mail_settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=mail_settings.USE_CREDENTIALS,
    VALIDATE_CERTS=mail_settings.VALIDATE_CERTS
)

async def send_verification_email(email: str, token: str):
    verify_url = f"{mail_settings.FRONTEND_URL}/verify-email?token={token}"
    
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
        <h2 style="font-weight: 800; letter-spacing: -0.05em;">Verify your email</h2>
        <p style="color: #71717a;">Welcome to Budgetly. Please click the button below to verify your email address and activate your account.</p>
        <a href="{verify_url}" style="display: inline-block; background-color: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px;">Verify Email</a>
        <p style="margin-top: 20px; font-size: 12px; color: #a1a1aa;">If you didn't create an account, you can safely ignore this email.</p>
    </div>
    """
    
    message = MessageSchema(
        subject="Budgetly - Verify your email",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )
    
    await _send(email, message, verify_url)

async def send_password_reset_email(email: str, token: str):
    reset_url = f"{mail_settings.FRONTEND_URL}/reset-password?token={token}"
    
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 12px;">
        <h2 style="font-weight: 800; letter-spacing: -0.05em;">Reset your password</h2>
        <p style="color: #71717a;">We received a request to reset your password. Click the button below to choose a new one. This link will expire in 1 hour.</p>
        <a href="{reset_url}" style="display: inline-block; background-color: #18181b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 10px;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #a1a1aa;">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
    """
    
    message = MessageSchema(
        subject="Budgetly - Reset your password",
        recipients=[email],
        body=html,
        subtype=MessageType.html
    )
    
    await _send(email, message, reset_url)

async def _send(email: str, message: MessageSchema, debug_url: str):
    fm = FastMail(conf)
    # If credentials are not set, we'll just log the link for development
    if not mail_settings.MAIL_USERNAME or not mail_settings.MAIL_PASSWORD:
        print(f"DEBUG: Email credentials not set. URL: {debug_url}")
        return

    print(f"DEBUG: Attempting to send email to {email}...")
    print(f"DEBUG: Server: {mail_settings.MAIL_SERVER}:{mail_settings.MAIL_PORT}")
    print(f"DEBUG: SSL_TLS: {mail_settings.MAIL_SSL_TLS}, STARTTLS: {mail_settings.MAIL_STARTTLS}")

    try:
        await fm.send_message(message)
        print(f"SUCCESS: Email sent to {email}")
    except Exception as e:
        print(f"ERROR: Failed to send email to {email}: {str(e)}")
