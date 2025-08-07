import os
import json
import numpy as np
from typing import List, Dict, Tuple, Optional
import torch
from loguru import logger
from config import settings

# Set environment variables to avoid PyTorch issues
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["TRANSFORMERS_CACHE"] = "/tmp/transformers_cache"

# Import transformers with error handling
try:
    from transformers import AutoTokenizer, AutoModel
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity
except ImportError as e:
    logger.error(f"Error importing transformers: {e}")
    # Fallback to basic functionality
    logger.warning("Using fallback mode without advanced AI models")
    AutoTokenizer = None
    AutoModel = None
    SentenceTransformer = None
    cosine_similarity = None

class AIEngine:
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {self.device}")
        
        # Initialize models
        self._load_models()
        self._load_knowledge_base()
        
    def _load_models(self):
        """Load AI models for classification and embedding"""
        try:
            if SentenceTransformer is None:
                logger.warning("SentenceTransformer not available - using fallback mode")
                self.embedding_model = None
                self.classifier_tokenizer = None
                self.classifier_model = None
                return
            
            # Load sentence transformer for embeddings
            logger.info("Loading sentence transformer model...")
            self.embedding_model = SentenceTransformer(settings.MODEL_NAME, device=self.device)
            
            # Load classification model (simplified approach)
            logger.info("Loading classification model...")
            self.classifier_tokenizer = AutoTokenizer.from_pretrained(settings.CLASSIFICATION_MODEL)
            self.classifier_model = AutoModel.from_pretrained(settings.CLASSIFICATION_MODEL)
            
            logger.info("Models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            logger.warning("Falling back to basic keyword-based classification")
            self.embedding_model = None
            self.classifier_tokenizer = None
            self.classifier_model = None
        
    def _load_knowledge_base(self):
        """Load and index the knowledge base from FAQ documents"""
        try:
            self.knowledge_base = {}
            self.knowledge_embeddings = []
            self.knowledge_texts = []
            
            # Load FAQ documents
            docs_folder = "docs"
            if os.path.exists(docs_folder):
                for file in os.listdir(docs_folder):
                    if file.endswith(".txt"):
                        with open(f"{docs_folder}/{file}", "r", encoding="utf-8") as f:
                            content = f.read()
                            self.knowledge_base[file] = content
                            self.knowledge_texts.append(content)
            
            # Create embeddings for knowledge base (if model is available)
            if self.knowledge_texts and self.embedding_model:
                logger.info("Creating embeddings for knowledge base...")
                self.knowledge_embeddings = self.embedding_model.encode(
                    self.knowledge_texts, 
                    convert_to_tensor=True,
                    show_progress_bar=True
                )
                
                logger.info(f"Knowledge base loaded with {len(self.knowledge_texts)} documents")
            else:
                logger.warning("No knowledge base documents found or embedding model not available!")
                
        except Exception as e:
            logger.error(f"Error loading knowledge base: {e}")
            raise
        
    def categorize_ticket(self, subject: str, description: str) -> Tuple[str, float, str]:
        """
        Categorize ticket into tier_1, tier_2, or complex using keyword-based approach
        Returns: (tier, confidence_score, category)
        """
        try:
            # Combine subject and description
            ticket_text = f"{subject} {description}".lower()
            
            # Simple keyword-based classification
            tier_1_keywords = ["password", "reset", "login", "simple", "basic", "help"]
            tier_2_keywords = ["billing", "payment", "subscription", "account", "settings"]
            complex_keywords = ["error", "bug", "crash", "system", "technical", "critical"]
            
            # Count keyword matches
            tier_1_score = sum(1 for keyword in tier_1_keywords if keyword in ticket_text)
            tier_2_score = sum(1 for keyword in tier_2_keywords if keyword in ticket_text)
            complex_score = sum(1 for keyword in complex_keywords if keyword in ticket_text)
            
            # Determine tier based on scores
            if complex_score > 0:
                tier = "complex"
                confidence = min(0.9, 0.5 + (complex_score * 0.1))
            elif tier_2_score > 0:
                tier = "tier_2"
                confidence = min(0.8, 0.6 + (tier_2_score * 0.1))
            elif tier_1_score > 0:
                tier = "tier_1"
                confidence = min(0.7, 0.5 + (tier_1_score * 0.1))
            else:
                tier = "complex"
                confidence = 0.5
            
            # Determine category based on keywords
            category = self._determine_category(ticket_text)
            
            logger.info(f"Ticket classified as {tier} with confidence {confidence:.2%}")
            
            return tier, confidence, category
            
        except Exception as e:
            logger.error(f"Error in ticket categorization: {e}")
            # Default to complex if classification fails
            return "complex", 0.5, "general"
    
    def _determine_category(self, text: str) -> str:
        """Determine ticket category based on keywords"""
        text_lower = text.lower()
        
        categories = {
            "password_reset": ["password", "reset", "forgot", "login", "account"],
            "billing": ["billing", "payment", "invoice", "charge", "subscription"],
            "technical": ["error", "bug", "crash", "technical", "system"],
            "account": ["account", "profile", "settings", "user"],
            "general": ["help", "support", "question", "issue"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in text_lower for keyword in keywords):
                return category
        
        return "general"
    
    def get_rag_response(self, query: str) -> str:
        """Get response using Retrieval-Augmented Generation"""
        try:
            if not self.knowledge_texts:
                return "I don't have access to the knowledge base at the moment. Please contact human support."
            
            if not self.embedding_model or not self.knowledge_embeddings:
                # Fallback to simple keyword matching
                return self._fallback_rag_response(query)
            
            # Encode the query
            query_embedding = self.embedding_model.encode([query], convert_to_tensor=True)
            
            # Calculate similarities
            similarities = cosine_similarity(
                query_embedding.cpu().numpy(), 
                self.knowledge_embeddings.cpu().numpy()
            )[0]
            
            # Find most similar document
            most_similar_idx = np.argmax(similarities)
            similarity_score = similarities[most_similar_idx]
            
            if similarity_score > 0.3:  # Threshold for relevance
                relevant_doc = self.knowledge_texts[most_similar_idx]
                
                # Generate response based on relevant document
                response = self._generate_response_from_doc(query, relevant_doc)
                return response
            else:
                return "I couldn't find specific information about that in our knowledge base. Please contact human support for assistance."
                
        except Exception as e:
            logger.error(f"Error in RAG response: {e}")
            return self._fallback_rag_response(query)
    
    def _fallback_rag_response(self, query: str) -> str:
        """Fallback RAG response using simple keyword matching"""
        try:
            query_lower = query.lower()
            query_words = query_lower.split()
            
            best_match = None
            best_score = 0
            
            for doc_content in self.knowledge_texts:
                doc_lower = doc_content.lower()
                score = sum(1 for word in query_words if word in doc_lower)
                if score > best_score:
                    best_score = score
                    best_match = doc_content
            
            if best_match and best_score > 0:
                return f"Based on our knowledge base:\n\n{best_match[:500]}..."
            else:
                return "I couldn't find specific information about that. Please contact human support for assistance."
                
        except Exception as e:
            logger.error(f"Error in fallback RAG: {e}")
            return "I'm having trouble accessing the knowledge base right now. Please try again or contact human support."
    
    def _generate_response_from_doc(self, query: str, doc_content: str) -> str:
        """Generate a response based on document content"""
        try:
            # Simple response generation based on document content
            lines = doc_content.split('\n')
            relevant_lines = []
            
            # Find lines that might be relevant to the query
            query_words = query.lower().split()
            for line in lines:
                if any(word in line.lower() for word in query_words):
                    relevant_lines.append(line.strip())
            
            if relevant_lines:
                response = "\n".join(relevant_lines[:5])  # Limit to 5 lines
                return f"Based on our knowledge base:\n\n{response}"
            else:
                return f"Here's what I found in our knowledge base:\n\n{doc_content[:500]}..."
                
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I found some information but couldn't format it properly. Please contact human support." 