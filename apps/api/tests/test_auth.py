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
