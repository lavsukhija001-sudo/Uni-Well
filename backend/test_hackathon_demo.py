import time
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_hackathon_demo_journey():
    print("=" * 60)
    print("RUNNING COMPLETE HACKATHON DEMO FLOW (PRD Section 46)")
    print("=" * 60)

    # Step 1: Student logs in
    print("\n[Step 1] Student logs in...")
    login_res = client.post("/api/auth/login", json={"email": "student@uni.edu", "password": "password123"})
    assert login_res.status_code == 200
    student_token = login_res.json()["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}
    print("-> Student authenticated:", login_res.json()["user"]["name"])

    # Step 2 & 3: Student writes description
    print("\n[Step 2 & 3] Student creates counselling request...")
    desc = "I've been struggling with academic pressure for the last few weeks. I can't concentrate properly and my sleep has become irregular."
    req_res = client.post(
        "/api/counselling/request",
        headers=student_headers,
        json={"subjective_response": desc, "concern_category": "academic_pressure"},
    )
    assert req_res.status_code == 200
    req_data = req_res.json()
    req_id = req_data["id"]
    print(f"-> Counselling request created: #{req_id}, status: {req_data['status']}")

    # Step 4: Complete questionnaire
    print("\n[Step 4] Fetching adaptive questionnaire and submitting answers...")
    q_res = client.get("/api/questionnaire?category=academic_pressure", headers=student_headers)
    assert q_res.status_code == 200
    questions = q_res.json()
    print(f"-> Fetched {len(questions)} base + adaptive questions")

    # Fill answers with 1 'Not Sure' to test Not Sure handling
    answers_payload = []
    for i, q in enumerate(questions):
        ans_val = "Not Sure" if i == 2 else ("Agree" if i < 4 else "Slightly Agree")
        answers_payload.append({"question_id": q["id"], "answer": ans_val})

    # Step 5: Submit questionnaire answers
    print("\n[Step 5] System receives submission and triggers background AI analysis...")
    submit_res = client.post(
        "/api/questionnaire/submit",
        headers=student_headers,
        json={"request_id": req_id, "answers": answers_payload},
    )
    assert submit_res.status_code == 200
    submit_data = submit_res.json()
    print("-> Response to student:", submit_data["message"])
    print("-> Expected response time shown to student:", submit_data["expected_response"])
    assert "urgent" not in submit_data["expected_response"].lower()
    assert "priority" not in submit_data
    print("-> VERIFIED: Internal clinical risk labels are NOT exposed to student!")

    # Verify student view of request
    status_res = client.get(f"/api/counselling/request/{req_id}", headers=student_headers)
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert "ai_assessment" not in status_data
    print("-> VERIFIED: Student cannot see AI internal assessment object!")

    # Step 6: Counsellor logs in
    print("\n[Step 6] Counsellor logs in...")
    counsellor_res = client.post("/api/auth/login", json={"email": "counsellor@uni.edu", "password": "password123"})
    assert counsellor_res.status_code == 200
    counsellor_token = counsellor_res.json()["token"]
    counsellor_headers = {"Authorization": f"Bearer {counsellor_token}"}
    print("-> Counsellor authenticated:", counsellor_res.json()["user"]["name"])

    # Check queue
    queue_res = client.get("/api/counsellor/queue", headers=counsellor_headers)
    assert queue_res.status_code == 200
    queue_data = queue_res.json()
    print(f"-> Queue updated: {queue_data['counts']['total']} requests in queue")

    # Step 7: Counsellor opens the student's request
    print(f"\n[Step 7] Counsellor opens request #{req_id}...")
    detail_res = client.get(f"/api/counsellor/request/{req_id}", headers=counsellor_headers)
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    print("-> Student Info:", detail_data["student"]["name"], f"({detail_data['student']['university_id']})")
    print("-> Original Student Text:", detail_data["subjective_response"])
    print("-> Questionnaire Answers loaded:", len(detail_data["questionnaire_answers"]))

    # Step 8: Counsellor reviews AI recommendation & overrides/confirms
    print("\n[Step 8] Counsellor reviews & updates priority...")
    p_update = client.put(
        f"/api/counsellor/request/{req_id}/priority",
        headers=counsellor_headers,
        json={"priority": "urgent", "reason": "Persistent insomnia and lab attendance anxiety confirmed."},
    )
    assert p_update.status_code == 200
    print("-> Priority confirmed as URGENT with clinical rationale")

    # Step 9: Counsellor schedules appointment
    print("\n[Step 9] Counsellor schedules appointment...")
    appt_res = client.post(
        f"/api/counsellor/request/{req_id}/appointment",
        headers=counsellor_headers,
        json={
            "date": "2026-09-23",
            "time": "02:30 PM",
            "location": "University Counselling Centre, Room 204",
            "meeting_link": None,
        },
    )
    assert appt_res.status_code == 200
    print("-> Appointment scheduled for 2026-09-23 at 02:30 PM")

    # Step 10 & 11: Student checks request status
    print("\n[Step 10 & 11] Student checks updated status...")
    updated_student_view = client.get(f"/api/counselling/request/{req_id}", headers=student_headers)
    assert updated_student_view.status_code == 200
    updated_data = updated_student_view.json()
    assert updated_data["status"] == "appointment_scheduled"
    assert updated_data["appointment"] is not None
    assert updated_data["appointment"]["date"] == "2026-09-23"
    assert updated_data["appointment"]["time"] == "02:30 PM"
    print("-> Student sees status: APPOINTMENT CONFIRMED!")
    print(f"-> Appointment with: {updated_data['appointment']['counsellor_name']} on {updated_data['appointment']['date']} at {updated_data['appointment']['time']}")

    # Notifications check
    notifs_res = client.get("/api/notifications", headers=student_headers)
    assert notifs_res.status_code == 200
    student_notifs = notifs_res.json()
    assert len(student_notifs) >= 2
    print(f"-> Student received {len(student_notifs)} notifications on portal!")

    print("\n" + "=" * 60)
    print("HACKATHON DEMO FLOW 100% COMPLETE AND VERIFIED! [SUCCESS]")
    print("=" * 60)

if __name__ == "__main__":
    test_hackathon_demo_journey()
