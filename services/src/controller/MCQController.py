import ollama
from fastapi.responses import JSONResponse
from src.schems.MCQSchemas import *
import json

def generate_mcq(req: MCQSchema):
    try:
        prompt = f"""You are an assistant that ONLY outputs valid JSON. No extra text, no explanations.

        From the transcript below, generate up to {req.noOfMCQs} multiple-choice questions.

        Each question must have 3 or 4 options, and exactly one correct answer.

        The JSON output must include the `"answer"` field for every question, and the answer must be one of the `"options"`.

        Return JSON exactly in this format:

        {{
        "result": [
            {{
            "question": "string",
            "options": ["string", "string", "string", "string"],
            "answer": "string"
            }}
        ]
        }}

        Transcript:
        \"\"\"
        {req.transcript}
        \"\"\"
        """

        stream = ollama.chat(
            model="llama2:latest",
            messages=[
                {"role": "user", "content": prompt},
            ]
        )

        response_text = ""
        for chunk in stream:
            if isinstance(chunk, tuple) and chunk[0] == "message":
                message = chunk[1]
                content = getattr(message, "content", "")
                response_text += content

        try:
            start = response_text.find('{')
            end = response_text.rfind('}') + 1
            if start != -1 and end != -1:
                json_str = response_text[start:end]
            else:
                json_str = response_text

            parsed = json.loads(json_str)
            return JSONResponse(content=parsed, status_code=200)
        except json.JSONDecodeError as e:
            print("JSON decode error:", e)
            print("Raw response:", response_text)
            return JSONResponse(content={"error": "Failed to parse model response as JSON", "raw": response_text}, status_code=500)
    except Exception as e:
        print(f"Error generating MCQ: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)