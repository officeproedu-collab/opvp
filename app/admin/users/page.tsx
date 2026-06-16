'use client';

import { useState, useEffect } from 'react';
import { supabase, PortalUser } from '@/lib/supabase';
import { UserPlus, Search, Pencil, Trash2, UserCheck, UserX, X, Save, Eye, EyeOff, Phone, Mail, User, FileText, TriangleAlert as AlertTriangle } from 'lucide-react';

type UserForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  notes: string;
  is_active: boolean;
};

const emptyForm: UserForm = {
  name: '', email: '', password: '', phone: '', notes: '', is_active: true,
};

export default function UsersPage() {
  const [users, setUsers] = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PortalUser | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewUser, setViewUser] = useState<PortalUser | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase
      .from('portal_users')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  function openAdd() {
    setEditingUser(null);
    setForm(emptyForm);
    setError('');
    setShowPassword(false);
    setModalOpen(true);
  }

  function openEdit(user: PortalUser) {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone,
      notes: user.notes,
      is_active: user.is_active,
    });
    setError('');
    setShowPassword(false);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError('Name, email and password are required.');
      return;
    }
    setSaving(true);
    setError('');

    try {
      if (editingUser) {
        const { error: dbError } = await supabase
          .from('portal_users')
          .update({
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            phone: form.phone.trim(),
            notes: form.notes.trim(),
            is_active: form.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingUser.id);
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('portal_users')
          .insert({
            name: form.name.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            phone: form.phone.trim(),
            notes: form.notes.trim(),
            is_active: form.is_active,
            role: 'student',
          });
        if (dbError) {
          if (dbError.code === '23505') {
            setError('A user with this email already exists.');
          } else {
            throw dbError;
          }
          return;
        }
      }
      setModalOpen(false);
      fetchUsers();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(user: PortalUser) {
    await supabase
      .from('portal_users')
      .update({ is_active: !user.is_active, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    fetchUsers();
  }

  async function handleDelete(id: string) {
    await supabase.from('portal_users').delete().eq('id', id);
    setDeleteConfirm(null);
    fetchUsers();
  }

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && u.is_active) ||
      (filterStatus === 'inactive' && !u.is_active);
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-700 tracking-tight">Students</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {users.length} total &middot; {users.filter(u => u.is_active).length} active
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 h-10 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-500 transition-all glow-blue-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add Student
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
            placeholder="Search by name, email or phone..."
            className="w-full h-10 pl-10 pr-4 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 h-10 text-sm rounded-lg font-500 capitalize transition-all ${
                filterStatus === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="surface rounded-xl overflow-hidden animate-fade-in" style={{ animationDelay: '120ms', opacity: 0 }}>
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
              <User className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm">No students found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-600 text-muted-foreground px-5 py-3.5 uppercase tracking-wide">Student</th>
                  <th className="text-left text-xs font-600 text-muted-foreground px-4 py-3.5 uppercase tracking-wide hidden md:table-cell">Phone</th>
                  <th className="text-left text-xs font-600 text-muted-foreground px-4 py-3.5 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                  <th className="text-left text-xs font-600 text-muted-foreground px-4 py-3.5 uppercase tracking-wide">Status</th>
                  <th className="text-right text-xs font-600 text-muted-foreground px-5 py-3.5 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-secondary/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-600 text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-500 text-foreground">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{user.phone || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-500 ${
                        user.is_active
                          ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                          : 'bg-red-400/10 text-red-400 border border-red-400/20'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewUser(user)}
                          title="View details"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEdit(user)}
                          title="Edit"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => toggleActive(user)}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            user.is_active
                              ? 'text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10'
                              : 'text-muted-foreground hover:text-emerald-400 hover:bg-emerald-400/10'
                          }`}
                        >
                          {user.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user.id)}
                          title="Delete"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-600 text-foreground">
                {editingUser ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border hover:bg-secondary/80 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full h-10 pl-9 pr-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                      className="w-full h-10 pl-9 pr-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="student@example.com"
                    className="w-full h-10 pl-9 pr-3 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="Set a password"
                    className="w-full h-10 pl-3 pr-10 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-600 text-muted-foreground uppercase tracking-wide">Notes</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-3.5 h-3.5 text-muted-foreground" />
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Any notes about this student..."
                    rows={3}
                    className="w-full pl-9 pr-3 py-2.5 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-secondary rounded-lg border border-border">
                <div>
                  <div className="text-sm font-500 text-foreground">Account Status</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {form.is_active ? 'Student can log in and watch videos' : 'Student cannot access the portal'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className={`relative w-11 h-6 rounded-full transition-all duration-200 ${
                    form.is_active ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${
                    form.is_active ? 'left-5' : 'left-0.5'
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
                {editingUser ? 'Save Changes' : 'Add Student'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View User Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-fade-in">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h2 className="font-600 text-foreground">Student Details</h2>
              <button
                onClick={() => setViewUser(null)}
                className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-700 text-primary">
                    {viewUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-600 text-foreground text-lg">{viewUser.name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-500 ${
                    viewUser.is_active
                      ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                      : 'bg-red-400/10 text-red-400 border border-red-400/20'
                  }`}>
                    {viewUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {[
                { label: 'Email', value: viewUser.email },
                { label: 'Phone', value: viewUser.phone || 'Not provided' },
                { label: 'Password', value: viewUser.password },
                { label: 'Joined', value: new Date(viewUser.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) },
                { label: 'Notes', value: viewUser.notes || 'No notes' },
              ].map(field => (
                <div key={field.label} className="flex flex-col gap-0.5">
                  <span className="text-xs text-muted-foreground font-600 uppercase tracking-wide">{field.label}</span>
                  <span className="text-sm text-foreground">{field.value}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 p-5 border-t border-border">
              <button
                onClick={() => { setViewUser(null); openEdit(viewUser); }}
                className="flex-1 flex items-center justify-center gap-2 h-9 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-sm font-500 border border-primary/20 transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => setViewUser(null)}
                className="px-4 h-9 bg-secondary hover:bg-secondary/80 text-muted-foreground rounded-lg text-sm border border-border transition-all"
              >
                Close
              </button>
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
              <h3 className="font-600 text-foreground">Delete Student</h3>
              <p className="text-sm text-muted-foreground mt-1">This action cannot be undone. The student will lose portal access.</p>
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
