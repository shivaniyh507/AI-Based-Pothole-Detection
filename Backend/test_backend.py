import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestBackendEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_root_endpoint(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "online")

    def test_map_potholes_endpoint(self):
        res = self.client.get("/api/map/potholes")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(data["count"], 1)
        first = data["markers"][0]
        self.assertIn("lat", first)
        self.assertIn("lng", first)
        self.assertIn("severity", first)
        self.assertIn("upvotes", first)

    def test_map_plan_route(self):
        res = self.client.post("/api/map/plan-route", json={
            "origin": "Panki Industrial Area",
            "destination": "IIT Kanpur Campus"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("safest", data["routes"])
        self.assertIn("balanced", data["routes"])
        self.assertIn("fastest", data["routes"])

    def test_pothole_detail_and_upvote(self):
        # Fetch list to get a valid ID
        list_res = self.client.get("/api/reports")
        reports = list_res.json()["reports"]
        self.assertGreater(len(reports), 0)
        pothole_id = reports[0]["id"]

        # Test GET detail
        detail_res = self.client.get(f"/api/reports/{pothole_id}")
        self.assertEqual(detail_res.status_code, 200)
        detail_data = detail_res.json()
        self.assertTrue(detail_data["success"])
        initial_upvotes = detail_data["report"]["upvotes"]

        # Test POST upvote
        upvote_res = self.client.post(f"/api/reports/{pothole_id}/upvote")
        self.assertEqual(upvote_res.status_code, 200)
        upvote_data = upvote_res.json()
        self.assertTrue(upvote_data["success"])
        self.assertEqual(upvote_data["upvotes"], initial_upvotes + 1)

    def test_route_history_endpoints(self):
        # Test GET history
        get_res = self.client.get("/api/routes/history")
        self.assertEqual(get_res.status_code, 200)
        data = get_res.json()
        self.assertTrue(data["success"])
        self.assertGreaterEqual(data["count"], 1)

        # Test POST create history
        post_res = self.client.post("/api/routes/history", json={
            "trip_code": "TRIP-999",
            "origin_name": "Test Origin",
            "destination_name": "Test Destination",
            "distance_km": 15.5,
            "duration_min": 30,
            "potholes_avoided": 4,
            "safety_score": 96
        })
        self.assertEqual(post_res.status_code, 201)
        new_history = post_res.json()["history"]
        new_id = new_history["id"]

        # Test DELETE history
        del_res = self.client.delete(f"/api/routes/history/{new_id}")
        self.assertEqual(del_res.status_code, 200)

if __name__ == "__main__":
    unittest.main()
