---
Title: AI Customer Ticket Resolution Bot
sdk: gradio
sdk_version: 4.7.1
app_file: app.py
pinned: false
---

#  AI Customer Ticket Resolution Bot

**Real-time AI-powered customer support automation with Freshdesk integration and robust fallback systems**

## 🚀 **Live Demo**
**[Deployed on Hugging Face Spaces](https://huggingface.co/spaces/vinayabc1824/AI-Customer-Ticket-Resolution-Bot)**

---

## ✨ **Features**

### 🤖 **AI-Powered Classification**
- **Smart Tier Classification:** Automatically categorizes tickets into Tier 1, Tier 2, or Complex
- **Keyword-Based Fallback:** Robust classification even when advanced models fail
- **Confidence Scoring:** Provides confidence levels for each classification
- **Category Detection:** Identifies ticket categories (password reset, billing, technical, etc.)

### 🔍 **Retrieval-Augmented Generation (RAG)**
- **Semantic Search:** Uses sentence transformers for intelligent document retrieval
- **Keyword Fallback:** Simple keyword matching when embeddings aren't available
- **Knowledge Base Integration:** Searches through internal documentation
- **Contextual Responses:** Generates relevant responses based on found information

### 🔗 **Freshdesk Integration**
- **Webhook Support:** Real-time ticket processing via Freshdesk webhooks
- **REST API Integration:** Direct communication with Freshdesk API
- **HMAC Verification:** Secure webhook signature verification
- **Automatic Responses:** Posts AI-generated responses back to tickets

### 🛡️ **Robust Architecture**
- **Graceful Fallbacks:** Works even when AI models fail to load
- **Error Recovery:** Multiple fallback mechanisms for reliability
- **Compatibility:** Optimized for Hugging Face Spaces deployment
- **Stable Dependencies:** Carefully selected versions for maximum compatibility

---

## 🏗️ **Architecture**

### **Backend Stack**
- **FastAPI:** High-performance web framework
- **Uvicorn:** ASGI server for production deployment
- **SQLAlchemy:** Database ORM with SQLite
- **Loguru:** Advanced logging system

### **AI/ML Stack**
- **PyTorch 1.13.1:** Stable deep learning framework
- **Transformers 4.30.0:** Hugging Face model library
- **Sentence Transformers:** For semantic embeddings
- **Scikit-learn:** For similarity calculations

### **Frontend Stack**
- **Gradio:** Beautiful web interface for Hugging Face Spaces
- **Modern UI:** Responsive design with multiple tabs
- **Real-time Testing:** Interactive testing of AI capabilities

---

## 🚀 **Quick Start**

### **Local Development**
```bash
# Clone the repository
https://github.com/RohithCherukuri816/AI-Customer-Ticket-Resolution-Bot.git
cd AI-Customer-Ticket-Resolution-Bot

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your Freshdesk credentials

# Run the application
python app.py
```

### **Hugging Face Spaces Deployment**
1. **Create a new Space** on Hugging Face
2. **Upload the code** via Git or web interface
3. **Configure secrets** in Space settings:
   - `FRESHDESK_API_KEY`
   - `FRESHDESK_DOMAIN`
   - `WEBHOOK_SECRET`
4. **Deploy automatically** - the Space will build and run

---

## ⚙️ **Configuration**

### **Environment Variables**
```bash
# Freshdesk Configuration
FRESHDESK_API_KEY=your_api_key_here
FRESHDESK_DOMAIN=your_domain.freshdesk.com
WEBHOOK_SECRET=your_webhook_secret

# Optional Settings
LOG_LEVEL=INFO
WEBHOOK_URL=https://your-domain.com/webhook
```

### **Knowledge Base Setup**
Place your FAQ documents in the `docs/` folder:
```
docs/
├── password_reset.txt
├── billing_issues.txt
├── account_management.txt
└── technical_support.txt
```

---

## 🔧 **API Endpoints**

### **Webhook Endpoint**
```
POST /webhook
```
Receives Freshdesk webhook notifications and processes tickets automatically.

### **Manual Ticket Processing**
```
POST /process-ticket
{
  "subject": "Password reset issue",
  "description": "I can't reset my password..."
}
```

### **Health Check**
```
GET /health
```
Returns system status and health information.

---

## 🧪 **Testing Features**

### **Interactive Testing Interface**
The Gradio interface provides multiple testing tabs:

1. **🎯 Ticket Classification:** Test how the AI categorizes tickets
2. **🔍 RAG Query Testing:** Test knowledge base retrieval
3. **🏥 System Status:** Monitor system health and configuration
4. **📚 Documentation:** Complete feature overview

### **Example Test Cases**
```python
# Tier 1 - Simple Issue
subject = "Password reset not working"
description = "I clicked the reset link but it doesn't work"

# Tier 2 - Moderate Issue  
subject = "Billing question"
description = "I was charged twice this month"

# Complex - Technical Issue
subject = "System crash"
description = "The application keeps crashing with error code 500"
```

---

## 🔄 **How It Works**

### **1. Ticket Reception**
- Freshdesk sends webhook notification
- System validates HMAC signature
- Extracts ticket data (subject, description, ID)

### **2. AI Analysis**
- **Classification:** Determines ticket tier (1, 2, or Complex)
- **Category Detection:** Identifies ticket type
- **Confidence Scoring:** Provides confidence level

### **3. Knowledge Retrieval**
- **Semantic Search:** Uses embeddings to find relevant docs
- **Keyword Fallback:** Simple matching if embeddings fail
- **Context Extraction:** Finds most relevant information

### **4. Response Generation**
- **Tier 1:** Auto-resolve with direct solution
- **Tier 2:** Provide solution with escalation option
- **Complex:** Escalate to human agent

### **5. Freshdesk Update**
- Posts AI response back to ticket
- Updates ticket status if auto-resolvable
- Logs all actions for audit trail

---

## 🛡️ **Robust Fallback System**

### **Model Loading Failures**
- **Import Errors:** Falls back to keyword-based classification
- **Download Failures:** Uses cached models or basic functionality
- **Memory Issues:** Graceful degradation to simpler methods

### **Classification Fallbacks**
1. **Advanced Models:** Zero-shot classification (if available)
2. **Keyword Matching:** Simple keyword-based classification
3. **Default Classification:** Always defaults to "complex" tier

### **RAG Fallbacks**
1. **Semantic Search:** Embedding-based similarity (if available)
2. **Keyword Matching:** Simple word overlap search
3. **Default Response:** Generic support message

---

## 📊 **Performance & Monitoring**

### **System Health**
- **Model Status:** Tracks AI model loading status
- **Knowledge Base:** Monitors document availability
- **Freshdesk Connection:** Verifies API connectivity
- **Error Logging:** Comprehensive error tracking

### **Performance Metrics**
- **Response Time:** Average processing time per ticket
- **Classification Accuracy:** Success rate of tier classification
- **RAG Relevance:** Quality of retrieved responses
- **Error Rate:** System reliability metrics

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Model Loading Errors**
```bash
# Check if models are downloading correctly
python -c "from transformers import AutoTokenizer; AutoTokenizer.from_pretrained('facebook/bart-large-mnli')"
```

#### **Freshdesk Webhook Issues**
```bash
# Verify webhook signature
curl -X POST https://your-domain.com/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

#### **Memory Issues**
- Reduce model size in `config.py`
- Use CPU-only mode for deployment
- Enable model caching

### **Debug Mode**
```bash
# Enable debug logging
export LOG_LEVEL=DEBUG
python app.py
```

---

## 🤝 **Contributing**

### **Development Setup**
```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
pytest tests/

# Format code
black .
isort .
```

### **Adding New Features**
1. **Create feature branch**
2. **Add tests** for new functionality
3. **Update documentation**
4. **Submit pull request**

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Hugging Face** for the excellent transformers library
- **Freshdesk** for the comprehensive API
- **Gradio** for the beautiful UI framework
- **FastAPI** for the high-performance web framework

---

**Built with ❤️ for automated customer support**

*Last updated: August 2024* 


