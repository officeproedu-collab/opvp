'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, PortalVideo } from '@/lib/supabase';
import { getUser, clearUser, getMegaEmbedUrl } from '@/lib/auth';
import {
  Play, Search, X, ChevronRight,
  Layers, BookOpen
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<PortalVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeVideo, setActiveVideo] = useState<PortalVideo | null>(null);
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace('/login');
      return;
    }
    setUser(u);
    fetchVideos();
  }, [router]);

  async function fetchVideos() {
    const { data } = await supabase
      .from('portal_videos')
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true });
    setVideos(data || []);
    setLoading(false);
  }

  function handleLogout() {
    clearUser();
    router.replace('/login');
  }

  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category)))];

  const filtered = videos.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
      v.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = selectedCategory === 'All' || v.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const grouped = filtered.reduce<Record<string, PortalVideo[]>>((acc, v) => {
    if (!acc[v.category]) acc[v.category] = [];
    acc[v.category].push(v);
    return acc;
  }, {});

  return (
    <>
      {/* Video modal player */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-card rounded-xl overflow-hidden border border-border animate-scale-in shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div>
                <h3 className="font-600 text-foreground">{activeVideo.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{activeVideo.category}</p>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors border border-border"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={getMegaEmbedUrl(activeVideo.mega_link)}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            </div>
            {activeVideo.description && (
              <div className="p-4 border-t border-border">
                <p className="text-sm text-muted-foreground">{activeVideo.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-700 tracking-tight">
            Good to see you, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Your class videos are ready to watch.</p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8 stagger-children">
          {[
            { label: 'Total Videos', value: videos.length, icon: Play },
            { label: 'Categories', value: categories.length - 1, icon: Layers },
            { label: 'Available Now', value: videos.filter(v => v.is_published).length, icon: BookOpen },
          ].map((stat, i) => (
            <div key={i} className="surface rounded-xl p-4 flex items-center gap-3 animate-fade-in">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <stat.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-xl font-700 text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search videos..."
              className="w-full h-10 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 h-10 text-sm rounded-lg whitespace-nowrap transition-all font-500 ${
                  selectedCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Videos */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="surface rounded-xl h-48 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Play className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No videos found.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([category, catVideos]) => (
              <div key={category} className="animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 rounded-full bg-primary" />
                  <h2 className="font-600 text-foreground">{category}</h2>
                  <span className="text-xs text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-full">
                    {catVideos.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                  {catVideos.map(video => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onClick={() => setActiveVideo(video)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function VideoCard({ video, onClick }: { video: PortalVideo; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group surface rounded-xl overflow-hidden text-left hover:border-primary/30 transition-all duration-200 animate-fade-in hover:glow-blue-sm"
    >
      <div className="relative bg-secondary h-40 flex items-center justify-center overflow-hidden">
        {video.thumbnail_url ? (
          <img src={video.thumbnail_url} alt={video.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent group-hover:from-primary/10 transition-all" />
        )}
        <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
        <div className="relative z-10 w-14 h-14 rounded-full bg-background/70 backdrop-blur-sm border border-border/60 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/40 transition-all duration-200">
          <Play className="w-6 h-6 text-primary fill-primary/80 group-hover:scale-110 transition-transform duration-200" />
        </div>
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <span className="text-xs bg-background/70 text-foreground px-2 py-0.5 rounded-md border border-border/40 backdrop-blur-sm shadow-sm">
            {video.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-600 text-sm text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {video.title}
          </h3>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 group-hover:translate-x-0.5 transition-all" />
        </div>
        {video.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{video.description}</p>
        )}
      </div>
    </button>
  );
}
