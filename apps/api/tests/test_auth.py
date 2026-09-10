from httpx import AsyncClient

CREDENTIALS = {
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "Str0ng!Pass",
    "accepted_terms": True,
}


async def test_signup_returns_a_usable_token(client: AsyncClient) -> None:
    signup = await client.post("/auth/signup", json=CREDENTIALS)
    assert signup.status_code == 201

    token = signup.json()["tokens"]["access_token"]
    me = await client.get("/users/me", headers={"Authorization": f"Bearer {token}"})

    assert me.status_code == 200
    assert me.json()["email"] == CREDENTIALS["email"]


async def test_signup_rejects_a_duplicate_email(client: AsyncClient) -> None:
    await client.post("/auth/signup", json={**CREDENTIALS, "email": "dupe@example.com"})
    again = await client.post("/auth/signup", json={**CREDENTIALS, "email": "dupe@example.com"})

    assert again.status_code == 409


async def test_login_rejects_a_wrong_password(client: AsyncClient) -> None:
    await client.post("/auth/signup", json={**CREDENTIALS, "email": "login@example.com"})
    response = await client.post(
        "/auth/login", json={"email": "login@example.com", "password": "Wr0ng!Pass"}
    )

    assert response.status_code == 401


async def test_weak_password_is_rejected(client: AsyncClient) -> None:
    response = await client.post(
        "/auth/signup", json={**CREDENTIALS, "email": "weak@example.com", "password": "password"}
    )

    assert response.status_code == 422


async def test_failed_logins_count_down_and_then_lock_out(client: AsyncClient) -> None:
    email = "lockout@example.com"
    await client.post("/auth/signup", json={**CREDENTIALS, "email": email})

    messages = []
    for _ in range(5):
        attempt = await client.post(
            "/auth/login", json={"email": email, "password": "Wr0ng!Pass", "remember_me": False}
        )
        assert attempt.status_code == 401
        messages.append(attempt.json()["detail"]["message"])

    assert "4 attempts remaining" in messages[0]
    assert "1 attempt remaining" in messages[3]
    assert "Too many failed attempts" in messages[4]

    locked = await client.post(
        "/auth/login",
        json={"email": email, "password": CREDENTIALS["password"], "remember_me": False},
    )
    assert locked.status_code == 401
    assert "Too many failed attempts" in locked.json()["detail"]["message"]


async def test_a_successful_login_is_recorded(client: AsyncClient) -> None:
    email = "recorded@example.com"
    await client.post("/auth/signup", json={**CREDENTIALS, "email": email})

    ok = await client.post(
        "/auth/login",
        json={"email": email, "password": CREDENTIALS["password"], "remember_me": False},
    )
    assert ok.status_code == 200
