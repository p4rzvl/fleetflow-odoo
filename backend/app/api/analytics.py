from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from fastapi.responses import Response
import csv
import io

from app.database import get_db
from app.models.finance import MaintenanceLog, FuelLog, ExpenseLog
from app.models.vehicle import Vehicle
from app.models.trip import Trip
from app.models.enums import TripStatus

router = APIRouter()

@router.get("/roi")
def get_fleet_roi(db: Session = Depends(get_db)):
    """
    Simplified ROI formula:
    (Revenue - (Maintenance + Fuel + Expenses)) / Acquisition Cost
    Assumes standard acquisition cost of $50,000 per vehicle and $1,000 revenue per completed trip.
    """
    total_maintenance = db.query(func.sum(MaintenanceLog.cost)).scalar() or 0.0
    total_fuel = db.query(func.sum(FuelLog.total_cost)).scalar() or 0.0
    total_expenses = db.query(func.sum(ExpenseLog.cost)).scalar() or 0.0
    
    # Use TripStatus enum (not a raw string) to avoid silent mismatch if enum values change
    total_trips = db.query(Trip).filter(Trip.status == TripStatus.COMPLETED).count()
    total_revenue = total_trips * 1000.0
    
    total_vehicles = db.query(Vehicle).count()
    if total_vehicles == 0:
        return {"roi_percentage": 0.0}
        
    total_acquisition_cost = total_vehicles * 50000.0  # mock value
    
    roi = (total_revenue - (total_maintenance + total_fuel + total_expenses)) / total_acquisition_cost
    return {"roi_percentage": round(roi * 100, 2)}


@router.get("/fuel-efficiency")
def get_fuel_efficiency(db: Session = Depends(get_db)):
    """
    Fuel Efficiency: km / L
    Computed by taking the difference between consecutive odometer_reading values
    per vehicle (sorted ascending), then summing all valid deltas.
    This avoids the bug of summing raw odometer values (which inflate results massively).
    """
    total_liters = db.query(func.sum(FuelLog.quantity_liters)).scalar() or 0.0
    
    if total_liters == 0:
        return {"fuel_efficiency_km_per_l": 0.0}

    # Get all fuel logs that have an odometer reading, grouped by vehicle
    fuel_logs = (
        db.query(FuelLog)
        .filter(FuelLog.odometer_reading.isnot(None))
        .order_by(FuelLog.vehicle_id, FuelLog.date, FuelLog.id)
        .all()
    )

    # Compute distance as sum of consecutive odometer deltas per vehicle
    total_distance = 0.0
    vehicle_logs: dict = {}
    for log in fuel_logs:
        vehicle_logs.setdefault(log.vehicle_id, []).append(log.odometer_reading)

    for readings in vehicle_logs.values():
        for i in range(1, len(readings)):
            delta = readings[i] - readings[i - 1]
            if delta > 0:
                total_distance += delta

    if total_distance == 0:
        return {"fuel_efficiency_km_per_l": 0.0}

    efficiency = total_distance / total_liters
    return {"fuel_efficiency_km_per_l": round(efficiency, 2)}


@router.get("/export")
def export_monthly_report(db: Session = Depends(get_db)):
    """Export fleet data as CSV for monthly payroll and health audits."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow(["Record Type", "Vehicle ID", "Cost/Value", "Date", "Details"])
    
    maintenance_logs = db.query(MaintenanceLog).all()
    for log in maintenance_logs:
        writer.writerow(["Maintenance", log.vehicle_id, log.cost, log.date.isoformat(), log.service_type])
        
    fuel_logs = db.query(FuelLog).all()
    for log in fuel_logs:
        writer.writerow(["Fuel", log.vehicle_id, log.total_cost, log.date.isoformat(), f"{log.quantity_liters}L"])

    expense_logs = db.query(ExpenseLog).all()
    for log in expense_logs:
        writer.writerow(["Expense", log.vehicle_id, log.cost, log.date.isoformat(), log.expense_type])
        
    output.seek(0)
    
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=monthly_fleet_report.csv"}
    )
