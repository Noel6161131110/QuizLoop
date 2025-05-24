from fastapi import APIRouter
from src.controller.MCQController import generate_mcq


router = APIRouter()


routes = [
    {
        "method": "POST",
        "name": "Generate MCQs",
        "path": "",
        "endpoint": generate_mcq
    }
]

for route in routes:
    router.add_api_route(route["path"], route["endpoint"], methods=[route["method"]], name=route["name"])