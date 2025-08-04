'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Protection : seulement admin
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('role');
      if (role !== 'admin') {
        router.push('/');
      }
    }
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) {
      setUsers(await res.json());
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess('Utilisateur créé !');
      setEmail(''); setPassword('');
      fetchUsers();
    } else {
      setError('Erreur lors de la création');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) fetchUsers();
  };

  const handleEdit = (user: User) => {
    setEditId(user.id);
    setEditEmail(user.email);
    setEditPassword('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const res = await fetch(`/api/users/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: editEmail, password: editPassword }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess('Utilisateur modifié !');
      setEditId(null);
      setEditEmail('');
      setEditPassword('');
      fetchUsers();
    } else {
      setError('Erreur lors de la modification');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-karla-bold">Gestion des utilisateurs</h1>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          Retour au tableau de bord
        </button>
      </div>
      <form onSubmit={handleCreate} className="mb-8 flex gap-4 items-end">
        <div>
          <label className="block text-sm font-karla-semibold mb-1">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="px-3 py-2 border rounded text-black" required />
        </div>
        <div>
          <label className="block text-sm font-karla-semibold mb-1">Mot de passe</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="px-3 py-2 border rounded text-black" required />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" disabled={loading}>{loading ? 'Création...' : 'Créer'}</button>
      </form>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}
      <table className="w-full border mt-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Rôle</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className="border-t">
              {editId === u.id ? (
                <td colSpan={3} className="p-2 bg-gray-50">
                  <form onSubmit={handleUpdate} className="flex gap-2 items-end">
                    <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="px-2 py-1 border rounded text-black" required />
                    <input type="password" value={editPassword} onChange={e => setEditPassword(e.target.value)} className="px-2 py-1 border rounded text-black" placeholder="Nouveau mot de passe" />
                    <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">Enregistrer</button>
                    <button type="button" onClick={() => setEditId(null)} className="bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400 transition">Annuler</button>
                  </form>
                </td>
              ) : (
                <>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2 text-center flex gap-2 justify-center">
                    <button onClick={() => handleEdit(u)} className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 transition">Modifier</button>
                    <button onClick={() => handleDelete(u.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition">Supprimer</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 