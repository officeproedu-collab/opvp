'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Video, UserCheck, UserX, CirclePlay as PlayCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

type Stats = {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalVideos: number;
  publishedVideos: number;
  recentUsers: Array<{ id: string; name: string; email: string; is_active: boolean; created_at: string }>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalVideos: 0,
    publishedVideos: 0,
    recentUsers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const [usersRes, videosRes, recentRes] = await Promise.all([
      supabase.from('portal_users').select('is_active').eq('role', 'student'),
      supabase.from('portal_videos').select('is_published'),
      supabase.from('portal_users')
        .select('id, name, email, is_active, created_at')
        .eq('role', 'student')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const users = usersRes.data || [];
    const videos = videosRes.data || [];

    setStats({
      totalUsers: users.length,
      activeUsers: users.filter(u => u.is_active).length,
      inactiveUsers: users.filter(u => !u.is_active).length,
      totalVideos: videos.length,
      publishedVideos: videos.filter(v => v.is_published).length,
      recentUsers: recentRes.data || [],
    });
    setLoading(false);
  }

  const statCards = [
    { label: 'Total Students', value: stats.totalUsers, icon: Users, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20' },
    { label: 'Active Students', value: stats.activeUsers, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
    { label: 'Inactive Students', value: stats.inactiveUsers, icon: UserX, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' },
    { label: 'Total Videos', value: stats.totalVideos, icon: Video, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' },
    { label: 'Published Videos', value: stats.publishedVideos, icon: PlayCircle, color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-700 tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your video portal</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 stagger-children">
        {statCards.map((card, i) => (
          <div
            key={i}
            className={`surface rounded-xl p-4 border animate-fade-in ${card.border}`}
          >
            <div className={`w-9 h-9 rounded-lg ${card.bg} border ${card.border} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            {loading ? (
              <div className="h-7 w-12 bg-secondary rounded animate-pulse mb-1" />
            ) : (
              <div className="text-2xl font-700 text-foreground">{card.value}</div>
            )}
            <div className="text-xs text-muted-foreground mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '200ms', opacity: 0 }}>
        <Link href="/admin/users" className="group surface rounded-xl p-5 hover:border-primary/30 transition-all hover:glow-blue-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-400/10 border border-sky-400/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-sky-400" />
              </div>
              <div>
                <div className="font-600 text-foreground text-sm">Manage Students</div>
                <div className="text-xs text-muted-foreground mt-0.5">Add, edit, activate or deactivate</div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 border border-border transition-all">
              <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </Link>

        <Link href="/admin/videos" className="group surface rounded-xl p-5 hover:border-primary/30 transition-all hover:glow-blue-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
                <Video className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="font-600 text-foreground text-sm">Manage Videos</div>
                <div className="text-xs text-muted-foreground mt-0.5">Add Mega links, categories, order</div>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/20 border border-border transition-all">
              <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent students */}
      <div className="animate-fade-in surface rounded-xl overflow-hidden" style={{ animationDelay: '300ms', opacity: 0 }}>
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-600 text-foreground">Recent Students</h2>
          <Link
            href="/admin/users"
            className="text-xs text-primary hover:text-primary/80 transition-colors font-500"
          >
            View all
          </Link>
        </div>
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : stats.recentUsers.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            No students yet. Add your first student.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stats.recentUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-600 text-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-500 text-foreground">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-500 ${
                  user.is_active
                    ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                    : 'bg-red-400/10 text-red-400 border border-red-400/20'
                }`}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
