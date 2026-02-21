from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.finance import MaintenanceLog
from app.models.vehicle import Vehicle
from app.schemas.finance import MaintenanceLogResponse, MaintenanceLogCreate
from app.models.enums import VehicleStatus

router = APIRouter()

@router.post("/", response_model=MaintenanceLogResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_log(log: MaintenanceLogCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == log.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    new_log = MaintenanceLog(**log.model_dump())
    db.add(new_log)
    
    # Adding a vehicle to a Service Log automatically switches its status to In Shop,
    # removing it from the Dispatcher's selection pool.
    vehicle.status = VehicleStatus.IN_SHOP

    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/", response_model=List[MaintenanceLogResponse])
def read_maintenance_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(MaintenanceLog).offset(skip).limit(limit).all()
    return logs

@router.patch("/{log_id}/complete", response_model=MaintenanceLogResponse)
def complete_maintenance_service(log_id: int, db: Session = Depends(get_db)):
    """
    Mark a maintenance log as complete. Releases the vehicle back to AVAILABLE
    so it can be dispatched again. This fixes the gap where vehicles were
    permanently stuck IN_SHOP with no way to release them.
    """
    log = db.query(MaintenanceLog).filter(MaintenanceLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")

    vehicle = db.query(Vehicle).filter(Vehicle.id == log.vehicle_id).first()
    if vehicle and vehicle.status == VehicleStatus.IN_SHOP:
        vehicle.status = VehicleStatus.AVAILABLE

    db.commit()
    db.refresh(log)
    return log
