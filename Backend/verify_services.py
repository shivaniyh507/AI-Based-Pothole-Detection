from app.config.database import SessionLocal, Base, engine
from app.models.pothole_report import PotholeReport
from app.models.route_history import RouteHistory
from app.services.route_service import calculate_route_options, calculate_nearby_potholes
from app.routes.map import get_potholes, plan_route, RoutePlanRequest
from app.routes.reports import get_report_by_id, upvote_report
from app.routes.route_history import get_route_history, create_route_history, RouteHistoryCreate

# Ensure DB initialized & seeded
Base.metadata.create_all(bind=engine)
from app.main import seed_demo_data
seed_demo_data()

db = SessionLocal()

print("--- 1. Testing Live Map Potholes Query ---")
res = get_potholes(status=None, severity=None, minLat=None, maxLat=None, minLng=None, maxLng=None, db=db)
print(f"Success: {res['success']}, Count: {res['count']}")
assert res['success'] == True
assert res['count'] >= 1
print("Sample Marker:", res['markers'][0])

print("\n--- 2. Testing Route Planner Engine ---")
plan_req = RoutePlanRequest(origin="Panki Industrial Area", destination="IIT Kanpur Campus")
plan_res = plan_route(payload=plan_req, db=db)
print(f"Success: {plan_res['success']}")
assert plan_res['success'] == True
assert "safest" in plan_res['routes']
assert "balanced" in plan_res['routes']
assert "fastest" in plan_res['routes']
print("Safest Route option:", plan_res['routes']['safest'])

print("\n--- 3. Testing Pothole Detail & Upvote API ---")
report_id = res['markers'][0]['id']
detail_res = get_report_by_id(report_id=report_id, db=db)
print("Initial Upvotes:", detail_res['report']['upvotes'])
upvote_res = upvote_report(report_id=report_id, db=db)
print("Updated Upvotes:", upvote_res['upvotes'])
assert upvote_res['upvotes'] == detail_res['report']['upvotes'] + 1

print("\n--- 4. Testing Route History APIs ---")
hist_res = get_route_history(search=None, limit=50, page=1, current_user=None, db=db)
print(f"History Count: {hist_res['count']}")
assert hist_res['success'] == True

new_trip = RouteHistoryCreate(
    trip_code="TRIP-900",
    origin_name="Mall Road",
    destination_name="Kanpur Central",
    distance_km=4.5,
    duration_min=12,
    potholes_avoided=2,
    safety_score=95
)
created_hist = create_route_history(payload=new_trip, current_user=None, db=db)
print("Created Trip History:", created_hist['history'])
assert created_hist['success'] == True

db.close()
print("\nALL BACKEND VERIFICATIONS PASSED SUCCESSFULLY!")
