from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes.v1Router import router as v1Router
import os, sys, uvicorn, asyncio
from dotenv import load_dotenv

load_dotenv()

sys.dont_write_bytecode = True


app = FastAPI(
    title="MyCloudy Backend Service",
    version="v1",
    description="Backend Service for MyCloudy Self-hostted Server",    
    )

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(v1Router, prefix="/api/v1")

async def main():
    """
    Main entry point to run the Uvicorn server.
    """
    config = uvicorn.Config(app, host='0.0.0.0')
    server = uvicorn.Server(config)

    # Run the server
    await server.serve()

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Server stopped by user.")