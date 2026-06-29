from pypdf import PdfReader
import fitz  # PyMuPDF
import easyocr
import os

reader = easyocr.Reader(['en'], gpu=False)

def read_pdf(file_path):
    # Pehle normal text extraction try karo
    pdf = PdfReader(file_path)
    text = ""

    for page in pdf.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    # Agar text mil gaya to wahi return
    if text.strip():
        return text

    print("Scanned PDF detected. Running OCR...")

    doc = fitz.open(file_path)

    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=300)
        image_path = f"page_{i}.png"
        pix.save(image_path)

        result = reader.readtext(image_path, detail=0)
        text += "\n".join(result) + "\n"

        os.remove(image_path)

    return text