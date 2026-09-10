from fastapi import APIRouter

from voiceform.modules.auth.router import router as auth_router
from voiceform.modules.forms.router import router as forms_router
from voiceform.modules.health.router import router as health_router
from voiceform.modules.questions.router import router as questions_router
from voiceform.modules.responses.router import router as responses_router
from voiceform.modules.speech.router import router as speech_router
from voiceform.modules.users.router import router as users_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(forms_router)
api_router.include_router(questions_router)
api_router.include_router(responses_router)
api_router.include_router(speech_router)
