<<<<<<< HEAD
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from config import settings

Base = declarative_base()

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    freshdesk_id = Column(Integer, unique=True, index=True)
    subject = Column(String(500))
    description = Column(Text)
    customer_email = Column(String(255))
    priority = Column(Integer, default=1)
    status = Column(String(50), default="open")
    category = Column(String(100))
    tier = Column(String(20))  # tier_1, tier_2, complex
    assigned_to = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # AI Processing fields
    confidence_score = Column(Float)
    auto_resolved = Column(Boolean, default=False)
    escalation_reason = Column(Text, nullable=True)
    bot_response = Column(Text, nullable=True)

class TicketHistory(Base):
    __tablename__ = "ticket_history"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, index=True)
    action = Column(String(100))  # created, categorized, resolved, escalated
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Database setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
=======
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from config import settings

Base = declarative_base()

class Ticket(Base):
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    freshdesk_id = Column(Integer, unique=True, index=True)
    subject = Column(String(500))
    description = Column(Text)
    customer_email = Column(String(255))
    priority = Column(Integer, default=1)
    status = Column(String(50), default="open")
    category = Column(String(100))
    tier = Column(String(20))  # tier_1, tier_2, complex
    assigned_to = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # AI Processing fields
    confidence_score = Column(Float)
    auto_resolved = Column(Boolean, default=False)
    escalation_reason = Column(Text, nullable=True)
    bot_response = Column(Text, nullable=True)

class TicketHistory(Base):
    __tablename__ = "ticket_history"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, index=True)
    action = Column(String(100))  # created, categorized, resolved, escalated
    details = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Database setup
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
>>>>>>> f7c65d8 (file updated)
        db.close() 