from collections.abc import AsyncIterator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from voiceform.core.config import settings
from voiceform.core.database import get_session
from voiceform.db.base import Base
from voiceform.main import app

TEST_DATABASE_URL = str(settings.database_url).rsplit("/", 1)[0] + "/voiceform_test"


@pytest.fixture(scope="session")
async def engine() -> AsyncIterator:
    admin = create_async_engine(str(settings.database_url), isolation_level="AUTOCOMMIT")
    async with admin.connect() as connection:
        await connection.exec_driver_sql("DROP DATABASE IF EXISTS voiceform_test")
        await connection.exec_driver_sql("CREATE DATABASE voiceform_test")
    await admin.dispose()

    test_engine = create_async_engine(TEST_DATABASE_URL)
    async with test_engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    yield test_engine
    await test_engine.dispose()


@pytest.fixture
async def session(engine) -> AsyncIterator[AsyncSession]:
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with factory() as db:
        yield db
        await db.rollback()


@pytest.fixture
async def client(session: AsyncSession) -> AsyncIterator[AsyncClient]:
    app.dependency_overrides[get_session] = lambda: session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test/v1") as http:
        yield http
    app.dependency_overrides.clear()
