from httpx import AsyncClient


async def publish_form(client: AsyncClient, email: str) -> str:
    signup = await client.post(
        "/auth/signup",
        json={
            "full_name": "Creator",
            "email": email,
            "password": "Str0ng!Pass",
            "accepted_terms": True,
        },
    )
    headers = {"Authorization": f"Bearer {signup.json()['tokens']['access_token']}"}

    form = (await client.post("/forms", json={"title": "Survey"}, headers=headers)).json()
    await client.post(
        f"/forms/{form['id']}/questions",
        json={"type": "short_answer", "prompt": "Your name?", "is_required": True},
        headers=headers,
    )
    published = await client.post(f"/forms/{form['id']}/publish", json={}, headers=headers)
    assert published.status_code == 200, published.text
    return published.json()["form"]["slug"]


async def test_a_draft_form_is_not_public(client: AsyncClient) -> None:
    signup = await client.post(
        "/auth/signup",
        json={
            "full_name": "Creator",
            "email": "draft@example.com",
            "password": "Str0ng!Pass",
            "accepted_terms": True,
        },
    )
    headers = {"Authorization": f"Bearer {signup.json()['tokens']['access_token']}"}
    form = (await client.post("/forms", json={"title": "Draft"}, headers=headers)).json()

    response = await client.get(f"/public/forms/{form['slug']}")

    assert response.status_code == 404


async def test_submitting_without_required_answers_is_refused(client: AsyncClient) -> None:
    slug = await publish_form(client, "required@example.com")
    started = await client.post(f"/public/forms/{slug}/responses", json={"respondent_key": "d1"})
    response_id = started.json()["id"]

    response = await client.post(
        f"/public/forms/{slug}/responses/{response_id}/submit", json={}
    )

    assert response.status_code == 422
    assert "required" in response.json()["detail"]["message"]


async def test_a_full_response_can_be_submitted(client: AsyncClient) -> None:
    slug = await publish_form(client, "full@example.com")
    form = (await client.get(f"/public/forms/{slug}")).json()
    started = await client.post(f"/public/forms/{slug}/responses", json={"respondent_key": "d2"})
    response_id = started.json()["id"]

    await client.put(
        f"/public/forms/{slug}/responses/{response_id}/answers",
        json={
            "question_id": form["questions"][0]["id"],
            "input_mode": "text",
            "text_value": "Ada",
        },
    )
    submitted = await client.post(
        f"/public/forms/{slug}/responses/{response_id}/submit", json={"duration_seconds": 30}
    )

    assert submitted.status_code == 200
    assert submitted.json()["status"] == "submitted"


async def test_an_option_from_another_question_is_rejected(client: AsyncClient) -> None:
    slug = await publish_form(client, "options@example.com")
    form = (await client.get(f"/public/forms/{slug}")).json()
    started = await client.post(f"/public/forms/{slug}/responses", json={"respondent_key": "d3"})

    response = await client.put(
        f"/public/forms/{slug}/responses/{started.json()['id']}/answers",
        json={
            "question_id": form["questions"][0]["id"],
            "input_mode": "text",
            "selected_option_ids": [form["id"]],
        },
    )

    assert response.status_code == 422
