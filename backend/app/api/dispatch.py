from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.schemas.trip import TripResponse, TripCreate
from app.models.enums import TripStatus, VehicleStatus, DriverStatus

router = APIRouter()

@router.post("/trips/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(trip: TripCreate, db: Session = Depends(get_db)):
    # Validate Vehicle
    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
        
    if vehicle.status != VehicleStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail=f"Vehicle is not available. Status: {vehicle.status.value}")
        
    # Validation Rule: Cargo Weight must be positive
    if trip.cargo_weight <= 0:
        raise HTTPException(
            status_code=400,
            detail="Cargo weight must be a positive number"
        )
    if trip.cargo_weight > vehicle.max_capacity:
        raise HTTPException(
            status_code=400, 
            detail=f"Cargo weight ({trip.cargo_weight}) exceeds vehicle capacity ({vehicle.max_capacity})"
        )

    # Validate Driver
    driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    if driver.status != DriverStatus.ON_DUTY:
        raise HTTPException(status_code=400, detail=f"Driver is not on duty. Status: {driver.status.value}")

    # Create Draft Trip
    new_trip = Trip(**trip.model_dump())
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    
    return new_trip

@router.get("/trips/", response_model=List[TripResponse])
def get_all_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    trips = db.query(Trip).offset(skip).limit(limit).all()
    return trips

@router.post("/trips/{trip_id}/dispatch", response_model=TripResponse)
def dispatch_trip(trip_id: int, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if trip.status != TripStatus.DRAFT:
        raise HTTPException(status_code=400, detail="Only DRAFT trips can be dispatched")
        
    # Update Statuses
    trip.status = TripStatus.DISPATCHED
    
    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    if vehicle.status != VehicleStatus.AVAILABLE:
        raise HTTPException(status_code=400, detail="Vehicle is no longer available")
    vehicle.status = VehicleStatus.ON_TRIP
    
    # Re-validate driver status before dispatching (may have been suspended since trip creation)
    if trip.driver_id:
        driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        if driver:
            if driver.status != DriverStatus.ON_DUTY:
                raise HTTPException(
                    status_code=400,
                    detail=f"Driver is no longer on duty. Status: {driver.status.value}. Cannot dispatch."
                )
            driver.status = DriverStatus.ON_TRIP

    db.commit()
    db.refresh(trip)
    return trip


from datetime import datetime
from app.schemas.trip import TripComplete

@router.post("/trips/{trip_id}/complete", response_model=TripResponse)
def complete_trip(trip_id: int, completion_data: TripComplete, db: Session = Depends(get_db)):
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
        
    if trip.status != TripStatus.DISPATCHED:
        raise HTTPException(status_code=400, detail="Only DISPATCHED trips can be completed")

    if completion_data.final_odometer <= 0:
        raise HTTPException(status_code=400, detail="Final odometer reading must be a positive number")
        
    trip.status = TripStatus.COMPLETED
    trip.final_odometer = completion_data.final_odometer
    trip.completed_at = datetime.utcnow()
    
    # Revert vehicle back to available
    vehicle = db.query(Vehicle).filter(Vehicle.id == trip.vehicle_id).first()
    if vehicle:
        vehicle.status = VehicleStatus.AVAILABLE
        # Could also log final odometer to vehicle if we add that field later

    # Revert driver back to on_duty
    if trip.driver_id:
        driver = db.query(Driver).filter(Driver.id == trip.driver_id).first()
        if driver:
            driver.status = DriverStatus.ON_DUTY

    db.commit()
    db.refresh(trip)
    return trip
