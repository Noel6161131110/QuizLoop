from src.controller.STTController import uploadFile
from fastapi import APIRouter

router = APIRouter()


routes = [
    {
        "method": "POST",
        "name": "Transcribe Audio",
        "path": "",
        "endpoint": uploadFile
    }
]

for route in routes:
    router.add_api_route(route["path"], route["endpoint"], methods=[route["method"]], name=route["name"])