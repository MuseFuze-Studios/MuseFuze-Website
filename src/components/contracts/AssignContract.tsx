import React, { useEffect, useState } from 'react';
import { adminAPI, contractAPI } from '../../services/api';

interface User { id: number; email: string; firstName: string; lastName: string; }
interface Template { id: number; title: string; }

const AssignContract: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userId, setUserId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    (async () => {
      const u = await adminAPI.getUsers();
      setUsers(u.data);
      const t = await contractAPI.getTemplates();
      setTemplates(t.data);
    })();
  }, []);

  const assign = async () => {
    try {
      await contractAPI.assignContract({ userId: Number(userId), templateId: Number(templateId) });
      setMessage('Contract assigned');
    } catch {
      setMessage('Failed to assign');
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="font-orbitron text-2xl font-bold">Assign Contract</h2>
      {message && <p className="text-gray-400">{message}</p>}
      <select value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg">
        <option value="">Select user</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
      </select>
      <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg">
        <option value="">Select template</option>
        {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
      </select>
      <button onClick={assign} disabled={!userId || !templateId} className="px-6 py-2 bg-gradient-to-r from-electric to-neon text-black rounded-lg font-rajdhani font-bold">
        Assign
      </button>
    </div>
  );
};

export default AssignContract;
