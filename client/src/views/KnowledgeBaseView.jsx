import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Search, PlusCircle, ThumbsUp, Eye, Tag, X, Sparkles } from 'lucide-react';

export const KnowledgeBaseView = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New article form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Account & Authentication');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'all',
    'Account & Authentication',
    'Billing & Payments',
    'Technical & Infrastructure',
    'Feature Requests',
    'Security & Compliance',
    'General Support',
  ];

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (search) params.search = search;

      const res = await API.get('/kb', { params });
      if (res.data.success) {
        setArticles(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching KB articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory, search]);

  const handleVote = async (id) => {
    try {
      const res = await API.post(`/kb/${id}/vote`, { helpful: true });
      if (res.data.success) {
        setArticles((prev) =>
          prev.map((art) =>
            art._id === id ? { ...art, helpfulCount: res.data.helpfulCount } : art
          )
        );
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await API.post('/kb', {
        title: newTitle,
        category: newCategory,
        content: newContent,
        tags: newTags,
      });

      if (res.data.success) {
        setArticles([res.data.data, ...articles]);
        setShowAddModal(false);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
      }
    } catch (err) {
      alert('Error creating article: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            Knowledge Base & RAG Index
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 shadow-2xs">
              Semantic Search
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Source-of-truth documentation leveraged by ResolvAI's Retrieval-Augmented Generation pipeline.
          </p>
        </div>

        {user?.role !== 'customer' && (
          <button
            onClick={() => setShowAddModal(true)}
            className="animated-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition"
          >
            <PlusCircle className="w-4 h-4 transition-transform duration-200 hover:rotate-90" />
            <span>Add Knowledge Article</span>
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="relative group">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-600 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles across title, keywords, solutions, or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Pill Tabs with hover lifts */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 active:scale-95 ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20 scale-102'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-white border border-slate-200 hover:shadow-2xs'
              }`}
            >
              {cat === 'all' ? 'All Articles' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid with Pretty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-2 text-center py-16 text-slate-400 text-xs flex items-center justify-center space-x-2">
            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            <span>Loading Knowledge Base articles...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-slate-400 text-xs bg-white/60 rounded-2xl border-2 border-dashed border-slate-200">
            No knowledge base articles found matching criteria.
          </div>
        ) : (
          articles.map((art) => (
            <div
              key={art._id}
              className="pretty-card p-5.5 space-y-3.5 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200 shadow-2xs">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-slate-400" /> {art.views || 0}
                    </span>
                    <button
                      onClick={() => handleVote(art._id)}
                      className="flex items-center gap-1 hover:text-emerald-600 active:scale-125 transition-all p-1 rounded-lg hover:bg-emerald-50"
                      title="Vote this helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-600" /> {art.helpfulCount || 0}
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed line-clamp-4">
                  {art.content}
                </p>
              </div>

              {/* Tags with subtle hover effect */}
              {art.tags && art.tags.length > 0 && (
                <div className="pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                  <Tag className="w-3 h-3 text-slate-400 mr-1" />
                  {art.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 transition-colors font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" /> Add Knowledge Base Article
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Article Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. How to regenerate API tokens"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                >
                  {categories.filter((c) => c !== 'all').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Solution / Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  placeholder="Step by step troubleshooting steps..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 resize-none focus:bg-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="api, token, regenerate, auth"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="animated-btn px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition disabled:opacity-50"
                >
                  {submitting ? 'Indexing...' : 'Save & Index Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
