import os
from dotenv import load_dotenv

load_dotenv()

async def send_otp_email(email: str, otp: str):
    """Send OTP email. Configure MAIL_* env vars to enable real email sending."""
    mail_username = os.getenv("MAIL_USERNAME")
    mail_password = os.getenv("MAIL_PASSWORD")
    mail_from = os.getenv("MAIL_FROM")
    mail_port = os.getenv("MAIL_PORT")
    mail_server = os.getenv("MAIL_SERVER")

    if not all([mail_username, mail_password, mail_from, mail_port, mail_server]):
        # Email not configured — just log OTP to console (dev mode)
        print(f"[DEV] OTP for {email}: {otp}")
        return

    from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

    conf = ConnectionConfig(
        MAIL_USERNAME=mail_username,
        MAIL_PASSWORD=mail_password,
        MAIL_FROM=mail_from,
        MAIL_PORT=int(mail_port),
        MAIL_SERVER=mail_server,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True
    )

    message = MessageSchema(
        subject="FleetFlow Password Reset OTP",
        recipients=[email],
        body=f"Your OTP is {otp}. It expires in 5 minutes.",
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)