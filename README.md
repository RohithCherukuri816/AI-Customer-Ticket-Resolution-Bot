<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=🎫%20AI%20Ticket%20Resolution&fontSize=35&fontAlignY=40&animation=fadeIn&desc=Automated%20Support%20%7C%20Freshdesk%20Integration%20%7C%20RAG%20System&descAlignY=65&descSize=16" />

<img src="https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=24&duration=3000&pause=1000&color=059669&center=true&vCenter=true&width=800&lines=🤖+AI-Powered+Support+Automation;🎯+Smart+Ticket+Classification;🔍+RAG-Based+Knowledge+Retrieval;⚡+Real-time+Resolution+System" alt="Typing SVG" />

<p align="center">
  <img src="https://img.shields.io/badge/AI-Powered-059669?style=for-the-badge&logo=brain&logoColor=white" alt="AI Powered" />
  <img src="https://img.shields.io/badge/Freshdesk-Integration-FF6B6B?style=for-the-badge&logo=freshdesk&logoColor=white" alt="Freshdesk" />
  <img src="https://img.shields.io/badge/RAG-System-4F46E5?style=for-the-badge&logo=search&logoColor=white" alt="RAG System" />
  <img src="https://img.shields.io/badge/Gradio-Interface-FF9500?style=for-the-badge&logo=gradio&logoColor=white" alt="Gradio" />
</p>

<p align="center">
  <a href="https://huggingface.co/spaces/vinayabc1824/AI-Customer-Ticket-Resolution-Bot">
    <img src="https://img.shields.io/badge/🚀_Live_Demo-Try_Now-059669?style=for-the-badge&logo=rocket&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/github/stars/yourusername/ai-ticket-resolution?style=social" alt="GitHub stars" />
</p>

---

### 🌟 Real-time AI-powered customer support automation with Freshdesk integration and robust fallback systems

</div>

---

<div align="center">

## ✨ Features & Capabilities

<img src="https://user-images.githubusercontent.com/74038190/212284158-e840e285-664b-44d7-b79b-e264b5e54825.gif" width="400">

</div>

<table>
<tr>
<td align="center" width="50%">
<img src="https://user-images.githubusercontent.com/74038190/212257472-08e52665-c503-4bd9-aa20-f5a4dae769b5.gif" width="100"><br>
<h3>🤖 AI-Powered Classification</h3>
<ul align="left">
<li><b>Smart Tier Classification:</b> Auto-categorizes tickets into Tier 1, 2, or Complex</li>
<li><b>Keyword-Based Fallback:</b> Robust classification when models fail</li>
<li><b>Confidence Scoring:</b> Provides confidence levels for each classification</li>
<li><b>Category Detection:</b> Identifies ticket types (password, billing, technical)</li>
</ul>
</td>
<td align="center" width="50%">
<img src="https://user-images.githubusercontent.com/74038190/212257468-1e9a91f1-b626-4baa-b15d-5c385dfa7763.gif" width="100"><br>
<h3>🔍 RAG System</h3>
<ul align="left">
<li><b>Semantic Search:</b> Sentence transformers for intelligent retrieval</li>
<li><b>Keyword Fallback:</b> Simple matching when embeddings unavailable</li>
<li><b>Knowledge Base:</b> Searches through internal documentation</li>
<li><b>Contextual Responses:</b> Generates relevant responses from found info</li>
</ul>
</td>
</tr>
<tr>
<td align="center">
<img src="https://user-images.githubusercontent.com/74038190/212257465-7ce8d493-cac5-494e-982a-5a9deb852c4b.gif" width="100"><br>
<h3>🔗 Freshdesk Integration</h3>
<ul align="left">
<li><b>Webhook Support:</b> Real-time ticket processing</li>
<li><b>REST API:</b> Direct communication with Freshdesk</li>
<li><b>HMAC Verification:</b> Secure webhook signatures</li>
<li><b>Auto Responses:</b> Posts AI-generated replies back</li>
</ul>
</td>
<td align="center">
<img src="https://user-images.githubusercontent.com/74038190/212257460-738ff738-247f-4445-a718-cdd0ca76e2db.gif" width="100"><br>
<h3>🛡️ Robust Architecture</h3>
<ul align="left">
<li><b>Graceful Fallbacks:</b> Works when AI models fail</li>
<li><b>Error Recovery:</b> Multiple fallback mechanisms</li>
<li><b>HF Compatibility:</b> Optimized for Spaces deployment</li>
<li><b>Stable Dependencies:</b> Carefully selected versions</li>
</ul>
</td>
</tr>
</table>

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

<div align="center">

---

## 🤝 Contributing

<img src="https://user-images.githubusercontent.com/74038190/212284115-f47cd8ff-2ffb-4b04-b5bf-4d1c14c0247f.gif" width="100">

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

<table>
<tr>
<td align="center">
<img src="https://img.shields.io/badge/Issues-Welcome-brightgreen?style=for-the-badge&logo=github" /><br>
<b>Report Bugs</b>
</td>
<td align="center">
<img src="https://img.shields.io/badge/PRs-Welcome-blue?style=for-the-badge&logo=git" /><br>
<b>Submit PRs</b>
</td>
<td align="center">
<img src="https://img.shields.io/badge/Ideas-Welcome-purple?style=for-the-badge&logo=lightbulb" /><br>
<b>Share Ideas</b>
</td>
</tr>
</table>

## 📊 Project Stats

<div align="center">
<img src="https://github-readme-stats.vercel.app/api?username=yourusername&repo=ai-ticket-resolution&show_icons=true&theme=radical" alt="GitHub Stats" />
</div>

## 📄 License

<img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="MIT License" />

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 💜 Built with ❤️ by Rohith Cherukuri

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="500">


**⭐ Star this repo if you found it helpful!**

*Last updated: August 2024*

</div>

---

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer" />
</div> 




