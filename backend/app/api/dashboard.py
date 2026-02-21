from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.vehicle import Vehicle
from app.models.trip import Trip
from app.models.enums import VehicleStatus, VehicleType, TripStatus
from app.schemas.dashboard import DashboardStats

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(
    vehicle_type: Optional[VehicleType] = Query(None, description="Filter by vehicle type"),
    db: Session = Depends(get_db)
):
    vehicle_query = db.query(Vehicle)
    trip_query = db.query(Trip)

    if vehicle_type:
        vehicle_query = vehicle_query.filter(Vehicle.type == vehicle_type)
        trip_query = trip_query.join(Vehicle).filter(Vehicle.type == vehicle_type)

    active_fleet = vehicle_query.filter(Vehicle.status == VehicleStatus.ON_TRIP).count()
    maintenance_alerts = vehicle_query.filter(Vehicle.status == VehicleStatus.IN_SHOP).count()
    total_active_vehicles = vehicle_query.filter(
        Vehicle.status.in_([VehicleStatus.AVAILABLE, VehicleStatus.ON_TRIP])
    ).count()

    utilization_rate_percent = 0.0
    if total_active_vehicles > 0:
        utilization_rate_percent = (active_fleet / total_active_vehicles) * 100.0

    pending_cargo = trip_query.filter(Trip.status == TripStatus.DRAFT).count()

    return DashboardStats(
        active_fleet=active_fleet,
        maintenance_alerts=maintenance_alerts,
        utilization_rate_percent=round(utilization_rate_percent, 2),
        pending_cargo=pending_cargo
    )
