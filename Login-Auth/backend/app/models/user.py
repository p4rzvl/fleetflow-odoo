from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from datetime import datetime
from app.database import Base
from app.models.enums import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(
        Enum(
            UserRole,
            values_callable=lambda obj: [e.value for e in obj],  # ✅ STORE ENUM VALUES
        ),
        nullable=False
    )
    is_active = Column(Boolean, default=True)

    otp = Column(String, nullable=True)
    otp_expiry = Column(DateTime, nullable=True)