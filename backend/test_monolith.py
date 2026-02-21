import traceback
import os
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from jose import jwt
from dotenv import load_dotenv
from app.main import app

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY", "fleetflow-auth-secret-key-changeme")

def make_test_token():
    payload = {
        "sub": "test@fleetflow.com",
        "role": "Manager",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

print("Initializing TestClient for the Modular Monolith...")
try:
    client = TestClient(app=app)
    token = make_test_token()
    auth_headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Test Root Health (no auth required)
    res_health = client.get("/health")
    print(f"Health Check: {res_health.status_code} - {res_health.json()}")
    assert res_health.status_code == 200

    # 2. Verify 401 without token
    res_unauth = client.get("/api/v1/dashboard/stats")
    print(f"No-Token Dashboard (expect 401): {res_unauth.status_code}")
    assert res_unauth.status_code == 401, f"Expected 401, got {res_unauth.status_code}"

    # 3. Test Centralized Dashboard Route with token
    res_dash = client.get("/api/v1/dashboard/stats", headers=auth_headers)
    print(f"Dashboard Stats: {res_dash.status_code} - {res_dash.json()}")
    assert res_dash.status_code == 200
    
    # 4. Test Centralized Vehicle Registry Route with token
    res_vehicles = client.get("/api/v1/registry/vehicles/", headers=auth_headers)
    print(f"Vehicle Registry (Empty DB): {res_vehicles.status_code} - {res_vehicles.json()}")
    assert res_vehicles.status_code == 200
    
    print("\nSUCCESS! All monolith endpoints are available and correctly enforce JWT auth.")

except Exception as e:
    print(f"Modular monolith test failed: {e}")
    traceback.print_exc()
