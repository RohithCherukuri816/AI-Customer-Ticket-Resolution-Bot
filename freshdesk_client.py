<<<<<<< HEAD
import requests
import json
from typing import Dict, List, Optional
from datetime import datetime
from loguru import logger
from config import settings

class FreshdeskClient:
    def __init__(self):
        self.domain = settings.FRESHDESK_DOMAIN
        self.api_key = settings.FRESHDESK_API_KEY
        self.base_url = f"https://{self.domain}.freshdesk.com/api/v2"
        self.auth = (self.api_key, "X")  # Freshdesk uses API key as username
        
        if not self.domain or not self.api_key:
            logger.warning("Freshdesk credentials not configured!")
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request to Freshdesk API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {"Content-Type": "application/json"}
            
            response = requests.request(
                method=method,
                url=url,
                auth=self.auth,
                headers=headers,
                json=data
            )
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                logger.error(f"Freshdesk API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error making Freshdesk API request: {e}")
            return None
    
    def get_ticket(self, ticket_id: int) -> Optional[Dict]:
        """Get ticket details by ID"""
        return self._make_request("GET", f"tickets/{ticket_id}")
    
    def update_ticket(self, ticket_id: int, data: Dict) -> Optional[Dict]:
        """Update ticket with new data"""
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def add_note_to_ticket(self, ticket_id: int, note: str, is_private: bool = False) -> Optional[Dict]:
        """Add a note/comment to a ticket"""
        data = {
            "body": note,
            "private": is_private
        }
        return self._make_request("POST", f"tickets/{ticket_id}/notes", data)
    
    def assign_ticket(self, ticket_id: int, agent_id: int) -> Optional[Dict]:
        """Assign ticket to a specific agent"""
        data = {"responder_id": agent_id}
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def update_ticket_status(self, ticket_id: int, status: int) -> Optional[Dict]:
        """Update ticket status"""
        data = {"status": status}
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def get_agents(self) -> List[Dict]:
        """Get list of available agents"""
        result = self._make_request("GET", "agents")
        return result if result else []
    
    def get_agent_by_email(self, email: str) -> Optional[Dict]:
        """Get agent details by email"""
        agents = self.get_agents()
        for agent in agents:
            if agent.get("email") == email:
                return agent
        return None
    
    def resolve_ticket(self, ticket_id: int, resolution_note: str = "") -> Optional[Dict]:
        """Resolve a ticket with optional resolution note"""
        data = {
            "status": 5,  # Resolved status
            "resolution": resolution_note
        }
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def close_ticket(self, ticket_id: int) -> Optional[Dict]:
        """Close a ticket"""
        data = {"status": 6}  # Closed status
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def escalate_ticket(self, ticket_id: int, escalation_reason: str) -> Optional[Dict]:
        """Escalate ticket to human agent"""
        # Add escalation note
        note = f"🚨 ESCALATED TO HUMAN AGENT\n\nReason: {escalation_reason}\n\nThis ticket requires human intervention."
        self.add_note_to_ticket(ticket_id, note, is_private=True)
        
        # Update priority to high
        data = {"priority": 3}  # High priority
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def auto_resolve_ticket(self, ticket_id: int, bot_response: str) -> Optional[Dict]:
        """Auto-resolve ticket with bot response"""
        # Add bot response as public note
        note = f"🤖 AUTOMATED RESPONSE\n\n{bot_response}\n\nThis ticket has been automatically resolved by our AI assistant."
        self.add_note_to_ticket(ticket_id, note, is_private=False)
        
        # Resolve the ticket
        return self.resolve_ticket(ticket_id, "Resolved by AI assistant")
    
    def get_ticket_conversations(self, ticket_id: int) -> List[Dict]:
        """Get ticket conversation history"""
        result = self._make_request("GET", f"tickets/{ticket_id}/conversations")
        return result if result else []
    
    def create_ticket(self, data: Dict) -> Optional[Dict]:
        """Create a new ticket"""
        return self._make_request("POST", "tickets", data)
    
    def search_tickets(self, query: str) -> List[Dict]:
        """Search tickets using Freshdesk search"""
        # Note: This is a simplified search - Freshdesk has more complex search capabilities
        endpoint = f"search/tickets?query=\"{query}\""
        result = self._make_request("GET", endpoint)
        return result.get("results", []) if result else []
    
    def get_ticket_fields(self) -> List[Dict]:
        """Get custom ticket fields"""
        result = self._make_request("GET", "ticket_fields")
        return result if result else []
    
    def update_custom_field(self, ticket_id: int, field_name: str, value: str) -> Optional[Dict]:
        """Update a custom field on a ticket"""
        data = {"custom_fields": {field_name: value}}
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def get_ticket_stats(self, ticket_id: int) -> Optional[Dict]:
        """Get ticket statistics"""
        return self._make_request("GET", f"tickets/{ticket_id}/time_entries")
    
    def add_time_entry(self, ticket_id: int, time_spent: int, note: str = "") -> Optional[Dict]:
        """Add time entry to ticket"""
        data = {
            "time_entry": {
                "time_spent": time_spent,
                "note": note
            }
        }
        return self._make_request("POST", f"tickets/{ticket_id}/time_entries", data)
    
    def get_satisfaction_ratings(self, ticket_id: int) -> Optional[Dict]:
        """Get customer satisfaction ratings for a ticket"""
        return self._make_request("GET", f"tickets/{ticket_id}/satisfaction_ratings")
    
    def test_connection(self) -> bool:
        """Test if Freshdesk API connection is working"""
        try:
            result = self._make_request("GET", "tickets")
            return result is not None
        except Exception as e:
            logger.error(f"Freshdesk connection test failed: {e}")
=======
import requests
import json
from typing import Dict, List, Optional
from datetime import datetime
from loguru import logger
from config import settings

class FreshdeskClient:
    def __init__(self):
        self.domain = settings.FRESHDESK_DOMAIN
        self.api_key = settings.FRESHDESK_API_KEY
        self.base_url = f"https://{self.domain}.freshdesk.com/api/v2"
        self.auth = (self.api_key, "X")  # Freshdesk uses API key as username
        
        if not self.domain or not self.api_key:
            logger.warning("Freshdesk credentials not configured!")
    
    def _make_request(self, method: str, endpoint: str, data: Optional[Dict] = None) -> Optional[Dict]:
        """Make HTTP request to Freshdesk API"""
        try:
            url = f"{self.base_url}/{endpoint}"
            headers = {"Content-Type": "application/json"}
            
            response = requests.request(
                method=method,
                url=url,
                auth=self.auth,
                headers=headers,
                json=data
            )
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                logger.error(f"Freshdesk API error: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            logger.error(f"Error making Freshdesk API request: {e}")
            return None
    
    def get_ticket(self, ticket_id: int) -> Optional[Dict]:
        """Get ticket details by ID"""
        return self._make_request("GET", f"tickets/{ticket_id}")
    
    def update_ticket(self, ticket_id: int, data: Dict) -> Optional[Dict]:
        """Update ticket with new data"""
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def add_note_to_ticket(self, ticket_id: int, note: str, is_private: bool = False) -> Optional[Dict]:
        """Add a note/comment to a ticket"""
        data = {
            "body": note,
            "private": is_private
        }
        return self._make_request("POST", f"tickets/{ticket_id}/notes", data)
    
    def assign_ticket(self, ticket_id: int, agent_id: int) -> Optional[Dict]:
        """Assign ticket to a specific agent"""
        data = {"responder_id": agent_id}
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def update_ticket_status(self, ticket_id: int, status: int) -> Optional[Dict]:
        """Update ticket status"""
        data = {"status": status}
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def get_agents(self) -> List[Dict]:
        """Get list of available agents"""
        result = self._make_request("GET", "agents")
        return result if result else []
    
    def get_agent_by_email(self, email: str) -> Optional[Dict]:
        """Get agent details by email"""
        agents = self.get_agents()
        for agent in agents:
            if agent.get("email") == email:
                return agent
        return None
    
    def resolve_ticket(self, ticket_id: int, resolution_note: str = "") -> Optional[Dict]:
        """Resolve a ticket with optional resolution note"""
        data = {
            "status": 5,  # Resolved status
            "resolution": resolution_note
        }
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def close_ticket(self, ticket_id: int) -> Optional[Dict]:
        """Close a ticket"""
        data = {"status": 6}  # Closed status
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def escalate_ticket(self, ticket_id: int, escalation_reason: str) -> Optional[Dict]:
        """Escalate ticket to human agent"""
        # Add escalation note
        note = f"🚨 ESCALATED TO HUMAN AGENT\n\nReason: {escalation_reason}\n\nThis ticket requires human intervention."
        self.add_note_to_ticket(ticket_id, note, is_private=True)
        
        # Update priority to high
        data = {"priority": 3}  # High priority
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def auto_resolve_ticket(self, ticket_id: int, bot_response: str) -> Optional[Dict]:
        """Auto-resolve ticket with bot response"""
        # Add bot response as public note
        note = f"🤖 AUTOMATED RESPONSE\n\n{bot_response}\n\nThis ticket has been automatically resolved by our AI assistant."
        self.add_note_to_ticket(ticket_id, note, is_private=False)
        
        # Resolve the ticket
        return self.resolve_ticket(ticket_id, "Resolved by AI assistant")
    
    def get_ticket_conversations(self, ticket_id: int) -> List[Dict]:
        """Get ticket conversation history"""
        result = self._make_request("GET", f"tickets/{ticket_id}/conversations")
        return result if result else []
    
    def create_ticket(self, data: Dict) -> Optional[Dict]:
        """Create a new ticket"""
        return self._make_request("POST", "tickets", data)
    
    def search_tickets(self, query: str) -> List[Dict]:
        """Search tickets using Freshdesk search"""
        # Note: This is a simplified search - Freshdesk has more complex search capabilities
        endpoint = f"search/tickets?query=\"{query}\""
        result = self._make_request("GET", endpoint)
        return result.get("results", []) if result else []
    
    def get_ticket_fields(self) -> List[Dict]:
        """Get custom ticket fields"""
        result = self._make_request("GET", "ticket_fields")
        return result if result else []
    
    def update_custom_field(self, ticket_id: int, field_name: str, value: str) -> Optional[Dict]:
        """Update a custom field on a ticket"""
        data = {"custom_fields": {field_name: value}}
        return self._make_request("PUT", f"tickets/{ticket_id}", data)
    
    def get_ticket_stats(self, ticket_id: int) -> Optional[Dict]:
        """Get ticket statistics"""
        return self._make_request("GET", f"tickets/{ticket_id}/time_entries")
    
    def add_time_entry(self, ticket_id: int, time_spent: int, note: str = "") -> Optional[Dict]:
        """Add time entry to ticket"""
        data = {
            "time_entry": {
                "time_spent": time_spent,
                "note": note
            }
        }
        return self._make_request("POST", f"tickets/{ticket_id}/time_entries", data)
    
    def get_satisfaction_ratings(self, ticket_id: int) -> Optional[Dict]:
        """Get customer satisfaction ratings for a ticket"""
        return self._make_request("GET", f"tickets/{ticket_id}/satisfaction_ratings")
    
    def test_connection(self) -> bool:
        """Test if Freshdesk API connection is working"""
        try:
            result = self._make_request("GET", "tickets")
            return result is not None
        except Exception as e:
            logger.error(f"Freshdesk connection test failed: {e}")
>>>>>>> f7c65d8 (file updated)
            return False 