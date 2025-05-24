from fastapi import APIRouter
from src.routes.v1.MCQRoutes import router as MCQRouter
from src.routes.v1.STTRoutes import router as STTRouter


router = APIRouter()

router.include_router(MCQRouter, prefix="/mcq", tags=["MCQ"])
router.include_router(STTRouter, prefix="/stt", tags=["STT"])