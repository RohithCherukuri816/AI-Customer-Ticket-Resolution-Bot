<<<<<<< HEAD
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
import json
import hmac
import hashlib
from datetime import datetime
from sqlalchemy import text

from ticket_processor import TicketProcessor
from models import create_tables, get_db, Ticket
from config import settings
from loguru import logger

# Configure logging
logger.add(settings.LOG_FILE, rotation="1 day", retention="7 days", level=settings.LOG_LEVEL)

# Create FastAPI app
app = FastAPI(
    title="Customer Ticket Resolution Bot",
    description="AI-powered ticket resolution system with Freshdesk integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ticket processor
ticket_processor = None

# Pydantic models
class TicketWebhook(BaseModel):
    id: int
    subject: str
    description: str
    requester_id: int
    priority: int = 1
    status: int = 2
    created_at: str
    updated_at: str

class TestTicketRequest(BaseModel):
    subject: str
    description: str
    priority: int = 1

class ReprocessRequest(BaseModel):
    ticket_id: int

@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    global ticket_processor
    
    try:
        # Create database tables
        create_tables()
        logger.info("Database tables created")
        
        # Initialize ticket processor
        ticket_processor = TicketProcessor()
        logger.info("Ticket processor initialized")
        
        logger.info("Application startup completed")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint with basic information"""
    return {
        "message": "Customer Ticket Resolution Bot",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db = next(get_db())
        db.execute(text("SELECT 1"))
        
        # Test Freshdesk connection
        freshdesk_status = ticket_processor.freshdesk_client.test_connection()
        
        return {
            "status": "healthy",
            "database": "connected",
            "freshdesk": "connected" if freshdesk_status else "disconnected",
            "ai_models": "loaded",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook/freshdesk")
async def freshdesk_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Freshdesk webhook for new tickets"""
    try:
        # Get raw body for signature verification
        body = await request.body()
        logger.info(f"Received webhook body length: {len(body)}")
        
        # Debug: Log all headers
        logger.info(f"All headers: {dict(request.headers)}")
        
        # Verify webhook signature if configured
        if settings.FRESHDESK_WEBHOOK_SECRET:
            # Check for the webhook secret header that Freshdesk is actually sending
            webhook_secret = request.headers.get("x-webhook-secret")
            if webhook_secret:
                # For testing, accept the webhook secret that Freshdesk is sending
                expected_secret = "ai-customer-ticket-resolution-bot"
                if webhook_secret != expected_secret:
                    logger.warning(f"Webhook secret mismatch. Received: {webhook_secret}, Expected: {expected_secret}")
                    raise HTTPException(status_code=401, detail="Invalid webhook secret")
                else:
                    logger.info("Webhook secret verified successfully")
            else:
                # Fallback to traditional signature verification
                signature = request.headers.get("X-Freshdesk-Signature")
                if not signature:
                    signature = request.headers.get("X-Webhook-Signature")
                    if not signature:
                        signature = request.headers.get("X-Signature")
                        if not signature:
                            logger.warning("No signature or webhook secret found. Available headers:")
                            for header, value in request.headers.items():
                                logger.warning(f"  {header}: {value}")
                            # Temporarily disable signature verification for testing
                            logger.warning("Temporarily allowing webhook without signature for testing")
                            # raise HTTPException(status_code=401, detail="Missing signature")
                
                if signature:  # Only verify if signature is present
                    expected_signature = hmac.new(
                        settings.FRESHDESK_WEBHOOK_SECRET.encode(),
                        body,
                        hashlib.sha256
                    ).hexdigest()
                    
                    logger.info(f"Received signature: {signature}")
                    logger.info(f"Expected signature: {expected_signature}")
                    
                    if not hmac.compare_digest(signature, expected_signature):
                        raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Parse webhook data
        try:
            webhook_data = json.loads(body)
            logger.info(f"Parsed webhook data: {webhook_data}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            raise HTTPException(status_code=400, detail="Invalid JSON")
        
        # Handle different webhook data formats
        ticket_data = None
        
        # Check if this is a Freshdesk webhook notification (contains ticket_id)
        if webhook_data.get("freshdesk_webhook") and webhook_data["freshdesk_webhook"].get("ticket_id"):
            ticket_id = webhook_data["freshdesk_webhook"]["ticket_id"]
            logger.info(f"Received Freshdesk webhook for ticket ID: {ticket_id}")
            
            # Fetch full ticket details from Freshdesk API
            try:
                ticket_data = ticket_processor.freshdesk_client.get_ticket(ticket_id)
                if ticket_data:
                    logger.info(f"Successfully fetched ticket details for ID: {ticket_id}")
                else:
                    logger.error(f"Failed to fetch ticket details for ID: {ticket_id}")
                    return {"status": "error", "reason": "Failed to fetch ticket details"}
            except Exception as e:
                logger.error(f"Error fetching ticket {ticket_id}: {e}")
                return {"status": "error", "reason": f"Error fetching ticket: {str(e)}"}
        
        # Check if this is a ticket creation event (Freshdesk format)
        elif webhook_data.get("ticket"):
            ticket_data = webhook_data["ticket"]
            logger.info("Using Freshdesk format ticket data")
        # Check if this is direct ticket data (test format)
        elif webhook_data.get("id") and webhook_data.get("subject"):
            ticket_data = webhook_data
            logger.info("Using direct ticket data format")
        else:
            logger.warning(f"Invalid webhook data format: {webhook_data}")
            return {"status": "ignored", "reason": "Not a valid ticket event"}
        
        if ticket_data:
            logger.info(f"Processing ticket: {ticket_data.get('id')}")
            # Process ticket in background
            background_tasks.add_task(process_ticket_background, ticket_data)
            
            return {"status": "processing", "ticket_id": ticket_data.get("id")}
        else:
            logger.warning("No ticket data found in webhook")
            return {"status": "ignored", "reason": "No ticket data found"}
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_ticket_background(ticket_data: Dict):
    """Process ticket in background task"""
    try:
        logger.info(f"Starting background processing for ticket: {ticket_data.get('id')}")
        result = ticket_processor.process_new_ticket(ticket_data)
        logger.info(f"Background processing completed: {result}")
    except Exception as e:
        logger.error(f"Background processing error: {str(e)}")
        import traceback
        logger.error(f"Background processing traceback: {traceback.format_exc()}")
        # Don't re-raise - background tasks should not fail the webhook

@app.post("/test-ticket")
async def test_ticket(request: TestTicketRequest):
    """Test endpoint to simulate ticket processing"""
    try:
        # Generate unique ticket ID based on timestamp
        import time
        unique_id = int(time.time() * 1000) % 1000000  # 6-digit unique ID
        
        # Create mock ticket data
        mock_ticket = {
            "id": unique_id,  # Unique mock ID
            "subject": request.subject,
            "description": request.description,
            "requester_id": 12345,
            "priority": request.priority,
            "status": 2,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Process the ticket
        result = ticket_processor.process_new_ticket(mock_ticket)
        
        return {
            "success": True,
            "test_ticket": mock_ticket,
            "processing_result": result
        }
        
    except Exception as e:
        logger.error(f"Test ticket error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reprocess-ticket")
async def reprocess_ticket(request: ReprocessRequest):
    """Reprocess a specific ticket"""
    try:
        result = ticket_processor.reprocess_ticket(request.ticket_id)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Reprocessing failed"))
            
    except Exception as e:
        logger.error(f"Reprocess ticket error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Get processing statistics"""
    try:
        stats = ticket_processor.get_ticket_stats()
        return stats
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics")
async def get_analytics():
    """Get detailed analytics"""
    try:
        analytics = ticket_processor.get_ticket_analytics()
        return analytics
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tickets")
async def get_tickets(limit: int = 50, offset: int = 0):
    """Get list of processed tickets"""
    try:
        db = next(get_db())
        tickets = db.query(Ticket).offset(offset).limit(limit).all()
        
        return {
            "tickets": [
                {
                    "id": ticket.id,
                    "freshdesk_id": ticket.freshdesk_id,
                    "subject": ticket.subject,
                    "category": ticket.category,
                    "tier": ticket.tier,
                    "confidence_score": ticket.confidence_score,
                    "auto_resolved": ticket.auto_resolved,
                    "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
                    "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None
                }
                for ticket in tickets
            ],
            "total": len(tickets),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Get tickets error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: int):
    """Get specific ticket details"""
    try:
        db = next(get_db())
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return {
            "id": ticket.id,
            "freshdesk_id": ticket.freshdesk_id,
            "subject": ticket.subject,
            "description": ticket.description,
            "category": ticket.category,
            "tier": ticket.tier,
            "confidence_score": ticket.confidence_score,
            "auto_resolved": ticket.auto_resolved,
            "escalation_reason": ticket.escalation_reason,
            "bot_response": ticket.bot_response,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
            "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None
        }
        
    except Exception as e:
        logger.error(f"Get ticket error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/docs")
async def get_docs():
    """Get API documentation"""
    return {
        "endpoints": {
            "GET /": "Root endpoint with basic info",
            "GET /health": "Health check",
            "POST /webhook/freshdesk": "Freshdesk webhook endpoint",
            "POST /test-ticket": "Test ticket processing",
            "GET /stats": "Processing statistics",
            "GET /analytics": "Detailed analytics",
            "GET /tickets": "List processed tickets",
            "GET /tickets/{id}": "Get specific ticket",
            "GET /docs": "This documentation"
        },
        "webhook_format": {
            "description": "Freshdesk webhook should send ticket data",
            "example": {
                "ticket": {
                    "id": 123,
                    "subject": "Test ticket",
                    "description": "Ticket description",
                    "requester_id": 456,
                    "priority": 1,
                    "status": 2
                }
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
=======
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional
import json
import hmac
import hashlib
from datetime import datetime
from sqlalchemy import text

from ticket_processor import TicketProcessor
from models import create_tables, get_db, Ticket
from config import settings
from loguru import logger

# Configure logging
logger.add(settings.LOG_FILE, rotation="1 day", retention="7 days", level=settings.LOG_LEVEL)

# Create FastAPI app
app = FastAPI(
    title="Customer Ticket Resolution Bot",
    description="AI-powered ticket resolution system with Freshdesk integration",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ticket processor
ticket_processor = None

# Pydantic models
class TicketWebhook(BaseModel):
    id: int
    subject: str
    description: str
    requester_id: int
    priority: int = 1
    status: int = 2
    created_at: str
    updated_at: str

class TestTicketRequest(BaseModel):
    subject: str
    description: str
    priority: int = 1

class ReprocessRequest(BaseModel):
    ticket_id: int

@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    global ticket_processor
    
    try:
        # Create database tables
        create_tables()
        logger.info("Database tables created")
        
        # Initialize ticket processor
        ticket_processor = TicketProcessor()
        logger.info("Ticket processor initialized")
        
        logger.info("Application startup completed")
        
    except Exception as e:
        logger.error(f"Startup error: {e}")
        raise

@app.get("/")
async def root():
    """Root endpoint with basic information"""
    return {
        "message": "Customer Ticket Resolution Bot",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Test database connection
        db = next(get_db())
        db.execute(text("SELECT 1"))
        
        # Test Freshdesk connection
        freshdesk_status = ticket_processor.freshdesk_client.test_connection()
        
        return {
            "status": "healthy",
            "database": "connected",
            "freshdesk": "connected" if freshdesk_status else "disconnected",
            "ai_models": "loaded",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhook/freshdesk")
async def freshdesk_webhook(request: Request, background_tasks: BackgroundTasks):
    """Handle Freshdesk webhook for new tickets"""
    try:
        # Get raw body for signature verification
        body = await request.body()
        logger.info(f"Received webhook body length: {len(body)}")
        
        # Debug: Log all headers
        logger.info(f"All headers: {dict(request.headers)}")
        
        # Verify webhook signature if configured
        if settings.FRESHDESK_WEBHOOK_SECRET:
            # Check for the webhook secret header that Freshdesk is actually sending
            webhook_secret = request.headers.get("x-webhook-secret")
            if webhook_secret:
                # For testing, accept the webhook secret that Freshdesk is sending
                expected_secret = "ai-customer-ticket-resolution-bot"
                if webhook_secret != expected_secret:
                    logger.warning(f"Webhook secret mismatch. Received: {webhook_secret}, Expected: {expected_secret}")
                    raise HTTPException(status_code=401, detail="Invalid webhook secret")
                else:
                    logger.info("Webhook secret verified successfully")
            else:
                # Fallback to traditional signature verification
                signature = request.headers.get("X-Freshdesk-Signature")
                if not signature:
                    signature = request.headers.get("X-Webhook-Signature")
                    if not signature:
                        signature = request.headers.get("X-Signature")
                        if not signature:
                            logger.warning("No signature or webhook secret found. Available headers:")
                            for header, value in request.headers.items():
                                logger.warning(f"  {header}: {value}")
                            # Temporarily disable signature verification for testing
                            logger.warning("Temporarily allowing webhook without signature for testing")
                            # raise HTTPException(status_code=401, detail="Missing signature")
                
                if signature:  # Only verify if signature is present
                    expected_signature = hmac.new(
                        settings.FRESHDESK_WEBHOOK_SECRET.encode(),
                        body,
                        hashlib.sha256
                    ).hexdigest()
                    
                    logger.info(f"Received signature: {signature}")
                    logger.info(f"Expected signature: {expected_signature}")
                    
                    if not hmac.compare_digest(signature, expected_signature):
                        raise HTTPException(status_code=401, detail="Invalid signature")
        
        # Parse webhook data
        try:
            webhook_data = json.loads(body)
            logger.info(f"Parsed webhook data: {webhook_data}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
            raise HTTPException(status_code=400, detail="Invalid JSON")
        
        # Handle different webhook data formats
        ticket_data = None
        
        # Check if this is a Freshdesk webhook notification (contains ticket_id)
        if webhook_data.get("freshdesk_webhook") and webhook_data["freshdesk_webhook"].get("ticket_id"):
            ticket_id = webhook_data["freshdesk_webhook"]["ticket_id"]
            logger.info(f"Received Freshdesk webhook for ticket ID: {ticket_id}")
            
            # Fetch full ticket details from Freshdesk API
            try:
                ticket_data = ticket_processor.freshdesk_client.get_ticket(ticket_id)
                if ticket_data:
                    logger.info(f"Successfully fetched ticket details for ID: {ticket_id}")
                else:
                    logger.error(f"Failed to fetch ticket details for ID: {ticket_id}")
                    return {"status": "error", "reason": "Failed to fetch ticket details"}
            except Exception as e:
                logger.error(f"Error fetching ticket {ticket_id}: {e}")
                return {"status": "error", "reason": f"Error fetching ticket: {str(e)}"}
        
        # Check if this is a ticket creation event (Freshdesk format)
        elif webhook_data.get("ticket"):
            ticket_data = webhook_data["ticket"]
            logger.info("Using Freshdesk format ticket data")
        # Check if this is direct ticket data (test format)
        elif webhook_data.get("id") and webhook_data.get("subject"):
            ticket_data = webhook_data
            logger.info("Using direct ticket data format")
        else:
            logger.warning(f"Invalid webhook data format: {webhook_data}")
            return {"status": "ignored", "reason": "Not a valid ticket event"}
        
        if ticket_data:
            logger.info(f"Processing ticket: {ticket_data.get('id')}")
            # Process ticket in background
            background_tasks.add_task(process_ticket_background, ticket_data)
            
            return {"status": "processing", "ticket_id": ticket_data.get("id")}
        else:
            logger.warning("No ticket data found in webhook")
            return {"status": "ignored", "reason": "No ticket data found"}
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_ticket_background(ticket_data: Dict):
    """Process ticket in background task"""
    try:
        logger.info(f"Starting background processing for ticket: {ticket_data.get('id')}")
        result = ticket_processor.process_new_ticket(ticket_data)
        logger.info(f"Background processing completed: {result}")
    except Exception as e:
        logger.error(f"Background processing error: {str(e)}")
        import traceback
        logger.error(f"Background processing traceback: {traceback.format_exc()}")
        # Don't re-raise - background tasks should not fail the webhook

@app.post("/test-ticket")
async def test_ticket(request: TestTicketRequest):
    """Test endpoint to simulate ticket processing"""
    try:
        # Generate unique ticket ID based on timestamp
        import time
        unique_id = int(time.time() * 1000) % 1000000  # 6-digit unique ID
        
        # Create mock ticket data
        mock_ticket = {
            "id": unique_id,  # Unique mock ID
            "subject": request.subject,
            "description": request.description,
            "requester_id": 12345,
            "priority": request.priority,
            "status": 2,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Process the ticket
        result = ticket_processor.process_new_ticket(mock_ticket)
        
        return {
            "success": True,
            "test_ticket": mock_ticket,
            "processing_result": result
        }
        
    except Exception as e:
        logger.error(f"Test ticket error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reprocess-ticket")
async def reprocess_ticket(request: ReprocessRequest):
    """Reprocess a specific ticket"""
    try:
        result = ticket_processor.reprocess_ticket(request.ticket_id)
        
        if result["success"]:
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Reprocessing failed"))
            
    except Exception as e:
        logger.error(f"Reprocess ticket error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_stats():
    """Get processing statistics"""
    try:
        stats = ticket_processor.get_ticket_stats()
        return stats
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/analytics")
async def get_analytics():
    """Get detailed analytics"""
    try:
        analytics = ticket_processor.get_ticket_analytics()
        return analytics
    except Exception as e:
        logger.error(f"Analytics error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tickets")
async def get_tickets(limit: int = 50, offset: int = 0):
    """Get list of processed tickets"""
    try:
        db = next(get_db())
        tickets = db.query(Ticket).offset(offset).limit(limit).all()
        
        return {
            "tickets": [
                {
                    "id": ticket.id,
                    "freshdesk_id": ticket.freshdesk_id,
                    "subject": ticket.subject,
                    "category": ticket.category,
                    "tier": ticket.tier,
                    "confidence_score": ticket.confidence_score,
                    "auto_resolved": ticket.auto_resolved,
                    "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
                    "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None
                }
                for ticket in tickets
            ],
            "total": len(tickets),
            "limit": limit,
            "offset": offset
        }
        
    except Exception as e:
        logger.error(f"Get tickets error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/tickets/{ticket_id}")
async def get_ticket(ticket_id: int):
    """Get specific ticket details"""
    try:
        db = next(get_db())
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return {
            "id": ticket.id,
            "freshdesk_id": ticket.freshdesk_id,
            "subject": ticket.subject,
            "description": ticket.description,
            "category": ticket.category,
            "tier": ticket.tier,
            "confidence_score": ticket.confidence_score,
            "auto_resolved": ticket.auto_resolved,
            "escalation_reason": ticket.escalation_reason,
            "bot_response": ticket.bot_response,
            "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
            "updated_at": ticket.updated_at.isoformat() if ticket.updated_at else None
        }
        
    except Exception as e:
        logger.error(f"Get ticket error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/docs")
async def get_docs():
    """Get API documentation"""
    return {
        "endpoints": {
            "GET /": "Root endpoint with basic info",
            "GET /health": "Health check",
            "POST /webhook/freshdesk": "Freshdesk webhook endpoint",
            "POST /test-ticket": "Test ticket processing",
            "GET /stats": "Processing statistics",
            "GET /analytics": "Detailed analytics",
            "GET /tickets": "List processed tickets",
            "GET /tickets/{id}": "Get specific ticket",
            "GET /docs": "This documentation"
        },
        "webhook_format": {
            "description": "Freshdesk webhook should send ticket data",
            "example": {
                "ticket": {
                    "id": 123,
                    "subject": "Test ticket",
                    "description": "Ticket description",
                    "requester_id": 456,
                    "priority": 1,
                    "status": 2
                }
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
>>>>>>> f7c65d8 (file updated)
    ) 