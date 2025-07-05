import React, { useEffect, useState } from 'react';
import { adminAPI, contractAPI } from '../../services/api';

interface User { id: number; firstName: string; lastName: string; }
interface Contract { id: number; title: string; status: string; }

const ViewUserContracts: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    (async () => {
      const u = await adminAPI.getUsers();
      setUsers(u.data);
    })();
  }, []);

  const load = async (id: string) => {
    const res = await contractAPI.getUserContractsAdmin(Number(id));
    setContracts(res.data);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="font-orbitron text-2xl font-bold">User Contracts</h2>
      <select value={userId} onChange={(e) => { setUserId(e.target.value); load(e.target.value); }} className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg">
        <option value="">Select user</option>
        {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
      </select>
      <ul className="space-y-2">
        {contracts.map(c => (
          <li key={c.id} className="border border-gray-700 rounded-lg p-2 flex justify-between">
            <span>{c.title}</span>
            <span className="text-sm text-gray-400">{c.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ViewUserContracts;
