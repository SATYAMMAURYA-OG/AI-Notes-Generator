from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from groq import Groq
from pdf_reader import read_pdf
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(
    api_key=os.getenv("GROQ_API_KEY"),
)


def create_pdf(notes):
    pdf_path = "generated_notes.pdf"

    c = canvas.Canvas(pdf_path, pagesize=letter)

    width, height = letter
    y = height - 40

    for line in notes.split("\n"):
        if y < 40:
            c.showPage()
            y = height - 40

        c.drawString(40, y, line[:100])
        y -= 18

    c.save()

    return pdf_path


@app.get("/")
def home():
    return {"message": "AI Notes Generator 🚀"}


@app.get("/test-ai")
def test_ai():
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": "Say Hello Satyam!"
            }
        ]
    )

    return {
        "response": response.choices[0].message.content
    }
@app.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    study_mode: str = Form("notes"),
):
    print("Study Mode:", study_mode)
    file_path = file.filename

    with open(file_path, "wb") as f:
        f.write(await file.read())

    text = read_pdf(file_path)

    print("Text Length:", len(text))

    chunk_size = 6000

    chunks = [
        text[i:i + chunk_size]
        for i in range(0, len(text), chunk_size)
    ]

    all_notes = []

    for index, chunk in enumerate(chunks):
        print(f"Processing chunk {index + 1}/{len(chunks)}")

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert study notes generator."
                },
                {
                    "role": "user",
                    "content": f"""
Generate {study_mode} from the following text.

Rules:

If study_mode == "notes":
Create detailed study notes with headings and bullet points.

If study_mode == "summary":
Create a short summary in easy language.

If study_mode == "quiz":
Generate 10 quiz questions with answers.

If study_mode == "flashcards":
Generate flashcards in Question -> Answer format.

If study_mode == "viva":
Generate important viva questions with answers.

Text:

{chunk}
"""
                }
            ]
        )

        all_notes.append(response.choices[0].message.content)

    final_notes = "\n\n".join(all_notes)

    create_pdf(final_notes)

    return {
        "notes": final_notes,
        "pdf_url": "http://127.0.0.1:8000/download-pdf"
    }


@app.get("/download-pdf")
def download_pdf():
    return FileResponse(
        "generated_notes.pdf",
        media_type="application/pdf",
        filename="AI_Notes.pdf"
    )