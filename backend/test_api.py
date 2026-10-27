import asyncio
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_all():
    print("Testing Root & Health...")
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["status"] == "online"

    print("Testing Student Login...")
    r = client.post("/api/auth/login", json={"email": "student@uni.edu", "password": "password123"})
    assert r.status_code == 200, r.text
    student_token = r.json()["token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    print("Testing Counsellor Login...")
    r = client.post("/api/auth/login", json={"email": "counsellor@uni.edu", "password": "password123"})
    assert r.status_code == 200, r.text
    counsellor_token = r.json()["token"]
    counsellor_headers = {"Authorization": f"Bearer {counsellor_token}"}

    print("Testing Student Profile...")
    r = client.get("/api/student/profile", headers=student_headers)
    assert r.status_code == 200, r.text
    assert r.json()["university_id"] == "STU-2024-8821"

    print("Testing Student Dashboard...")
    r = client.get("/api/student/dashboard", headers=student_headers)
    assert r.status_code == 200, r.text

    print("Testing Questionnaire Bank...")
    r = client.get("/api/questionnaire?category=academic_pressure", headers=student_headers)
    assert r.status_code == 200, r.text
    questions = r.json()
    assert len(questions) >= 8
    print(f"Loaded {len(questions)} questions (including adaptive)")

    print("Testing Support Groups...")
    r = client.get("/api/groups", headers=student_headers)
    assert r.status_code == 200, r.text
    groups = r.json()
    assert len(groups) >= 3
    first_group_id = groups[0]["id"]

    print("Testing Join Group...")
    r = client.post(f"/api/groups/{first_group_id}/join", headers=student_headers)
    assert r.status_code == 200, r.text

    print("Testing Counsellor Queue...")
    r = client.get("/api/counsellor/queue", headers=counsellor_headers)
    assert r.status_code == 200, r.text
    queue = r.json()
    assert queue["counts"]["total"] >= 4
    print(f"Counsellor Queue Counts: {queue['counts']}")

    print("Testing Analytics...")
    r = client.get("/api/analytics/overview", headers=counsellor_headers)
    assert r.status_code == 200, r.text
    analytics = r.json()
    assert analytics["total_requests"] >= 4
    print(f"Analytics: {analytics['total_requests']} total requests, by priority: {analytics['by_priority']}")

    print("Testing Chatbot...")
    r = client.post("/api/chat", json={"message": "I am feeling stressed about my upcoming exams"})
    assert r.status_code == 200, r.text
    chat_resp = r.json()
    assert "response" in chat_resp
    print(f"Chatbot response received: {chat_resp['response'][:60]}...")

    print("Testing Chatbot Crisis Detection...")
    r = client.post("/api/chat", json={"message": "I feel like I want to die and hurt myself"})
    assert r.status_code == 200, r.text
    chat_crisis = r.json()
    assert "988" in chat_crisis["response"]
    assert chat_crisis["resources_suggested"] is True
    print("Chatbot correctly triggered emergency crisis response!")

    print("\nALL BACKEND API TESTS PASSED SUCCESSFULLY! [SUCCESS]")

if __name__ == "__main__":
    test_all()
