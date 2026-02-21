from fastapi import APIRouter, Depends
from . import dashboard, registry, dispatch, driver, maintenance, finance, analytics
from app.utils.auth import get_current_user

api_router = APIRouter()

# All routes under /api/v1 require a valid JWT Bearer token
_auth = [Depends(get_current_user)]

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Command Center"], dependencies=_auth)
api_router.include_router(registry.router, prefix="/registry", tags=["Vehicle Registry"], dependencies=_auth)
api_router.include_router(dispatch.router, prefix="/dispatch", tags=["Trip Management"], dependencies=_auth)
api_router.include_router(driver.router, prefix="/drivers", tags=["Driver Management"], dependencies=_auth)
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["Maintenance Logs"], dependencies=_auth)
api_router.include_router(finance.router, prefix="/finance", tags=["Financial Logs"], dependencies=_auth)
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Reports"], dependencies=_auth)
