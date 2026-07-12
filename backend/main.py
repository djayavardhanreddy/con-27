import os
import jwt
import datetime
from typing import List, Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
import pandas as pd
import io

# ReportLab imports for PDF generation
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwttokenkey987654321!")
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = "admin@con27.org"
ADMIN_PASSWORD = "password123"  # Standard default matching seed

# Ensure upload directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="con-27 Python API", version="1.0.0")

# Enable CORS for frontend web server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads folder
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- SCHEMAS ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ExportDataRequest(BaseModel):
    data: List[dict]

# --- HELPERS ---
def create_token(email: str) -> str:
    payload = {
        "sub": email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload["sub"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token or expired session")

# --- ENDPOINTS ---

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "con-27-python-api"}

@app.post("/api/auth/login")
def login(payload: LoginRequest):
    if payload.email == ADMIN_EMAIL and payload.password == ADMIN_PASSWORD:
        token = create_token(payload.email)
        return {
            "token": token,
            "user": {
                "name": "Administrator",
                "email": payload.email,
                "role": "ADMIN"
            }
        }
    raise HTTPException(status_code=401, detail="Invalid email or password")

@app.post("/api/abstracts/upload")
async def upload_abstract(file: UploadFile = File(...)):
    filename = file.filename
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ["pdf", "doc", "docx"]:
        raise HTTPException(status_code=400, detail="Only PDF, DOC, or DOCX files are allowed.")
    
    # Save the file locally using a secure timestamped filename to prevent naming collisions
    safe_filename = f"{int(datetime.datetime.utcnow().timestamp())}_{filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    return {
        "filePath": f"uploads/{safe_filename}",
        "fileName": filename
    }

@app.post("/api/reports/registrations/excel")
def export_registrations_excel(payload: ExportDataRequest, user: str = Depends(verify_token)):
    if not payload.data:
        raise HTTPException(status_code=400, detail="No data provided for export")
        
    df = pd.DataFrame(payload.data)
    
    # Select and order columns for display
    cols_map = {
        "id": "Registration ID",
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "country": "Country",
        "package": "Package Plan",
        "amount": "Paid Amount ($)",
        "paymentMethod": "Payment Method",
        "status": "Payment Status",
        "createdAt": "Registered At"
    }
    
    # Filter only keys that exist in the dataframe
    df = df[[col for col in cols_map.keys() if col in df.columns]]
    df.rename(columns=cols_map, inplace=True)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Registrations", index=False)
        
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=gnc2027_registrations.xlsx"}
    )

@app.post("/api/reports/registrations/pdf")
def export_registrations_pdf(payload: ExportDataRequest, user: str = Depends(verify_token)):
    if not payload.data:
        raise HTTPException(status_code=400, detail="No data provided for export")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=landscape(letter),
        rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30
    )
    
    styles = getSampleStyleSheet()
    story = []

    # Custom Header Style
    title_style = ParagraphStyle(
        'PDFTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=22,
        textColor=colors.HexColor('#0c1a30'),
        spaceAfter=15
    )
    story.append(Paragraph("Global Nursing Conference 2027 - Registrations Report", title_style))
    story.append(Spacer(1, 10))

    # Construct Grid Table Data
    table_data = [["Name", "Email", "Phone", "Country", "Package", "Amount", "Method", "Status"]]
    for item in payload.data:
        table_data.append([
            str(item.get("name", "")),
            str(item.get("email", "")),
            str(item.get("phone", "")),
            str(item.get("country", "")),
            str(item.get("package", "")),
            f"${item.get('amount', 0)}",
            str(item.get("paymentMethod", "")),
            str(item.get("status", ""))
        ])

    # Table Layout Styling
    t = Table(table_data, colWidths=[100, 140, 90, 80, 80, 60, 80, 70])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0c1a30')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    story.append(t)
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=gnc2027_registrations.pdf"}
    )

@app.post("/api/reports/abstracts/excel")
def export_abstracts_excel(payload: ExportDataRequest, user: str = Depends(verify_token)):
    if not payload.data:
        raise HTTPException(status_code=400, detail="No data provided for export")
        
    df = pd.DataFrame(payload.data)
    
    cols_map = {
        "id": "Abstract ID",
        "prefix": "Salutation",
        "name": "Presenter Name",
        "email": "Email Address",
        "phone": "Phone Number",
        "profession": "Profession",
        "country": "Country",
        "title": "Abstract Paper Title",
        "fileName": "Submitted File Name",
        "status": "Review Status",
        "createdAt": "Submitted At"
    }
    
    df = df[[col for col in cols_map.keys() if col in df.columns]]
    df.rename(columns=cols_map, inplace=True)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, sheet_name="Abstracts", index=False)
        
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=gnc2027_abstracts.xlsx"}
    )

@app.post("/api/reports/abstracts/pdf")
def export_abstracts_pdf(payload: ExportDataRequest, user: str = Depends(verify_token)):
    if not payload.data:
        raise HTTPException(status_code=400, detail="No data provided for export")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=landscape(letter),
        rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30
    )
    
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        'PDFTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=22,
        textColor=colors.HexColor('#0c1a30'),
        spaceAfter=15
    )
    story.append(Paragraph("Global Nursing Conference 2027 - Abstract Submissions", title_style))
    story.append(Spacer(1, 10))

    # Construct Grid Table Data
    table_data = [["Presenter", "Email", "Phone", "Profession", "Country", "Paper Title", "Status"]]
    for item in payload.data:
        # Wrap paper title to prevent text clipping
        title_para = Paragraph(str(item.get("title", "")), styles['BodyText'])
        table_data.append([
            f"{item.get('prefix', '')} {item.get('name', '')}",
            str(item.get("email", "")),
            str(item.get("phone", "")),
            str(item.get("profession", "")),
            str(item.get("country", "")),
            title_para,
            str(item.get("status", ""))
        ])

    t = Table(table_data, colWidths=[110, 110, 80, 80, 80, 170, 70])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0c1a30')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f8fafc'), colors.white]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    story.append(t)
    doc.build(story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=gnc2027_abstracts.pdf"}
    )
