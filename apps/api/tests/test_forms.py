from httpx import AsyncClient


async def authenticate(client: AsyncClient, email: str) -> dict[str, str]:
    response = await client.post(
        "/auth/signup",
        json={
            "full_name": "Owner",
            "email": email,
            "password": "Str0ng!Pass",
            "accepted_terms": True,
        },
    )
    token = response.json()["tokens"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


async def test_create_and_list_forms(client: AsyncClient) -> None:
    headers = await authenticate(client, "forms@example.com")

    created = await client.post("/forms", json={"title": "Survey"}, headers=headers)
    assert created.status_code == 201

    listed = await client.get("/forms", headers=headers)
    assert listed.status_code == 200
    assert [form["title"] for form in listed.json()] == ["Survey"]


async def test_publishing_without_questions_is_refused(client: AsyncClient) -> None:
    headers = await authenticate(client, "publish@example.com")
    form = (await client.post("/forms", json={"title": "Empty"}, headers=headers)).json()

    response = await client.post(f"/forms/{form['id']}/publish", json={}, headers=headers)

    assert response.status_code == 422
    assert "at least one question" in response.json()["detail"]["message"]


async def test_a_form_is_private_to_its_owner(client: AsyncClient) -> None:
    owner = await authenticate(client, "owner@example.com")
    form = (await client.post("/forms", json={"title": "Private"}, headers=owner)).json()

    intruder = await authenticate(client, "intruder@example.com")
    response = await client.get(f"/forms/{form['id']}", headers=intruder)

    assert response.status_code == 403


async def test_a_draft_can_be_previewed_by_its_owner(client: AsyncClient) -> None:
    headers = await authenticate(client, "previewowner@example.com")

    form = (await client.post("/forms", json={"title": "Draft"}, headers=headers)).json()
    await client.post(
        f"/forms/{form['id']}/questions",
        json={"type": "short_answer", "prompt": "Your name?", "is_required": True},
        headers=headers,
    )

    public = await client.get(f"/public/forms/{form['slug']}")
    assert public.status_code == 404

    preview = await client.get(f"/forms/{form['id']}/preview", headers=headers)
    assert preview.status_code == 200

    body = preview.json()
    assert body["title"] == "Draft"
    assert [question["prompt"] for question in body["questions"]] == ["Your name?"]


async def test_a_draft_preview_is_private_to_its_owner(client: AsyncClient) -> None:
    owner = await authenticate(client, "previewmine@example.com")
    stranger = await authenticate(client, "previewtheirs@example.com")

    form = (await client.post("/forms", json={"title": "Mine"}, headers=owner)).json()

    assert (await client.get(f"/forms/{form['id']}/preview")).status_code == 401
    assert (await client.get(f"/forms/{form['id']}/preview", headers=stranger)).status_code == 403
