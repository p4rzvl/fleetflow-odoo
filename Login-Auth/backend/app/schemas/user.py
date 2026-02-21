from pydantic import BaseModel, EmailStr
from app.models.enums import UserRole

class RegisterSchema(BaseModel):
    email: EmailStr
    password: str
    role: UserRole

class LoginSchema(BaseModel):
    email: EmailStr
    password: str

class EmailSchema(BaseModel):
    email: EmailStr

class ResetPasswordSchema(BaseModel):
    email: EmailStr
    otp: str
    new_password: str