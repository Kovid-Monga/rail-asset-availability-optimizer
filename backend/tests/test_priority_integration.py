import os
import sys
from pathlib import Path

# Add backend to sys.path
backend_path = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_path))

from fastapi.testclient import TestClient
from app.main import app
from app.database.connection import SessionLocal
from app.models.request import MaintenanceRequest
from app.models.priority import PriorityResult
from app.services.priority_service import PriorityService

client = TestClient(app)

def run_tests():
    print("=== 1. TEST HIGH TRAFFIC CORRIDOR ===")
    payload_high = {
        "department": "TMS",
        "block_start": "LKO",
        "block_end": "MB",
        "line": "UP Main",
        "asset_impact": "High",
        "duration_min": 90,
        "due_date": "2026-09-20",
        "reason_code": "ETMW",
        "reason_description": "Track fracture detected near station causing immediate operational risk",
        "status": "SUBMITTED"
    }
    res_high = client.post("/requests", json=payload_high)
    assert res_high.status_code == 201, f"Failed: {res_high.text}"
    need_id_high = res_high.json()["need_id"]
    print(f"Created request #{need_id_high}")

    with SessionLocal() as db:
        pr_high = PriorityService.run_priority_analysis(need_id_high, db)
        assert pr_high is not None, "Priority analysis returned None"
        print(f"  Need #{need_id_high} -> Traffic: {pr_high.traffic}, Severity: {pr_high.predicted_severity}, Priority: {pr_high.priority_class}, Score: {pr_high.priority_score}")
        assert pr_high.traffic == "High", f"Expected High, got {pr_high.traffic}"
        assert pr_high.predicted_severity == "Critical", f"Expected Critical, got {pr_high.predicted_severity}"
        assert pr_high.priority_class == "Critical", f"Expected Critical, got {pr_high.priority_class}"
        assert pr_high.priority_score >= 80, f"Expected >= 80, got {pr_high.priority_score}"

    print("\n=== 2. TEST LOW TRAFFIC CORRIDOR & ROUTINE WORK ===")
    payload_low = {
        "department": "SMMS",
        "block_start": "NKLE",
        "block_end": "KWMD",
        "line": "Single",
        "asset_impact": "Low",
        "duration_min": 45,
        "due_date": "2026-10-15",
        "reason_code": "SSIG",
        "reason_description": "Routine scheduled inspection of signal lamp housing and wiring",
        "status": "SUBMITTED"
    }
    res_low = client.post("/requests", json=payload_low)
    assert res_low.status_code == 201, f"Failed: {res_low.text}"
    need_id_low = res_low.json()["need_id"]
    print(f"Created request #{need_id_low}")

    with SessionLocal() as db:
        pr_low = PriorityService.run_priority_analysis(need_id_low, db)
        assert pr_low is not None, "Priority analysis returned None"
        print(f"  Need #{need_id_low} -> Traffic: {pr_low.traffic}, Severity: {pr_low.predicted_severity}, Priority: {pr_low.priority_class}, Score: {pr_low.priority_score}")
        assert pr_low.traffic == "Low", f"Expected Low, got {pr_low.traffic}"
        assert pr_low.priority_score < 50, f"Expected low score, got {pr_low.priority_score}"

    print("\n=== 3. TEST INVALID STATIONS (ERROR HANDLING & NO FAKE DATA) ===")
    payload_inv = {
        "department": "TDMS",
        "block_start": "UNKNOWN_STN_A",
        "block_end": "UNKNOWN_STN_B",
        "asset_impact": "Medium",
        "duration_min": 60,
        "due_date": "2026-09-30",
        "status": "SUBMITTED"
    }
    res_inv = client.post("/requests", json=payload_inv)
    assert res_inv.status_code == 201
    need_id_inv = res_inv.json()["need_id"]
    with SessionLocal() as db:
        pr_inv = PriorityService.run_priority_analysis(need_id_inv, db)
        print(f"  Need #{need_id_inv} (Invalid Station) -> PriorityResult: {pr_inv} (Correct: no fake result created)")
        assert pr_inv is None, "Expected None for invalid stations"
        # Verify original request remains preserved
        orig_req = db.query(MaintenanceRequest).filter(MaintenanceRequest.need_id == need_id_inv).first()
        assert orig_req is not None
        assert orig_req.status == "SUBMITTED"

    print("\n=== 4. TEST GET /requests/{need_id}/priority ENDPOINT ===")
    res_pr_endpoint = client.get(f"/requests/{need_id_high}/priority")
    assert res_pr_endpoint.status_code == 200, f"Failed: {res_pr_endpoint.text}"
    data = res_pr_endpoint.json()
    print("  Priority endpoint payload:", data)
    assert data["need_id"] == need_id_high
    assert data["traffic"] == "High"
    assert data["priority_class"] == "Critical"

    # For the invalid request, priority endpoint must return 404 cleanly
    res_inv_endpoint = client.get(f"/requests/{need_id_inv}/priority")
    assert res_inv_endpoint.status_code == 404, f"Expected 404, got {res_inv_endpoint.status_code}"
    print(f"  Invalid request priority endpoint status: 404 ({res_inv_endpoint.json()['detail']})")

    print("\n=== 5. TEST GET /requests WITH EMBEDDED PRIORITY RESULTS ===")
    res_all = client.get("/requests?limit=10")
    assert res_all.status_code == 200
    all_reqs = res_all.json()
    print(f"  Total returned requests: {len(all_reqs)}")
    for r in all_reqs[:4]:
        pr_info = r.get("priority_result")
        pr_str = f"{pr_info['priority_class']} ({pr_info['priority_score']}pts)" if pr_info else "PENDING"
        print(f"    Request #{r['need_id']} ({r['department']}) [{r['block_start']} - {r['block_end']}]: {pr_str}")

    print("\n=== 6. VERIFY EXISTING BLOCK & OVERVIEW ENDPOINTS ===")
    res_blocks = client.get("/blocks")
    assert res_blocks.status_code == 200
    print(f"  GET /blocks: 200 OK (count={len(res_blocks.json())})")

    res_stats = client.get("/overview/stats")
    assert res_stats.status_code == 200
    print(f"  GET /overview/stats: 200 OK ({res_stats.json()})")

    print("\n>>> ALL TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    run_tests()
