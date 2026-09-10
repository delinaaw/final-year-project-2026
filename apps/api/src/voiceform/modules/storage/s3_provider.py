import aioboto3

from voiceform.core.config import settings


class S3StorageProvider:
    def __init__(self) -> None:
        self._session = aioboto3.Session()
        self._bucket = settings.s3_bucket
        self._kwargs = {
            "endpoint_url": settings.s3_endpoint_url or None,
            "region_name": settings.s3_region,
            "aws_access_key_id": settings.s3_access_key_id.get_secret_value(),
            "aws_secret_access_key": settings.s3_secret_access_key.get_secret_value(),
        }

    async def put(self, key: str, body: bytes, content_type: str) -> str:
        async with self._session.client("s3", **self._kwargs) as client:
            await client.put_object(
                Bucket=self._bucket, Key=key, Body=body, ContentType=content_type
            )
        return key

    async def get(self, key: str) -> bytes:
        async with self._session.client("s3", **self._kwargs) as client:
            obj = await client.get_object(Bucket=self._bucket, Key=key)
            return await obj["Body"].read()

    async def delete(self, key: str) -> None:
        async with self._session.client("s3", **self._kwargs) as client:
            await client.delete_object(Bucket=self._bucket, Key=key)

    async def presign_get(self, key: str, expires_in: int = 3600) -> str:
        async with self._session.client("s3", **self._kwargs) as client:
            return await client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self._bucket, "Key": key},
                ExpiresIn=expires_in,
            )

    async def presign_put(self, key: str, content_type: str, expires_in: int = 3600) -> str:
        async with self._session.client("s3", **self._kwargs) as client:
            return await client.generate_presigned_url(
                "put_object",
                Params={"Bucket": self._bucket, "Key": key, "ContentType": content_type},
                ExpiresIn=expires_in,
            )
