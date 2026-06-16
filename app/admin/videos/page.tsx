'use client';

import { useState, useEffect } from 'react';
import { supabase, PortalVideo } from '@/lib/supabase';
import { getMegaEmbedUrl } from '@/lib/auth';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, X, Save, Play, Link2, AlignLeft, Tag, Hash, TriangleAlert as AlertTriangle, GripVertical, Image as ImageIcon } from 'lucide-react';

type VideoForm = {
  title: string;
  description: string;
  mega_link: string;
  thumbnail_url: string;
  category: string;
  order_index: number;
  is_published: boolean;
};

const emptyForm: VideoForm = {
  title: '', description: '', mega_link: '', thumbnail_url: '', category: 'General', order_index: 0, is_published: true,
};

export default function VideosPage() {
  const [videos, setVideos] = useState<PortalVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<PortalVideo | null>(null);
  const [form, setForm] = useState<VideoForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<PortalVideo | null>(null);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    const { data } = await supabase
      .from('portal_videos')
      .select('*')
      .order('order_index', { ascending: true });
    setVideos(data || []);
    setLoading(false);
  }

  function openAdd() {
    setEditingVideo(null);
    const maxOrder = videos.length > 0 ? Math.max(...videos.map(v => v.order_index)) + 1 : 0;
    setForm({ ...emptyForm, order_index: maxOrder });
    setError('');
    setModalOpen(true);
  }

  function openEdit(video: PortalVideo) {
    setEditingVideo(video);
    setForm({
      title: video.title,
      description: video.description,
      mega_link: video.mega_link,
      thumbnail_url: video.thumbnail_url || '',
      category: video.category,
      order_index: video.order_index,
      is_published: video.is_published,
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.title.trim() || !form.mega_link.trim()) {
      setError('Title and Mega link are required.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        mega_link: form.mega_link.trim(),
        thumbnail_url: form.thumbnail_url.trim() || null,
        category: form.category.trim() || 'General',
        order_index: form.order_index,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      };

      if (editingVideo) {
        const { error: dbError } = await supabase
          .from('portal_videos')
          .update(payload)
          .eq('id', editingVideo.id);
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('portal_videos')
          .insert(payload);
        if (dbError) throw dbError;
      }
      setModalOpen(false);
      fetchVideos();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(video: PortalVideo) {
    await supabase
      .from('portal_videos')
      .update({ is_published: !video.is_published, updated_at: new Date().toISOString() })
      .eq('id', video.id);
    fetchVideos();
  }

  async function handleDelete(id: string) {
    await supabase.from('portal_videos').delete().eq('id', id);
    setDeleteConfirm(null);
    fetchVideos();
  }

  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))];

  const filtered = videos.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || v.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-700 tracking-tight">Videos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {videos.length} total &middot; {videos.filter(v => v.is_published).length} published
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-500 transition-all glow-blue-sm"
        >
          <Plus className="w-4 h-4" />
          Add Video
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 animate-fade-in" style={{ animationDelay: '60ms', opacity: 0 }}>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full h-10 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 h-10 text-sm rounded-lg whitespace-nowrap font-500 transition-all ${
                categoryFilter === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Video cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface rounded-xl h-52 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface rounded-xl p-16 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
            <Play className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">No videos found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map(video => (
            <div
              key={video.id}
              className="surface rounded-xl overflow-hidden animate-fade-in group hover:border-border/80 transition-all"
            >
              {/* Thumbnail area */}
              <div className="relative h-36 bg-secondary flex items-center justify-center overflow-hidden">
                {video.thumbnail_url ? (
                  <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                )}
                <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
                <div className="relative z-10 w-12 h-12 rounded-full bg-background/70 backdrop-blur-sm border border-border/60 flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary fill-primary/70" />
                </div>
                {/* Order badge */}
                <div className="absolute top-2 left-2 w-6 h-6 rounded-md bg-background/70 backdrop-blur-sm border border-border/40 flex items-center justify-center">
                  <span className="text-[10px] font-600 text-muted-foreground">#{video.order_index}</span>
                </div>
                {/* Published badge */}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-600 px-2 py-0.5 rounded-full ${
                    video.is_published
                      ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                      : 'bg-secondary text-muted-foreground border border-border'
                  }`}>
                    {video.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                {/* Category */}
                <div className="absolute bottom-2 left-2">
                  <span className="text-[10px] bg-background/70 text-muted-foreground px-2 py-0.5 rounded border border-border/40 backdrop-blur-sm">
                    {video.category}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-600 text-sm text-foreground line-clamp-1 mb-1">{video.title}</h3>
                {video.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{video.description}</p>
                )}
                <div className="flex items-center gap-1 pt-3 border-t border-border/60">
                  <button
                    onClick={() => setPreviewVideo(video)}
                    title="Preview"
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                  >
                    <Play className="w-3 h-3" />
                    Preview
                  </button>
                  <button
                    onClick={() => openEdit(video)}
                    title="Edit"
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => togglePublished(video)}
                    title={video.is_published ? 'Unpublish' : 'Publish'}
                    className="flex-1 flex items-center justify-center gap-1.5 h-8 text-xs text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10 rounded-md transition-all"
                  >
                    {video.is_published ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {video.is_published ? 'Hide' : 'Show'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(video.id)}
                    title="Delete"
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-600 text-foreground">
                {editingVideo ? 'Edit Video' : 'Add New Video'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Video Title *</label>
                <div className="relative">
                  <Play className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="Introduction to Accounting"
                    className="w-full h-10 pl-9 pr-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Mega Link *</label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.mega_link}
                    onChange={e => setForm(f => ({ ...f, mega_link: e.target.value }))}
                    placeholder="https://mega.nz/file/XXXXXXXX#YYYYYYYY"
                    className="w-full h-10 pl-9 pr-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                  Paste the Mega share link. Format: mega.nz/file/... or mega.nz/embed/...
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Thumbnail URL</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.thumbnail_url}
                    onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                    className="w-full h-10 pl-9 pr-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all font-mono"
                  />
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                  Optional. Direct link to an image to use as the video cover.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      placeholder="General"
                      className="w-full h-10 pl-9 pr-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Order</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="number"
                      value={form.order_index}
                      onChange={e => setForm(f => ({ ...f, order_index: parseInt(e.target.value) || 0 }))}
                      min={0}
                      className="w-full h-10 pl-9 pr-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Description</label>
                <div className="relative">
                  <AlignLeft className="absolute left-3 top-3 w-3.5 h-3.5 text-muted-foreground" />
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Short description of what this video covers..."
                    rows={3}
                    className="w-full pl-9 pr-3 py-2.5 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-secondary rounded-lg border border-border">
                <div>
                  <div className="text-sm font-500 text-foreground">Published</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {form.is_published ? 'Visible to students' : 'Hidden from students'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                  className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                    form.is_published ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                    form.is_published ? 'left-5' : 'left-0.5'
                  }`} />
                </button>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-border">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 h-9 text-sm text-muted-foreground hover:text-foreground bg-secondary hover:bg-secondary/80 rounded-lg border border-border transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 h-9 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-500 transition-all disabled:opacity-60"
              >
                {saving ? (
                  <div className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {editingVideo ? 'Save Changes' : 'Add Video'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 animate-fade-in"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl bg-card rounded-xl overflow-hidden border border-border animate-scale-in shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-600 text-foreground">{previewVideo.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{previewVideo.category}</p>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={getMegaEmbedUrl(previewVideo.mega_link)}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
          <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl animate-scale-in p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div className="text-center">
              <h3 className="font-600 text-foreground">Delete Video</h3>
              <p className="text-sm text-muted-foreground mt-1">This video will be permanently removed from the portal.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-9 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-lg text-sm border border-border transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 h-9 bg-destructive hover:bg-destructive/90 text-white rounded-lg text-sm font-500 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
