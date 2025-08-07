import gradio as gr
import os
import sys
from pathlib import Path

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

from main import app
from ai_engine import AIEngine
from config import settings
import uvicorn
import threading
import time
from loguru import logger

# Initialize AI Engine
ai_engine = None

def initialize_ai_engine():
    """Initialize the AI engine in a separate thread"""
    global ai_engine
    try:
        logger.info("Initializing AI Engine...")
        ai_engine = AIEngine()
        logger.info("AI Engine initialized successfully!")
    except Exception as e:
        logger.error(f"Error initializing AI Engine: {e}")

def test_ticket_classification(subject, description):
    """Test ticket classification with the AI engine"""
    global ai_engine
    
    if ai_engine is None:
        return "AI Engine is still initializing. Please wait a moment and try again."
    
    try:
        # Categorize the ticket
        tier, confidence, category = ai_engine.categorize_ticket(subject, description)
        
        # Get RAG response
        rag_response = ai_engine.get_rag_response(f"{subject} {description}")
        
        result = f"""
## 🎯 **Ticket Classification Results**

**Subject:** {subject}
**Description:** {description}

### 📊 **Classification:**
- **Tier:** {tier.upper()}
- **Category:** {category}
- **Confidence:** {confidence:.2%}

### 🤖 **AI Response:**
{rag_response}

### 📋 **Next Steps:**
"""
        
        if tier == "tier_1":
            result += "- ✅ **Auto-resolved** - Simple issue handled automatically"
        elif tier == "tier_2":
            result += "- 🔄 **Escalated to Tier 2** - Moderate complexity requiring specialized attention"
        else:
            result += "- 🚨 **Escalated to Human Agent** - Complex issue requiring human intervention"
        
        return result
        
    except Exception as e:
        logger.error(f"Error in ticket classification: {e}")
        return f"Error processing ticket: {str(e)}"

def test_rag_query(query):
    """Test RAG functionality with a query"""
    global ai_engine
    
    if ai_engine is None:
        return "AI Engine is still initializing. Please wait a moment and try again."
    
    try:
        response = ai_engine.get_rag_response(query)
        return f"""
## 🔍 **RAG Query Results**

**Query:** {query}

### 📝 **Response:**
{response}
"""
    except Exception as e:
        logger.error(f"Error in RAG query: {e}")
        return f"Error processing query: {str(e)}"

def get_system_status():
    """Get system status and health"""
    global ai_engine
    
    status = {
        "AI Engine": "✅ Ready" if ai_engine is not None else "⏳ Initializing...",
        "Models Loaded": "✅ Yes" if ai_engine is not None else "❌ No",
        "Knowledge Base": "✅ Loaded" if ai_engine and hasattr(ai_engine, 'knowledge_texts') and ai_engine.knowledge_texts else "❌ Not Available",
        "Freshdesk Integration": "✅ Configured" if settings.FRESHDESK_API_KEY else "❌ Not Configured",
        "Webhook URL": "✅ Available" if settings.WEBHOOK_URL else "❌ Not Set"
    }
    
    status_text = "\n".join([f"- **{key}:** {value}" for key, value in status.items()])
    
    return f"""
## 🏥 **System Status**

{status_text}

### 📊 **Configuration:**
- **Freshdesk Domain:** {settings.FRESHDESK_DOMAIN or 'Not Set'}
- **API Key:** {'✅ Configured' if settings.FRESHDESK_API_KEY else '❌ Not Set'}
- **Webhook Secret:** {'✅ Configured' if settings.WEBHOOK_SECRET else '❌ Not Set'}
"""

# Create Gradio interface
with gr.Blocks(
    title="AI Customer Ticket Resolution Bot",
    theme=gr.themes.Soft(),
    css="""
    .gradio-container {
        max-width: 1200px !important;
    }
    """
) as demo:
    
    gr.Markdown("""
    # 🤖 AI Customer Ticket Resolution Bot
    
    **Real-time AI-powered customer support automation with Freshdesk integration**
    
    ---
    """)
    
    with gr.Tabs():
        
        # Tab 1: Ticket Classification
        with gr.TabItem("🎯 Ticket Classification"):
            gr.Markdown("""
            ### Test Ticket Classification
            
            Enter a ticket subject and description to see how the AI categorizes it.
            """)
            
            with gr.Row():
                with gr.Column():
                    subject_input = gr.Textbox(
                        label="Ticket Subject",
                        placeholder="e.g., Password reset not working",
                        lines=2
                    )
                    description_input = gr.Textbox(
                        label="Ticket Description", 
                        placeholder="e.g., I've been trying to reset my password for 2 hours but the link in the email doesn't work...",
                        lines=4
                    )
                    classify_btn = gr.Button("🎯 Classify Ticket", variant="primary")
                
                with gr.Column():
                    classification_output = gr.Markdown(label="Classification Results")
            
            classify_btn.click(
                fn=test_ticket_classification,
                inputs=[subject_input, description_input],
                outputs=classification_output
            )
        
        # Tab 2: RAG Testing
        with gr.TabItem("🔍 RAG Query Testing"):
            gr.Markdown("""
            ### Test Retrieval-Augmented Generation (RAG)
            
            Ask questions to test the knowledge base retrieval system.
            """)
            
            with gr.Row():
                with gr.Column():
                    rag_query = gr.Textbox(
                        label="Query",
                        placeholder="e.g., How do I reset my password?",
                        lines=3
                    )
                    rag_btn = gr.Button("🔍 Get RAG Response", variant="primary")
                
                with gr.Column():
                    rag_output = gr.Markdown(label="RAG Response")
            
            rag_btn.click(
                fn=test_rag_query,
                inputs=[rag_query],
                outputs=rag_output
            )
        
        # Tab 3: System Status
        with gr.TabItem("🏥 System Status"):
            gr.Markdown("""
            ### System Health and Configuration
            
            Check the status of all system components.
            """)
            
            status_btn = gr.Button("🔄 Refresh Status", variant="secondary")
            status_output = gr.Markdown(label="System Status")
            
            status_btn.click(
                fn=get_system_status,
                inputs=[],
                outputs=status_output
            )
        
        # Tab 4: Documentation
        with gr.TabItem("📚 Documentation"):
            gr.Markdown("""
            ## 🚀 **AI Customer Ticket Resolution Bot**
            
            ### **Features:**
            - 🤖 **AI-Powered Classification:** Automatically categorizes tickets into Tier 1, Tier 2, or Complex
            - 🔍 **RAG System:** Retrieves relevant information from knowledge base
            - 🔗 **Freshdesk Integration:** Seamless webhook integration
            - 📊 **Real-time Processing:** Instant ticket analysis and response
            
            ### **How It Works:**
            1. **Ticket Reception:** Freshdesk sends webhook notifications
            2. **AI Analysis:** Ticket is analyzed using zero-shot classification
            3. **Knowledge Retrieval:** RAG system finds relevant documentation
            4. **Response Generation:** AI generates appropriate responses
            5. **Escalation:** Complex tickets are escalated to human agents
            
            ### **Deployment:**
            - **Backend:** FastAPI with uvicorn
            - **Frontend:** Gradio interface
            - **Platform:** Hugging Face Spaces
            - **Database:** SQLite for ticket storage
            
            ### **Models Used:**
            - **Classification:** `facebook/bart-large-mnli`
            - **Embeddings:** `sentence-transformers/all-MiniLM-L6-v2`
            - **Similarity:** Cosine similarity with scikit-learn
            
            ---
            
            **Built with ❤️ for automated customer support**
            """)
    
    # Initialize AI Engine in background
    gr.Markdown("""
    <div style="text-align: center; padding: 20px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; margin: 20px 0;">
        <h3>🚀 Ready for Production Deployment</h3>
        <p>This bot is designed to handle real customer support tickets with AI-powered automation.</p>
    </div>
    """)

# Start AI Engine initialization in background
threading.Thread(target=initialize_ai_engine, daemon=True).start()

# Launch the app
if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    ) 