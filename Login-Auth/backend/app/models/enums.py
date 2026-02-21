from enum import Enum as PyEnum

class UserRole(PyEnum):
    MANAGER = "Manager"
    DISPATCHER = "Dispatcher"
    SAFETY_OFFICER = "Safety Officer"
    FINANCIAL_ANALYST = "Financial Analyst"