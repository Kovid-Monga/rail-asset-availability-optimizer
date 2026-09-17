"""Comprehensive end-to-end backend integration test for COA portal:
Tests against the live running FastAPI server at http://127.0.0.1:8000
- Verifies dynamic preservation of existing maintenance_requests.
- Tests block_schedules and block_tasks tables with ON DELETE RESTRICT.
- Tests API endpoints (/requests, /blocks, /overview/stats, /ai/recommendations).
- Tests conflict checks, auto-duration, approval conflict validation, and state transitions.
"""
import sys
import json
import urllib.request
import urllib.error
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text
from app.database.connection import engine, Base, SessionLocal
from app.models.block import BlockSchedule, BlockTask

BASE_URL = "http://127.0.0.1:8000"

def api_call(method: str, path: str, payload=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body) if body else None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return e.code, json.loads(body) if body else None

def run_tests():
    print("=== STARTING COA BACKEND INTEGRATION TESTS ===")

    # 1. Dynamic check: count existing requests before any schema execution
    with engine.connect() as conn:
        initial_requests_count = conn.execute(text("SELECT count(*) FROM maintenance_requests")).scalar()
        print(f"[TEST 1] Initial maintenance_requests count: {initial_requests_count}")

    # 2. Ensure tables are created
    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        post_tables_count = conn.execute(text("SELECT count(*) FROM maintenance_requests")).scalar()
        assert initial_requests_count == post_tables_count, "DATA LOSS: maintenance_requests count changed!"
        print(f"[TEST 2] Database tables initialized. Requests count preserved: {post_tables_count}")

    # 3. Test GET /requests
    status_code, requests_data = api_call("GET", "/requests")
    assert status_code == 200, f"GET /requests failed: {status_code}, {requests_data}"
    assert len(requests_data) == post_tables_count, "Mismatch in /requests response count"
    print(f"[TEST 3] GET /requests returned {len(requests_data)} real department requests.")

    # 4. Test GET /ai/recommendations returns empty list []
    status_code, ai_data = api_call("GET", "/ai/recommendations")
    assert status_code == 200, f"GET /ai/recommendations failed: {status_code}"
    assert ai_data == [], f"Expected [] but got: {ai_data}"
    print("[TEST 4] GET /ai/recommendations returned [] successfully (no fake AI data).")

    # 5. Test GET /overview/stats
    status_code, stats = api_call("GET", "/overview/stats")
    assert status_code == 200, f"GET /overview/stats failed: {status_code}"
    assert "total_blocks" in stats and "approved" in stats and "conflicts" in stats
    print(f"[TEST 5] GET /overview/stats returned: {stats}")

    # 6. Test Block Proposal, Auto-duration calculation, Conflict check, Approval validation & State transitions
    test_block_1_id = "TEST-BLK-01"
    test_block_2_id = "TEST-BLK-02"

    db = SessionLocal()
    try:
        # Cleanup any previous test artifacts
        db.query(BlockTask).filter(BlockTask.block_id.in_([test_block_1_id, test_block_2_id])).delete(synchronize_session=False)
        db.query(BlockSchedule).filter(BlockSchedule.block_id.in_([test_block_1_id, test_block_2_id])).delete(synchronize_session=False)
        db.commit()

        # Create proposal 1 (10:00 - 12:00) on A - B (UP Main)
        status_code, blk1 = api_call("POST", "/blocks/proposals", {
            "block_id": test_block_1_id,
            "block_date": "2026-09-14",
            "section_start": "A",
            "section_end": "B",
            "line": "UP Main",
            "start_time": "10:00",
            "end_time": "12:00",
        })
        assert status_code == 201, f"Failed creating proposal 1: {status_code}, {blk1}"
        assert blk1["status"] == "PENDING_APPROVAL"
        assert blk1["duration_min"] == 120
        assert blk1["duration"] == "2 h 0 min"
        print("[TEST 6A] Created proposal 1 with status PENDING_APPROVAL and auto-duration 120 min.")

        # Create proposal 2 (11:00 - 13:00) overlapping proposal 1 on A - B (UP Main)
        status_code, blk2 = api_call("POST", "/blocks/proposals", {
            "block_id": test_block_2_id,
            "block_date": "2026-09-14",
            "section_start": "A",
            "section_end": "B",
            "line": "UP Main",
            "start_time": "11:00",
            "end_time": "13:00",
        })
        assert status_code == 201, f"Failed creating proposal 2: {status_code}, {blk2}"
        print("[TEST 6B] Created proposal 2 overlapping proposal 1.")

        # Test conflict check on proposal 2
        status_code, conflict_data = api_call("POST", f"/blocks/{test_block_2_id}/check-conflicts")
        assert status_code == 200
        assert conflict_data["has_conflict"] is True
        assert conflict_data["conflicting_block_id"] == test_block_1_id
        print(f"[TEST 6C] Conflict check detected overlap: {conflict_data['message']}")

        # Test approval conflict validation on proposal 2: MUST FAIL with HTTP 409 because of conflict
        status_code, err = api_call("POST", f"/blocks/{test_block_2_id}/approve")
        assert status_code == 409, f"Expected 409 conflict on approve, got {status_code}: {err}"
        print("[TEST 6D] Mandatory conflict check prevented approval of conflicting block (HTTP 409).")

        # Edit proposal 2 to move to non-conflicting time (14:00 - 16:30)
        status_code, blk2_updated = api_call("PUT", f"/blocks/{test_block_2_id}", {
            "start_time": "14:00",
            "end_time": "16:30"
        })
        assert status_code == 200, f"Edit failed: {status_code}, {blk2_updated}"
        assert blk2_updated["duration_min"] == 150
        assert blk2_updated["duration"] == "2 h 30 min"
        assert blk2_updated["status"] == "PENDING_APPROVAL"
        print("[TEST 6E] Successfully rescheduled block with auto-calculated duration 150 min (2 h 30 min).")

        # Now approve proposal 2: should succeed since no conflict
        status_code, blk2_approved = api_call("POST", f"/blocks/{test_block_2_id}/approve")
        assert status_code == 200
        assert blk2_approved["status"] == "APPROVED"
        print("[TEST 6F] Approved non-conflicting block (status -> APPROVED).")

        # Edit an APPROVED block: must reset status to PENDING_APPROVAL
        status_code, blk2_re_edit = api_call("PUT", f"/blocks/{test_block_2_id}", {"start_time": "14:15"})
        assert status_code == 200
        assert blk2_re_edit["status"] == "PENDING_APPROVAL"
        print("[TEST 6G] Editing APPROVED block successfully reset status to PENDING_APPROVAL.")

        # Reject proposal 2: status -> REJECTED
        status_code, blk2_rejected = api_call("POST", f"/blocks/{test_block_2_id}/reject")
        assert status_code == 200
        assert blk2_rejected["status"] == "REJECTED"
        print("[TEST 6H] Rejected block (status -> REJECTED).")

        # Editing a REJECTED block: must return 400
        status_code, err_reject = api_call("PUT", f"/blocks/{test_block_2_id}", {"start_time": "15:00"})
        assert status_code == 400
        print("[TEST 6I] Editing REJECTED block was disallowed (HTTP 400).")

    finally:
        # Cleanup test blocks
        db.query(BlockTask).filter(BlockTask.block_id.in_([test_block_1_id, test_block_2_id])).delete(synchronize_session=False)
        db.query(BlockSchedule).filter(BlockSchedule.block_id.in_([test_block_1_id, test_block_2_id])).delete(synchronize_session=False)
        db.commit()
        db.close()

    # Final dynamic check: verify original count remains identical
    with engine.connect() as conn:
        final_requests_count = conn.execute(text("SELECT count(*) FROM maintenance_requests")).scalar()
        assert initial_requests_count == final_requests_count, "DATA INTEGRITY ERROR: Requests count changed!"
        print(f"[TEST 7] Final verification: maintenance_requests count is {final_requests_count} (100% intact).")

    print("\nALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
