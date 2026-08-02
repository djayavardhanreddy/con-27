import os
import jwt
import datetime
import json
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional, Dict
from fastapi import FastAPI, HTTPException, UploadFile, File, Depends, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel, EmailStr
import pandas as pd
import io
from a2wsgi import ASGIMiddleware

# Load .env variables manually if not already set
def load_dotenv_file(filepath=".env"):
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip('"').strip("'")
                    os.environ[key] = val

# Try loading from standard paths
load_dotenv_file(".env")
load_dotenv_file("backend/.env")

# ReportLab imports for PDF generation
from reportlab.lib.pagesizes import letter, landscape
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "supersecretjwttokenkey987654321!")
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = "admin@con27.org"
ADMIN_PASSWORD = "password123"

# SMTP Configuration
SMTP_HOST = os.getenv("SMTP_HOST", "")
try:
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
except ValueError:
    SMTP_PORT = 587
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "nursing@syntrophyglobalconferences.com")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Syntrophy Conferences")
ADMIN_NOTIFICATION_EMAIL = os.getenv("ADMIN_NOTIFICATION_EMAIL", "nursing@syntrophyglobalconferences.com")

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

DB_FILE = "db.json"

# Seed Data
DEFAULT_SPEAKERS = [
    {
        "id": "sp1",
        "name": "Dr. Evelyn Carter",
        "designation": "Lead Researcher, Healthcare Informatics",
        "organization": "MIT Research Labs",
        "country": "United States",
        "imagePath": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400",
        "bio": "Dr. Evelyn Carter is a pioneer in clinical health informatics. Her research focuses on integrating IoMT devices with EHRs to enhance bedside nursing protocols.",
        "twitter": "https://twitter.com",
        "linkedin": "https://linkedin.com",
        "order": 1,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "sp2",
        "name": "Prof. Giovanni Rossi",
        "designation": "Director of Cardiology & Nursing Care",
        "organization": "Sapienza University of Rome",
        "country": "Italy",
        "imagePath": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400",
        "bio": "Prof. Rossi has over 25 years of experience in cardiac patient recovery. He is a primary consultant for emergency response and global healthcare security programs in Europe.",
        "twitter": "https://twitter.com",
        "linkedin": "https://linkedin.com",
        "order": 2,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "sp3",
        "name": "Dr. Sarah Jenkins",
        "designation": "Consultant in Midwifery & Neonatal Care",
        "organization": "King's College London",
        "country": "United Kingdom",
        "imagePath": "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=400",
        "bio": "Dr. Jenkins focuses on maternal and child health milestones, advocating for primary midwife leadership roles in rural and underserved community clinics.",
        "twitter": "https://twitter.com",
        "linkedin": "https://linkedin.com",
        "order": 3,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "sp4",
        "name": "Amina Al-Mansoor",
        "designation": "Lead Advisor on Global Health Policy",
        "organization": "World Health Organization (WHO)",
        "country": "Switzerland",
        "imagePath": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
        "bio": "Amina Al-Mansoor leads advocacy initiatives for nurses worldwide. Her work promotes policy updates to support green nursing and environmental sustainability in hospital environments.",
        "twitter": "https://twitter.com",
        "linkedin": "https://linkedin.com",
        "order": 4,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    }
]

DEFAULT_AGENDA = [
    {
        "id": "ag1",
        "day": 1,
        "timeSlot": "08:00 AM - 09:00 AM",
        "title": "Registration & Welcome Coffee",
        "description": "Pick up your conference badges, credentials, and brochure material at the main entrance lobby.",
        "speakerName": "",
        "location": "Lobby & Exhibition Hall",
        "type": "BREAK",
        "order": 1,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag2",
        "day": 1,
        "timeSlot": "09:00 AM - 09:30 AM",
        "title": "Inaugural Ceremony & Opening Address",
        "description": "Welcoming remarks and overview of the main theme: \"Nex-Gen Nursing: Trends, Techs, Triumphs in Global Health\".",
        "speakerName": "Conference Chairman",
        "location": "Main Auditorium (Hall A)",
        "type": "KEYNOTE",
        "order": 2,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag3",
        "day": 1,
        "timeSlot": "09:30 AM - 10:30 AM",
        "title": "Keynote Session: The Internet of Medical Things (IoMT) in Modern Bedside Care",
        "description": "How smart wearable monitors, automated drug dispensers, and real-time trackers are transforming intensive nursing care.",
        "speakerName": "Dr. Evelyn Carter",
        "location": "Main Auditorium (Hall A)",
        "type": "KEYNOTE",
        "order": 3,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag4",
        "day": 1,
        "timeSlot": "10:30 AM - 11:00 AM",
        "title": "Morning Networking Coffee Break",
        "description": "Coffee, tea, and local Italian pastries in the exhibition area.",
        "speakerName": "",
        "location": "Exhibition Hall",
        "type": "BREAK",
        "order": 4,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag5",
        "day": 1,
        "timeSlot": "11:00 AM - 12:30 PM",
        "title": "Panel Discussion: Cybersecurity, Data Privacy, and AI in Healthcare Systems",
        "description": "Balancing digital convenience with patient confidentiality. Discussing best practices under global security laws.",
        "speakerName": "Dr. Evelyn Carter, Amina Al-Mansoor, Prof. Giovanni Rossi",
        "location": "Main Auditorium (Hall A)",
        "type": "PANEL",
        "order": 5,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag6",
        "day": 1,
        "timeSlot": "12:30 PM - 01:30 PM",
        "title": "Networking Buffet Lunch",
        "description": "Complimentary buffet lunch serving fine Italian cuisine.",
        "speakerName": "",
        "location": "Dining Lounge",
        "type": "BREAK",
        "order": 6,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag7",
        "day": 1,
        "timeSlot": "01:30 PM - 03:00 PM",
        "title": "Track A: Green Nursing & Healthcare Sustainability",
        "description": "Examining hospital recycling, reduction of plastic waste, and ecological pathways to nursing practice.",
        "speakerName": "Amina Al-Mansoor",
        "location": "Seminar Room B",
        "type": "SESSION",
        "order": 7,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag8",
        "day": 1,
        "timeSlot": "03:00 PM - 04:30 PM",
        "title": "Track B: Mental Health & Well-being of Nurses",
        "description": "Addressing clinical burnout, mindfulness exercises, administrative support networks, and nurse advocacy.",
        "speakerName": "Prof. Giovanni Rossi",
        "location": "Seminar Room C",
        "type": "SESSION",
        "order": 8,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag9",
        "day": 2,
        "timeSlot": "09:00 AM - 10:30 AM",
        "title": "Keynote Session: Maternal & Child Health Milestones & Primary Care Delivery",
        "description": "New guidelines in neonatology, prenatal nutrition, and maternal nursing leads in primary care communities.",
        "speakerName": "Dr. Sarah Jenkins",
        "location": "Main Auditorium (Hall A)",
        "type": "KEYNOTE",
        "order": 1,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag10",
        "day": 2,
        "timeSlot": "10:30 AM - 11:00 AM",
        "title": "Morning Coffee Break",
        "description": "Mid-morning refreshments and poster presentations review.",
        "speakerName": "",
        "location": "Exhibition Hall",
        "type": "BREAK",
        "order": 2,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag11",
        "day": 2,
        "timeSlot": "11:00 AM - 12:30 PM",
        "title": "Oral Presentations: Scaling Local Innovations in Nursing Practice",
        "description": "Presentations by selected researchers displaying nurse-led innovations from 15+ countries.",
        "speakerName": "Various Researchers",
        "location": "Main Auditorium (Hall A)",
        "type": "SESSION",
        "order": 3,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag12",
        "day": 2,
        "timeSlot": "12:30 PM - 01:30 PM",
        "title": "Networking Lunch",
        "description": "Buffet lunch and final networking session.",
        "speakerName": "",
        "location": "Dining Lounge",
        "type": "BREAK",
        "order": 4,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag13",
        "day": 2,
        "timeSlot": "01:30 PM - 03:00 PM",
        "title": "Session: Disaster Response & Global Health Security",
        "description": "Coordinated nursing protocols in natural crises, pandemic prevention, and international clinical volunteering.",
        "speakerName": "Prof. Giovanni Rossi",
        "location": "Main Auditorium (Hall A)",
        "type": "SESSION",
        "order": 5,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "ag14",
        "day": 2,
        "timeSlot": "03:00 PM - 04:00 PM",
        "title": "Valedictory Session & Best Paper Award Ceremony",
        "description": "Closing statements, certificates distribution, and announcement of the Best Research Paper Award.",
        "speakerName": "Conference Chairs",
        "location": "Main Auditorium (Hall A)",
        "type": "SOCIAL",
        "order": 6,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    }
]

DEFAULT_FAQS = [
    {
        "id": "faq1",
        "question": "When and where is the conference taking place?",
        "answer": "The Global Nursing Conference 2027 will take place on May 13-14, 2027 in Rome, Italy. The specific venue hotel details will be updated on the website shortly.",
        "order": 1,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "faq2",
        "question": "What is the theme of the conference?",
        "answer": "The core theme is \"Nex-Gen Nursing: Trends, Techs, Triumphs in Global Health\", highlighting the integration of AI, IoMT, and digital healthcare in the nursing sector.",
        "order": 2,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "faq3",
        "question": "How do I download the conference brochure?",
        "answer": "Click on the \"Brochure Download\" tab, complete the short form with your name, email, phone, and country, and you will immediately be able to download the official brochure PDF.",
        "order": 3,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "faq4",
        "question": "What are the formats allowed for Abstract Submission?",
        "answer": "Abstracts must be submitted as either PDF or Microsoft Word (DOCX) files. You can download the abstract sample template from the Abstract Submission page for format instructions.",
        "order": 4,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "faq5",
        "question": "Can I pay for registration through bank transfers or credit cards?",
        "answer": "Yes, we accept major credit card payments, PayPal, and offline bank transfers. Please note that a 2% processing surcharge applies for PayPal payments. For group package discounts, please email us directly.",
        "order": 5,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    }
]

DEFAULT_SPONSORS = [
    {
        "id": "spn1",
        "name": "Syntrophy Conferences",
        "logoPath": "/logo_light.png",
        "websiteUrl": "https://syntrophy.com",
        "tier": "PLATINUM",
        "order": 1,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "spn2",
        "name": "BioTech Health Solutions",
        "logoPath": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=200",
        "websiteUrl": "https://biotech.com",
        "tier": "GOLD",
        "order": 2,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    },
    {
        "id": "spn3",
        "name": "Rome Medical Center",
        "logoPath": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=200",
        "websiteUrl": "https://romemedical.it",
        "tier": "SILVER",
        "order": 3,
        "createdAt": datetime.datetime.utcnow().isoformat() + "Z"
    }
]

DEFAULT_GALLERY = [
    { "id": "gal1", "title": "Colosseum, Rome", "imagePath": "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=600", "category": "ROME", "createdAt": datetime.datetime.utcnow().isoformat() + "Z" },
    { "id": "gal2", "title": "Vatican City", "imagePath": "https://images.unsplash.com/photo-1542820229-081e0c12af0b?auto=format&fit=crop&q=80&w=600", "category": "ROME", "createdAt": datetime.datetime.utcnow().isoformat() + "Z" },
    { "id": "gal3", "title": "Trevi Fountain", "imagePath": "https://images.unsplash.com/photo-1531572753322-ad063cecc140?auto=format&fit=crop&q=80&w=600", "category": "ROME", "createdAt": datetime.datetime.utcnow().isoformat() + "Z" },
    { "id": "gal4", "title": "Previous Conference Keynote", "imagePath": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=600", "category": "CONFERENCE", "createdAt": datetime.datetime.utcnow().isoformat() + "Z" },
    { "id": "gal5", "title": "Panel Session Discussion", "imagePath": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600", "category": "CONFERENCE", "createdAt": datetime.datetime.utcnow().isoformat() + "Z" },
    { "id": "gal6", "title": "Poster Session Networking", "imagePath": "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600", "category": "CONFERENCE", "createdAt": datetime.datetime.utcnow().isoformat() + "Z" }
]

DEFAULT_SETTINGS = [
    { "key": "conference_title", "value": "Global Nursing Conference 2027" },
    { "key": "conference_theme", "value": "Nex-Gen Nursing: Trends, Techs, Triumphs in Global Health" },
    { "key": "conference_dates", "value": "May 13-14, 2027" },
    { "key": "conference_venue", "value": "To be announced, Rome, Italy" },
    { "key": "support_email", "value": "nursing@syntrophyglobalconferences.com" },
    { "key": "support_phone", "value": "+39 06 1234567" }
]

app = FastAPI(title="con-27 Python API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Wrap the app for GoDaddy cPanel compatibility (Passenger WSGI entry point)
wsgi_app = ASGIMiddleware(app)

@app.get("/{catchall:path}")
async def serve_frontend(catchall: str):
    # Exclude API paths from serving index.html
    if catchall.startswith("api"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
        
    import os
    # Serve static assets/files from dist folder if they exist
    file_path = os.path.join("dist", catchall)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # Default to index.html for Single Page App routing
    index_path = os.path.join("dist", "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {"message": "Welcome to Syntrophy Global Health Conference API. Frontend dist not found."}

# --- SCHEMAS ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ExportDataRequest(BaseModel):
    data: List[dict]

class RegistrationInput(BaseModel):
    name: str
    email: str
    phone: str
    country: str
    package: str
    amount: float
    paymentMethod: str
    comments: Optional[str] = None

class AbstractInput(BaseModel):
    prefix: str
    name: str
    email: str
    phone: str
    profession: str
    country: str
    title: str
    fileName: str
    filePath: str

class BrochureInput(BaseModel):
    name: str
    email: str
    phone: str
    country: str
    query: Optional[str] = None

class MessageInput(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    subject: Optional[str] = None


def send_email_smtp(to_email: str, subject: str, body: str, attachment_path: Optional[str] = None, attachment_name: Optional[str] = None):
    # Fetch SMTP variables dynamically from environment for cPanel compatibility
    host = os.getenv("SMTP_HOST", "")
    username = os.getenv("SMTP_USERNAME", "")
    password = os.getenv("SMTP_PASSWORD", "")
    from_email = os.getenv("SMTP_FROM_EMAIL", "nursing@syntrophyglobalconferences.com")
    from_name = os.getenv("SMTP_FROM_NAME", "Syntrophy Conferences")
    
    try:
        port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError:
        port = 587

    if not host or not username:
        print(f"\n--- [MOCK EMAIL] ---")
        print(f"SMTP is not configured in environment (missing SMTP_HOST or SMTP_USERNAME).")
        print(f"Would send email to: {to_email}")
        print(f"Subject: {subject}")
        print(f"Body:\n{body}")
        if attachment_path:
            print(f"Attachment: {attachment_path} (Name: {attachment_name})")
        print(f"--------------------\n")
        return

    try:
        msg = MIMEMultipart()
        msg['From'] = f"{from_name} <{from_email}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain', 'utf-8'))
        
        if attachment_path and os.path.exists(attachment_path):
            try:
                with open(attachment_path, 'rb') as f:
                    part = MIMEBase('application', 'octet-stream')
                    part.set_payload(f.read())
                encoders.encode_base64(part)
                name = attachment_name or os.path.basename(attachment_path)
                part.add_header(
                    'Content-Disposition',
                    f'attachment; filename="{name}"'
                )
                msg.attach(part)
            except Exception as e:
                print(f"Error attaching file {attachment_path} to email: {e}")

        # Send email
        if port == 465:
            server = smtplib.SMTP_SSL(host, port, timeout=10)
        else:
            server = smtplib.SMTP(host, port, timeout=10)
            server.ehlo()
            try:
                server.starttls()
                server.ehlo()
            except Exception as tls_err:
                print(f"STARTTLS failed or skipped: {tls_err}")
        
        if password:
            server.login(username, password)
            
        server.sendmail(from_email, to_email, msg.as_string())
        server.quit()
        
        # Log successful email send
        with open("email_errors.log", "a") as log_file:
            log_file.write(f"\n--- SUCCESS at {datetime.datetime.now()} ---\n")
            log_file.write(f"To: {to_email} | Subject: {subject}\n")
            log_file.write("---------------------------------------\n")
            
        print(f"Successfully sent email to {to_email} with subject: {subject}")
    except Exception as e:
        import traceback
        # Log SMTP errors to a file for cPanel troubleshooting
        with open("email_errors.log", "a") as log_file:
            log_file.write(f"\n--- ERROR at {datetime.datetime.now()} ---\n")
            log_file.write(f"To: {to_email}\n")
            log_file.write(f"Error: {e}\n")
            log_file.write(traceback.format_exc())
            log_file.write("-------------------------------------\n")
        print(f"Error sending email to {to_email}: {e}")

def send_brochure_emails(payload: BrochureInput, created_at: str):
    admin_notification_email = os.getenv("ADMIN_NOTIFICATION_EMAIL", "nursing@syntrophyglobalconferences.com")
    
    # 1. Email to us (admin notification)
    admin_subject = "New Brochure Download for Nursing 2027, Rome, Italy"
    admin_body = (
        f"A new brochure download request has been registered.\n\n"
        f"Complete Form Details:\n"
        f"Name: {payload.name}\n"
        f"Email: {payload.email}\n"
        f"Phone: {payload.phone}\n"
        f"Country: {payload.country}\n"
        f"Special Queries / Comments: {payload.query or 'None'}\n"
        f"Submitted At: {created_at}\n"
    )
    send_email_smtp(admin_notification_email, admin_subject, admin_body)
    
    # 2. Email to client (thank you email)
    client_subject = "Thank you for interest in Syntrophy Nursing Conference 2027, Rome, Italy"
    client_body = (
        f"Dear {payload.name},\n"
        f"Thank you for your interest in our Syntrophy Global Nursing Conference 2027 May 13-14, 2027 Rome, Italy.\n"
        f"If you need any assistance please free to revert to this email.\n\n"
        f"Regards,\n"
        f"Scientific committee\n"
        f"Syntrophy Conferences.\n"
        f"nursing@syntrophyglobalconferences.com\n"
    )
    send_email_smtp(payload.email, client_subject, client_body)

def send_abstract_emails(payload: AbstractInput, created_at: str):
    admin_notification_email = os.getenv("ADMIN_NOTIFICATION_EMAIL", "nursing@syntrophyglobalconferences.com")

    # 1. Email to us (admin notification)
    admin_subject = "New Abstract Submitted to Nursing 2027 Rome, Italy"
    admin_body = (
        f"A new research abstract has been submitted.\n\n"
        f"Complete Filled Form Details:\n"
        f"Prefix: {payload.prefix}\n"
        f"Name: {payload.name}\n"
        f"Email: {payload.email}\n"
        f"Phone: {payload.phone}\n"
        f"Profession: {payload.profession}\n"
        f"Country: {payload.country}\n"
        f"Abstract Title: {payload.title}\n"
        f"File Name: {payload.fileName}\n"
        f"Submitted At: {created_at}\n"
    )
    
    file_path = payload.filePath
    if not os.path.exists(file_path):
        base_name = os.path.basename(payload.filePath)
        file_path = os.path.join(UPLOAD_DIR, base_name)
        
    send_email_smtp(
        to_email=admin_notification_email,
        subject=admin_subject,
        body=admin_body,
        attachment_path=file_path if os.path.exists(file_path) else None,
        attachment_name=payload.fileName
    )
    
    # 2. Email to client
    client_subject = "Abstract Submitted to Syntrophy Nursing Conferences 2027, Rome, Italy."
    salutation = f"{payload.prefix} {payload.name}" if payload.prefix else payload.name
    client_body = (
        f"Dear {salutation},\n"
        f"Thank you for your interest and submitting abstract for Global Nursing conference 2027, Rome, Italy. We will be reviewing the abstract and will get back to you. \n"
        f"Please revert back to this email if you need any assistance or if you have any queries.\n\n"
        f"Regards,\n"
        f"Syntrophy Conferences.\n"
    )
    send_email_smtp(payload.email, client_subject, client_body)

# Helper to read/write JSON file DB
def load_db() -> Dict:
    if not os.path.exists(DB_FILE):
        initial = {
            "registrations": [],
            "abstracts": [],
            "brochureDownloads": [],
            "contactMessages": [],
            "speakers": DEFAULT_SPEAKERS,
            "agenda": DEFAULT_AGENDA,
            "sponsors": DEFAULT_SPONSORS,
            "gallery": DEFAULT_GALLERY,
            "settings": DEFAULT_SETTINGS,
            "faqs": DEFAULT_FAQS
        }
        save_db(initial)
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {"registrations": [], "abstracts": [], "brochureDownloads": [], "contactMessages": [], "speakers": [], "agenda": [], "sponsors": [], "gallery": [], "settings": [], "faqs": []}

def save_db(data: Dict):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=2)

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

# Registrations
@app.get("/api/registrations")
def get_registrations():
    db_data = load_db()
    return db_data.get("registrations", [])

@app.post("/api/registrations")
def add_registration(payload: RegistrationInput):
    db_data = load_db()
    new_reg = payload.dict()
    new_reg["id"] = f"reg_{int(datetime.datetime.utcnow().timestamp())}_{len(db_data['registrations'])}"
    new_reg["status"] = "PENDING"
    new_reg["createdAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db_data["registrations"].append(new_reg)
    save_db(db_data)
    return new_reg

@app.put("/api/registrations/{id}")
def update_registration(id: str, updates: Dict, user: str = Depends(verify_token)):
    db_data = load_db()
    for idx, reg in enumerate(db_data["registrations"]):
        if reg["id"] == id:
            reg.update(updates)
            save_db(db_data)
            return reg
    raise HTTPException(status_code=404, detail="Registration not found")

@app.delete("/api/registrations/{id}")
def delete_registration(id: str, user: str = Depends(verify_token)):
    db_data = load_db()
    db_data["registrations"] = [r for r in db_data["registrations"] if r["id"] != id]
    save_db(db_data)
    return {"success": True}

# Abstracts
@app.get("/api/abstracts")
def get_abstracts():
    db_data = load_db()
    return db_data.get("abstracts", [])

@app.post("/api/abstracts")
def add_abstract(payload: AbstractInput, background_tasks: BackgroundTasks):
    db_data = load_db()
    new_abs = payload.dict()
    new_abs["id"] = f"abs_{int(datetime.datetime.utcnow().timestamp())}_{len(db_data['abstracts'])}"
    new_abs["status"] = "PENDING"
    new_abs["createdAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db_data["abstracts"].append(new_abs)
    save_db(db_data)
    
    # Send email in background
    background_tasks.add_task(send_abstract_emails, payload, new_abs["createdAt"])
    
    return new_abs

@app.put("/api/abstracts/{id}")
def update_abstract(id: str, updates: Dict, user: str = Depends(verify_token)):
    db_data = load_db()
    for idx, abs_item in enumerate(db_data["abstracts"]):
        if abs_item["id"] == id:
            abs_item.update(updates)
            save_db(db_data)
            return abs_item
    raise HTTPException(status_code=404, detail="Abstract not found")

@app.delete("/api/abstracts/{id}")
def delete_abstract(id: str, user: str = Depends(verify_token)):
    db_data = load_db()
    db_data["abstracts"] = [a for a in db_data["abstracts"] if a["id"] != id]
    save_db(db_data)
    return {"success": True}

@app.post("/api/abstracts/upload")
async def upload_abstract(file: UploadFile = File(...)):
    filename = file.filename
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ["pdf", "doc", "docx"]:
        raise HTTPException(status_code=400, detail="Only PDF, DOC, or DOCX files are allowed.")
    
    safe_filename = f"{int(datetime.datetime.utcnow().timestamp())}_{filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
        
    return {
        "filePath": f"uploads/{safe_filename}",
        "fileName": filename
    }

# Brochure leads
@app.get("/api/brochures")
def get_brochure_leads():
    db_data = load_db()
    return db_data.get("brochureDownloads", [])

@app.post("/api/brochures")
def add_brochure_lead(payload: BrochureInput, background_tasks: BackgroundTasks):
    db_data = load_db()
    new_lead = payload.dict()
    new_lead["id"] = f"lead_{int(datetime.datetime.utcnow().timestamp())}_{len(db_data['brochureDownloads'])}"
    new_lead["createdAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db_data["brochureDownloads"].append(new_lead)
    save_db(db_data)
    
    # Send email in background
    background_tasks.add_task(send_brochure_emails, payload, new_lead["createdAt"])
    
    return new_lead

@app.delete("/api/brochures/{id}")
def delete_brochure_lead(id: str, user: str = Depends(verify_token)):
    db_data = load_db()
    db_data["brochureDownloads"] = [b for b in db_data["brochureDownloads"] if b["id"] != id]
    save_db(db_data)
    return {"success": True}

# Contact Messages
@app.get("/api/messages")
def get_contact_messages():
    db_data = load_db()
    return db_data.get("contactMessages", [])

@app.post("/api/messages")
def add_contact_message(payload: MessageInput):
    db_data = load_db()
    new_msg = payload.dict()
    new_msg["id"] = f"msg_{int(datetime.datetime.utcnow().timestamp())}_{len(db_data['contactMessages'])}"
    new_msg["status"] = "NEW"
    new_msg["createdAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db_data["contactMessages"].append(new_msg)
    save_db(db_data)
    return new_msg

@app.put("/api/messages/{id}")
def update_contact_message(id: str, updates: Dict, user: str = Depends(verify_token)):
    db_data = load_db()
    for msg in db_data["contactMessages"]:
        if msg["id"] == id:
            msg.update(updates)
            save_db(db_data)
            return msg
    raise HTTPException(status_code=404, detail="Message not found")

@app.delete("/api/messages/{id}")
def delete_contact_message(id: str, user: str = Depends(verify_token)):
    db_data = load_db()
    db_data["contactMessages"] = [m for m in db_data["contactMessages"] if m["id"] != id]
    save_db(db_data)
    return {"success": True}

# Speakers
@app.get("/api/speakers")
def get_speakers():
    db_data = load_db()
    return db_data.get("speakers", [])

@app.post("/api/speakers")
def save_speaker(payload: Dict, user: str = Depends(verify_token)):
    db_data = load_db()
    sp_id = payload.get("id")
    if "order" in payload:
        payload["order"] = int(payload["order"])
    if sp_id:
        for sp in db_data["speakers"]:
            if sp["id"] == sp_id:
                sp.update(payload)
                save_db(db_data)
                return sp
    new_sp = payload.copy()
    new_sp["id"] = f"sp_{int(datetime.datetime.utcnow().timestamp())}"
    new_sp["createdAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db_data["speakers"].append(new_sp)
    save_db(db_data)
    return new_sp

@app.delete("/api/speakers/{id}")
def delete_speaker(id: str, user: str = Depends(verify_token)):
    db_data = load_db()
    db_data["speakers"] = [s for s in db_data["speakers"] if s["id"] != id]
    save_db(db_data)
    return {"success": True}

# Agenda
@app.get("/api/agenda")
def get_agenda():
    db_data = load_db()
    return db_data.get("agenda", [])

@app.post("/api/agenda")
def save_agenda_item(payload: Dict, user: str = Depends(verify_token)):
    db_data = load_db()
    ag_id = payload.get("id")
    if "day" in payload:
        payload["day"] = int(payload["day"])
    if "order" in payload:
        payload["order"] = int(payload["order"])
    if ag_id:
        for ag in db_data["agenda"]:
            if ag["id"] == ag_id:
                ag.update(payload)
                save_db(db_data)
                return ag
    new_ag = payload.copy()
    new_ag["id"] = f"ag_{int(datetime.datetime.utcnow().timestamp())}"
    new_ag["createdAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db_data["agenda"].append(new_ag)
    save_db(db_data)
    return new_ag

@app.delete("/api/agenda/{id}")
def delete_agenda_item(id: str, user: str = Depends(verify_token)):
    db_data = load_db()
    db_data["agenda"] = [a for a in db_data["agenda"] if a["id"] != id]
    save_db(db_data)
    return {"success": True}

# FAQs
@app.get("/api/faqs")
def get_faqs():
    db_data = load_db()
    return db_data.get("faqs", [])

@app.post("/api/faqs")
def save_faq_item(payload: Dict, user: str = Depends(verify_token)):
    db_data = load_db()
    faq_id = payload.get("id")
    if "order" in payload:
        payload["order"] = int(payload["order"])
    if faq_id:
        for faq in db_data["faqs"]:
            if faq["id"] == faq_id:
                faq.update(payload)
                save_db(db_data)
                return faq
    new_faq = payload.copy()
    new_faq["id"] = f"faq_{int(datetime.datetime.utcnow().timestamp())}"
    new_faq["createdAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db_data["faqs"].append(new_faq)
    save_db(db_data)
    return new_faq

@app.delete("/api/faqs/{id}")
def delete_faq_item(id: str, user: str = Depends(verify_token)):
    db_data = load_db()
    db_data["faqs"] = [f for f in db_data["faqs"] if f["id"] != id]
    save_db(db_data)
    return {"success": True}

# Sponsors
@app.get("/api/sponsors")
def get_sponsors():
    db_data = load_db()
    return db_data.get("sponsors", [])

@app.post("/api/sponsors")
def save_sponsor_item(payload: Dict, user: str = Depends(verify_token)):
    db_data = load_db()
    spn_id = payload.get("id")
    if "order" in payload:
        payload["order"] = int(payload["order"])
    if spn_id:
        for spn in db_data["sponsors"]:
            if spn["id"] == spn_id:
                spn.update(payload)
                save_db(db_data)
                return spn
    new_spn = payload.copy()
    new_spn["id"] = f"spn_{int(datetime.datetime.utcnow().timestamp())}"
    new_spn["createdAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db_data["sponsors"].append(new_spn)
    save_db(db_data)
    return new_spn

@app.delete("/api/sponsors/{id}")
def delete_sponsor_item(id: str, user: str = Depends(verify_token)):
    db_data = load_db()
    db_data["sponsors"] = [s for s in db_data["sponsors"] if s["id"] != id]
    save_db(db_data)
    return {"success": True}

# Gallery
@app.get("/api/gallery")
def get_gallery():
    db_data = load_db()
    return db_data.get("gallery", [])

@app.post("/api/gallery")
def save_gallery_item(payload: Dict, user: str = Depends(verify_token)):
    db_data = load_db()
    gal_id = payload.get("id")
    if gal_id:
        for gal in db_data["gallery"]:
            if gal["id"] == gal_id:
                gal.update(payload)
                save_db(db_data)
                return gal
    new_gal = payload.copy()
    new_gal["id"] = f"gal_{int(datetime.datetime.utcnow().timestamp())}"
    new_gal["createdAt"] = datetime.datetime.utcnow().isoformat() + "Z"
    db_data["gallery"].append(new_gal)
    save_db(db_data)
    return new_gal

@app.delete("/api/gallery/{id}")
def delete_gallery_item(id: str, user: str = Depends(verify_token)):
    db_data = load_db()
    db_data["gallery"] = [g for g in db_data["gallery"] if g["id"] != id]
    save_db(db_data)
    return {"success": True}

# Settings
@app.get("/api/settings")
def get_settings():
    db_data = load_db()
    return db_data.get("settings", [])

@app.post("/api/settings")
def save_setting(payload: Dict, user: str = Depends(verify_token)):
    db_data = load_db()
    key = payload.get("key")
    val = payload.get("value")
    if not key:
         raise HTTPException(status_code=400, detail="Missing key in setting payload")
    
    # Check if exists
    found = False
    for setting in db_data["settings"]:
        if setting["key"] == key:
            setting["value"] = val
            found = True
            break
    if not found:
        db_data["settings"].append({"key": key, "value": val})
    
    save_db(db_data)
    return {"key": key, "value": val}


# Reports Export

@app.post("/api/reports/registrations/excel")
def export_registrations_excel(payload: ExportDataRequest, user: str = Depends(verify_token)):
    if not payload.data:
        raise HTTPException(status_code=400, detail="No data provided for export")
        
    df = pd.DataFrame(payload.data)
    
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

    table_data = [["Presenter", "Email", "Phone", "Profession", "Country", "Paper Title", "Status"]]
    for item in payload.data:
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

