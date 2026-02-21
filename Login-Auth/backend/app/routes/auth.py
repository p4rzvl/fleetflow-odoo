from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import random

from app.database import get_db
from app.models.user import User
from app.schemas.user import *
from app.utils.security import *
from app.utils.email import send_otp_email

router = APIRouter(prefix="/auth", tags=["Authentication"])

# REGISTER
@router.post("/register")
def register(data: RegisterSchema, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role
    )

    db.add(new_user)
    db.commit()

    return {"message": "User registered successfully"}


# LOGIN
@router.post("/login")
def login(data: LoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token({
        "sub": user.email,
        "role": user.role.value
    })

    return {"access_token": token, "token_type": "bearer"}


# FORGOT PASSWORD → SEND OTP
@router.post("/forgot-password")
async def forgot_password(data: EmailSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = str(random.randint(100000, 999999))
    user.otp = otp
    # Use timezone-aware UTC so comparison in reset-password (which uses timezone.utc) works
    user.otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=5)

    db.commit()

    await send_otp_email(user.email, otp)

    return {"message": "OTP sent to email"}


# RESET PASSWORD
@router.post("/reset-password")
def reset_password(data: ResetPasswordSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    if not user.otp_expiry:
        raise HTTPException(status_code=400, detail="OTP not generated")

    if datetime.now(timezone.utc) > user.otp_expiry:
        raise HTTPException(status_code=400, detail="OTP expired")

    user.hashed_password = hash_password(data.new_password)
    user.otp = None
    user.otp_expiry = None

    db.commit()

    return {"message": "Password reset successful"}