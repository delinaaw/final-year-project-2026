from arq.connections import RedisSettings

from voiceform.core.config import settings
from voiceform.workers.tasks import (
    deliver_response_digests,
    export_responses_csv,
    pregenerate_form_audio,
    purge_expired_tokens,
    transcribe_recording,
)


class WorkerSettings:
    redis_settings = RedisSettings.from_dsn(str(settings.redis_url))
    functions = [
        transcribe_recording,
        pregenerate_form_audio,
        export_responses_csv,
        deliver_response_digests,
    ]
    cron_jobs = [purge_expired_tokens]
    max_jobs = 20
    job_timeout = 300
