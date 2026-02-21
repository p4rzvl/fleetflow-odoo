from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.database import get_db
from app.models.driver import Driver
from app.schemas.driver import DriverResponse, DriverCreate
from app.models.enums import DriverStatus

router = APIRouter()

@router.post("/", response_model=DriverResponse, status_code=status.HTTP_201_CREATED)
def create_driver(driver: DriverCreate, db: Session = Depends(get_db)):
    db_driver = db.query(Driver).filter(Driver.license_number == driver.license_number).first()
    if db_driver:
        raise HTTPException(status_code=400, detail="License number already registered")
    
    new_driver = Driver(**driver.model_dump())
    
    # Check if license is already expired upon creation
    if new_driver.license_expiry_date < date.today():
        new_driver.status = DriverStatus.SUSPENDED
    
    db.add(new_driver)
    db.commit()
    db.refresh(new_driver)
    return new_driver

@router.get("/", response_model=List[DriverResponse])
def read_drivers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Pure read — no DB mutations. Use POST /drivers/sync-expired-licenses to batch-suspend.
    drivers = db.query(Driver).offset(skip).limit(limit).all()
    return drivers

@router.get("/{driver_id}", response_model=DriverResponse)
def read_driver(driver_id: int, db: Session = Depends(get_db)):
    # Pure read — suspension flag shown as-is, not mutated here.
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if driver is None:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.patch("/{driver_id}/status", response_model=DriverResponse)
def update_driver_status(driver_id: int, new_status: DriverStatus, db: Session = Depends(get_db)):
    driver = db.query(Driver).filter(Driver.id == driver_id).first()
    if driver is None:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    if new_status == DriverStatus.ON_DUTY and driver.license_expiry_date < date.today():
        raise HTTPException(status_code=400, detail="Cannot set ON_DUTY; license is expired.")

    driver.status = new_status
    db.commit()
    db.refresh(driver)
    return driver

@router.post("/sync-expired-licenses", response_model=dict)
def sync_expired_licenses(db: Session = Depends(get_db)):
    """
    Batch-suspend all drivers with expired licenses that are not already suspended.
    Call this endpoint periodically (e.g. via a scheduler or admin action)
    instead of mutating state inside GET handlers.
    """
    today = date.today()
    expired_drivers = db.query(Driver).filter(
        Driver.license_expiry_date < today,
        Driver.status != DriverStatus.SUSPENDED
    ).all()
    
    count = len(expired_drivers)
    for driver in expired_drivers:
        driver.status = DriverStatus.SUSPENDED
    
    db.commit()
    return {"suspended_count": count, "message": f"Suspended {count} driver(s) with expired licenses"}
