import React, { useEffect, useState } from 'react';

interface Participant {
  id?: number;
  name: string;
  email: string;
  company: string;
}

interface ParticipantsTableProps {
  trainingInvoiceId: number;
  onParticipantsChange?: (count: number) => void;
}

export default function ParticipantsTable({ trainingInvoiceId, onParticipantsChange }: ParticipantsTableProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newParticipant, setNewParticipant] = useState<Participant>({ name: '', email: '', company: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editParticipant, setEditParticipant] = useState<Participant>({ name: '', email: '', company: '' });

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/participants?training_invoice_id=${trainingInvoiceId}`);
      const data = await res.json();
      if (data.success) {
        setParticipants(data.data);
        onParticipantsChange?.(data.data.length);
      } else {
        setError(data.error || 'Failed to fetch participants');
      }
    } catch (e) {
      setError('Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipants();
    // eslint-disable-next-line
  }, [trainingInvoiceId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`/api/participants?training_invoice_id=${trainingInvoiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newParticipant),
      });
      const data = await res.json();
      if (data.success) {
        const updatedParticipants = [...participants, data.data];
        setParticipants(updatedParticipants);
        onParticipantsChange?.(updatedParticipants.length);
        setNewParticipant({ name: '', email: '', company: '' });
      } else {
        setError(data.error || 'Failed to add participant');
      }
    } catch (e) {
      setError('Failed to add participant');
    }
  };

  const handleEdit = (p: Participant) => {
    setEditingId(p.id!);
    setEditParticipant({ name: p.name, email: p.email, company: p.company });
  };

  const handleEditSave = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/participants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editParticipant),
      });
      const data = await res.json();
      if (data.success) {
        setParticipants(participants.map(p => p.id === id ? data.data : p));
        setEditingId(null);
      } else {
        setError(data.error || 'Failed to update participant');
      }
    } catch (e) {
      setError('Failed to update participant');
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/participants/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        const updatedParticipants = participants.filter(p => p.id !== id);
        setParticipants(updatedParticipants);
        onParticipantsChange?.(updatedParticipants.length);
      } else {
        setError(data.error || 'Failed to delete participant');
      }
    } catch (e) {
      setError('Failed to delete participant');
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-2">Participants</h3>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-2 text-red-800">{error}</div>}
      <form onSubmit={handleAdd} className="mb-4 flex flex-col md:flex-row gap-2">
        <input
          type="text"
          placeholder="Name"
          className="input-field text-black"
          value={newParticipant.name}
          onChange={e => setNewParticipant({ ...newParticipant, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="input-field text-black"
          value={newParticipant.email}
          onChange={e => setNewParticipant({ ...newParticipant, email: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Company"
          className="input-field text-black"
          value={newParticipant.company}
          onChange={e => setNewParticipant({ ...newParticipant, company: e.target.value })}
          required
        />
        <button type="submit" className="btn-primary">Add</button>
      </form>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-black">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-black">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-black">Company</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider text-black">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
            ) : participants.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-gray-500">No participants</td></tr>
            ) : participants.map(p => (
              <tr key={p.id}>
                <td className="px-4 py-2 text-black">
                  {editingId === p.id ? (
                    <input
                      type="text"
                      className="input-field text-black"
                      value={editParticipant.name}
                      onChange={e => setEditParticipant({ ...editParticipant, name: e.target.value })}
                      required
                    />
                  ) : p.name}
                </td>
                <td className="px-4 py-2 text-black">
                  {editingId === p.id ? (
                    <input
                      type="email"
                      className="input-field text-black"
                      value={editParticipant.email}
                      onChange={e => setEditParticipant({ ...editParticipant, email: e.target.value })}
                      required
                    />
                  ) : p.email}
                </td>
                <td className="px-4 py-2 text-black">
                  {editingId === p.id ? (
                    <input
                      type="text"
                      className="input-field text-black"
                      value={editParticipant.company}
                      onChange={e => setEditParticipant({ ...editParticipant, company: e.target.value })}
                      required
                    />
                  ) : p.company}
                </td>
                <td className="px-4 py-2 text-right">
                  {editingId === p.id ? (
                    <>
                      <button className="btn-primary mr-2" onClick={() => handleEditSave(p.id!)}>Save</button>
                      <button className="btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button className="btn-secondary mr-2" onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn-danger" onClick={() => handleDelete(p.id!)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 