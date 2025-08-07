import asyncio
from typing import Dict, Optional
from datetime import datetime
from loguru import logger
from sqlalchemy.orm import Session

from ai_engine import AIEngine
from freshdesk_client import FreshdeskClient
from models import Ticket, TicketHistory, get_db
from config import settings

class TicketProcessor:
    def __init__(self):
        self.ai_engine = AIEngine()
        self.freshdesk_client = FreshdeskClient()
        self.db = next(get_db())
        
        logger.info("Ticket processor initialized")
    
    def process_new_ticket(self, ticket_data: Dict) -> Dict:
        """
        Process a new ticket from Freshdesk webhook
        Returns processing result
        """
        try:
            logger.info(f"Processing new ticket: {ticket_data.get('id')}")
            
            # Extract ticket information
            ticket_id = ticket_data.get('id')
            subject = ticket_data.get('subject', '')
            description = ticket_data.get('description', '')
            customer_email = ticket_data.get('requester_id')
            priority = ticket_data.get('priority', 1)
            
            # Process with AI engine
            ai_result = self.ai_engine.process_ticket(subject, description)
            
            # Store ticket in database
            ticket = self._store_ticket(ticket_id, subject, description, customer_email, priority, ai_result)
            
            # Handle ticket based on AI classification
            if ai_result['auto_resolvable']:
                self._handle_auto_resolvable_ticket(ticket_id, ai_result)
            elif ai_result['escalation_needed']:
                self._handle_escalation_ticket(ticket_id, ai_result)
            else:
                self._handle_tier_2_ticket(ticket_id, ai_result)
            
            # Log processing result
            self._log_ticket_history(ticket.id, "processed", f"AI classified as {ai_result['tier']} with {ai_result['confidence']:.3f} confidence")
            
            return {
                "success": True,
                "ticket_id": ticket_id,
                "tier": ai_result['tier'],
                "confidence": ai_result['confidence'],
                "category": ai_result['category'],
                "auto_resolvable": ai_result['auto_resolvable'],
                "escalated": ai_result['escalation_needed'],
                "bot_response": ai_result['response'],
                "priority": priority
            }
            
        except Exception as e:
            logger.error(f"Error processing ticket: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def _store_ticket(self, freshdesk_id: int, subject: str, description: str, 
                     customer_email: str, priority: int, ai_result: Dict) -> Ticket:
        """Store ticket information in database"""
        try:
            ticket = Ticket(
                freshdesk_id=freshdesk_id,
                subject=subject,
                description=description,
                customer_email=str(customer_email),
                priority=priority,
                category=ai_result['category'],
                tier=ai_result['tier'],
                confidence_score=ai_result['confidence'],
                auto_resolved=ai_result['auto_resolvable'],
                escalation_reason=ai_result.get('escalation_reason'),
                bot_response=ai_result['response']
            )
            
            self.db.add(ticket)
            self.db.commit()
            self.db.refresh(ticket)
            
            logger.info(f"Ticket {freshdesk_id} stored in database")
            return ticket
            
        except Exception as e:
            logger.error(f"Error storing ticket: {e}")
            self.db.rollback()
            raise
    
    def _handle_auto_resolvable_ticket(self, ticket_id: int, ai_result: Dict):
        """Handle tier 1 tickets that can be auto-resolved"""
        try:
            logger.info(f"Auto-resolving ticket {ticket_id}")
            
            # Add bot response to ticket
            self.freshdesk_client.add_note_to_ticket(
                ticket_id, 
                ai_result['response'], 
                is_private=False
            )
            
            # Auto-resolve the ticket
            self.freshdesk_client.auto_resolve_ticket(ticket_id, ai_result['response'])
            
            # Update database
            ticket = self.db.query(Ticket).filter(Ticket.freshdesk_id == ticket_id).first()
            if ticket:
                ticket.status = "resolved"
                ticket.auto_resolved = True
                self.db.commit()
            
            logger.info(f"Ticket {ticket_id} auto-resolved successfully")
            
        except Exception as e:
            logger.error(f"Error auto-resolving ticket {ticket_id}: {e}")
    
    def _handle_escalation_ticket(self, ticket_id: int, ai_result: Dict):
        """Handle complex tickets that need human escalation"""
        try:
            logger.info(f"Escalating ticket {ticket_id} to human agent")
            
            # Add escalation note
            escalation_note = f"🚨 ESCALATED TO HUMAN AGENT\n\nReason: {ai_result.get('escalation_reason', 'Complex issue requiring human intervention')}\n\nAI Classification: {ai_result['tier']} tier\nConfidence: {ai_result['confidence']:.3f}\n\n{ai_result['response']}"
            
            self.freshdesk_client.add_note_to_ticket(
                ticket_id, 
                escalation_note, 
                is_private=True
            )
            
            # Escalate ticket
            self.freshdesk_client.escalate_ticket(
                ticket_id, 
                ai_result.get('escalation_reason', 'Complex issue')
            )
            
            # Update database
            ticket = self.db.query(Ticket).filter(Ticket.freshdesk_id == ticket_id).first()
            if ticket:
                ticket.status = "escalated"
                ticket.assigned_to = "human_agent"
                self.db.commit()
            
            logger.info(f"Ticket {ticket_id} escalated successfully")
            
        except Exception as e:
            logger.error(f"Error escalating ticket {ticket_id}: {e}")
    
    def _handle_tier_2_ticket(self, ticket_id: int, ai_result: Dict):
        """Handle tier 2 tickets with potential for resolution"""
        try:
            logger.info(f"Processing tier 2 ticket {ticket_id}")
            
            # Add bot response
            self.freshdesk_client.add_note_to_ticket(
                ticket_id, 
                ai_result['response'], 
                is_private=False
            )
            
            # Update ticket status to "pending"
            self.freshdesk_client.update_ticket_status(ticket_id, 3)  # Pending status
            
            # Update database
            ticket = self.db.query(Ticket).filter(Ticket.freshdesk_id == ticket_id).first()
            if ticket:
                ticket.status = "pending"
                self.db.commit()
            
            logger.info(f"Tier 2 ticket {ticket_id} processed")
            
        except Exception as e:
            logger.error(f"Error processing tier 2 ticket {ticket_id}: {e}")
    
    def _log_ticket_history(self, ticket_id: int, action: str, details: str):
        """Log ticket processing history"""
        try:
            history = TicketHistory(
                ticket_id=ticket_id,
                action=action,
                details=details
            )
            
            self.db.add(history)
            self.db.commit()
            
        except Exception as e:
            logger.error(f"Error logging ticket history: {e}")
    
    def get_ticket_stats(self) -> Dict:
        """Get processing statistics"""
        try:
            total_tickets = self.db.query(Ticket).count()
            auto_resolved = self.db.query(Ticket).filter(Ticket.auto_resolved == True).count()
            escalated = self.db.query(Ticket).filter(Ticket.status == "escalated").count()
            pending = self.db.query(Ticket).filter(Ticket.status == "pending").count()
            
            return {
                "total_tickets": total_tickets,
                "auto_resolved": auto_resolved,
                "escalated": escalated,
                "pending": pending,
                "auto_resolution_rate": (auto_resolved / total_tickets * 100) if total_tickets > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Error getting ticket stats: {e}")
            return {}
    
    def reprocess_ticket(self, ticket_id: int) -> Dict:
        """Reprocess a specific ticket"""
        try:
            # Get ticket from Freshdesk
            ticket_data = self.freshdesk_client.get_ticket(ticket_id)
            if not ticket_data:
                return {"success": False, "error": "Ticket not found"}
            
            # Process again
            return self.process_new_ticket(ticket_data)
            
        except Exception as e:
            logger.error(f"Error reprocessing ticket {ticket_id}: {e}")
            return {"success": False, "error": str(e)}
    
    def get_ticket_analytics(self) -> Dict:
        """Get detailed analytics about ticket processing"""
        try:
            # Get tickets by tier
            tier_1_count = self.db.query(Ticket).filter(Ticket.tier == "tier_1").count()
            tier_2_count = self.db.query(Ticket).filter(Ticket.tier == "tier_2").count()
            complex_count = self.db.query(Ticket).filter(Ticket.tier == "complex").count()
            
            # Get average confidence scores
            avg_confidence = self.db.query(Ticket.confidence_score).filter(
                Ticket.confidence_score.isnot(None)
            ).all()
            avg_confidence = sum([c[0] for c in avg_confidence]) / len(avg_confidence) if avg_confidence else 0
            
            # Get recent activity
            recent_tickets = self.db.query(Ticket).order_by(Ticket.created_at.desc()).limit(10).all()
            
            return {
                "tier_distribution": {
                    "tier_1": tier_1_count,
                    "tier_2": tier_2_count,
                    "complex": complex_count
                },
                "average_confidence": avg_confidence,
                "recent_tickets": [
                    {
                        "id": t.freshdesk_id,
                        "subject": t.subject,
                        "tier": t.tier,
                        "status": t.status,
                        "created_at": t.created_at.isoformat()
                    }
                    for t in recent_tickets
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting analytics: {e}")
            return {} 