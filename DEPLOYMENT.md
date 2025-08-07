# 🚀 Hugging Face Spaces Deployment Guide

## 📋 **Prerequisites**

1. **Hugging Face Account**
   - Sign up at [huggingface.co](https://huggingface.co)
   - Verify your email address

2. **Git Setup**
   - Install Git on your system
   - Configure Git with your credentials

## 🌐 **Step 1: Create a New Space**

1. **Navigate to Spaces**
   - Go to [Hugging Face Spaces](https://huggingface.co/spaces)
   - Click "Create new Space"

2. **Configure Space Settings**
   - **Owner:** Your username
   - **Space name:** `ai-ticket-resolution-bot` (or your preferred name)
   - **License:** MIT
   - **SDK:** Select **Gradio**
   - **Visibility:** Public (recommended) or Private
   - **Hardware:** CPU (free) or GPU (paid)

3. **Create the Space**
   - Click "Create Space"
   - Wait for the space to be created

## 📁 **Step 2: Upload Your Code**

### **Option A: Using Git (Recommended)**

```bash
# Clone your space repository
git clone https://huggingface.co/spaces/YOUR_USERNAME/ai-ticket-resolution-bot
cd ai-ticket-resolution-bot

# Copy your project files
cp -r /path/to/your/project/* .

# Add all files
git add .

# Commit changes
git commit -m "Initial deployment: AI Customer Ticket Resolution Bot"

# Push to Hugging Face
git push
```

### **Option B: Using Web Interface**

1. **Upload Files**
   - Go to your space page
   - Click "Files" tab
   - Upload all project files manually

2. **Required Files:**
   ```
   app.py                    # Gradio interface
   main.py                   # FastAPI backend
   ai_engine.py             # AI processing logic
   config.py                # Configuration settings
   models.py                # Database models
   ticket_processor.py      # Ticket processing
   freshdesk_client.py      # Freshdesk integration
   requirements.txt         # Python dependencies
   README.md               # Project documentation
   .gitignore              # Git ignore rules
   env.example             # Environment template
   docs/                   # Knowledge base folder
   ├── password_reset.txt
   ├── account_management.txt
   └── billing_issues.txt
   ```

## ⚙️ **Step 3: Configure Environment Variables**

1. **Go to Space Settings**
   - Navigate to your space page
   - Click "Settings" tab
   - Scroll to "Repository secrets"

2. **Add Required Secrets**
   ```
   FRESHDESK_DOMAIN=your-domain.freshdesk.com
   FRESHDESK_API_KEY=your-freshdesk-api-key
   WEBHOOK_SECRET=your-webhook-secret
   ```

3. **Optional Secrets**
   ```
   HOST=0.0.0.0
   PORT=7860
   DEBUG=False
   DATABASE_URL=sqlite:///./tickets.db
   ```

## 🔧 **Step 4: Configure Freshdesk Webhook**

1. **In Freshdesk Admin Panel**
   - Go to Admin → Apps → Webhooks
   - Click "Create new webhook"

2. **Webhook Configuration**
   - **Name:** AI Ticket Bot
   - **URL:** `https://YOUR_USERNAME-ai-ticket-resolution-bot.hf.space/webhook`
   - **Events:** 
     - ✅ Ticket created
     - ✅ Ticket updated
   - **Secret:** Your webhook secret (same as in HF secrets)

3. **Test Webhook**
   ```bash
   curl -X POST https://YOUR_USERNAME-ai-ticket-resolution-bot.hf.space/webhook \
     -H "Content-Type: application/json" \
     -H "X-Freshdesk-Signature: your-signature" \
     -d '{"ticket": {"id": 1, "subject": "Test", "description": "Test ticket"}}'
   ```

## 🚀 **Step 5: Deploy and Test**

1. **Monitor Deployment**
   - Go to your space page
   - Check the "App" tab for deployment status
   - Wait for "Running" status

2. **Test the Interface**
   - Click on your space URL
   - Test the Gradio interface
   - Try ticket classification
   - Test RAG queries

3. **Verify Webhook**
   - Create a test ticket in Freshdesk
   - Check if the bot responds
   - Monitor logs in the space

## 📊 **Step 6: Monitor and Maintain**

### **Monitoring**
- **Space Logs:** Check the "Logs" tab for errors
- **Freshdesk:** Monitor ticket responses
- **Performance:** Track response times

### **Maintenance**
- **Update Knowledge Base:** Add new docs to `docs/` folder
- **Model Updates:** Update requirements.txt for new models
- **Configuration:** Modify secrets as needed

## 🔍 **Troubleshooting**

### **Common Issues**

1. **Space Not Starting**
   ```
   Error: Module not found
   Solution: Check requirements.txt and app.py imports
   ```

2. **Webhook Not Working**
   ```
   Error: 404 Not Found
   Solution: Verify webhook URL and endpoint
   ```

3. **AI Models Not Loading**
   ```
   Error: CUDA/CPU issues
   Solution: Check model compatibility and hardware settings
   ```

4. **Environment Variables**
   ```
   Error: Missing configuration
   Solution: Add all required secrets in HF Space settings
   ```

### **Debug Commands**

```bash
# Check space logs
# Go to your space → Logs tab

# Test webhook locally
curl -X POST http://localhost:7860/webhook \
  -H "Content-Type: application/json" \
  -d '{"ticket": {"id": 1, "subject": "Test"}}'

# Check environment variables
echo $FRESHDESK_DOMAIN
echo $FRESHDESK_API_KEY
```

## 📈 **Performance Optimization**

### **For Free Tier**
- Use CPU-only models
- Optimize model loading
- Cache embeddings
- Minimize dependencies

### **For Paid GPU**
- Enable GPU acceleration
- Use larger models
- Parallel processing
- Real-time responses

## 🔒 **Security Best Practices**

1. **Secrets Management**
   - Never commit secrets to Git
   - Use HF Space secrets
   - Rotate API keys regularly

2. **Webhook Security**
   - Verify HMAC signatures
   - Use HTTPS only
   - Rate limiting

3. **Data Protection**
   - Encrypt sensitive data
   - Regular backups
   - Access logging

## 📞 **Support**

- **Hugging Face:** [Spaces Documentation](https://huggingface.co/docs/hub/spaces)
- **Freshdesk:** [API Documentation](https://developers.freshdesk.com/api/)
- **Gradio:** [Documentation](https://gradio.app/docs/)

---

**🎉 AI Customer Ticket Resolution Bot is now live on Hugging Face Spaces!**

**Next Steps:**
1. Test the webhook integration
2. Monitor ticket processing
3. Optimize performance

4. Scale as needed 
