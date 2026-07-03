"use client"
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import Link from 'next/link';

export default function Roster() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (session?.user?.role === 'Founder') {
      fetchUsers();
    }
  }, [session]);

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  const updateRank = async (userId, newRole) => {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, newRole })
    });

    if (res.ok) {
      fetchUsers(); // Refresh the list after promotion
    }
  };

  if (status === "loading") return <div className="p-8 text-white">Loading secure data...</div>;

  if (session?.user?.role !== 'Founder') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 text-white">
        <h1 className="text-2xl font-bold">Clearance Level Insufficient. Access Denied.</h1>
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      <div className="flex justify-between items-center mb-8 bg-slate-900 text-white p-6 rounded-lg shadow-lg">
        <div>
          <h1 className="text-3xl font-bold">Personnel Roster</h1>
          <p className="text-slate-300 mt-1">Manage Unit Clearances and Assignments</p>
        </div>
        <Link href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold transition">
          Return to Command Center
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-200 text-slate-800">
              <th className="p-4 border-b">Cadet / Personnel Name</th>
              <th className="p-4 border-b">Email Address</th>
              <th className="p-4 border-b">Current Rank</th>
              <th className="p-4 border-b">Authorize Promotion</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-slate-50 border-b last:border-0">
                <td className="p-4 font-bold text-slate-700 capitalize">{u.name}</td>
                <td className="p-4 text-slate-500">{u.email}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    u.role === 'Founder' ? 'bg-red-100 text-red-700' : 
                    u.role === 'Junior Under Officer' ? 'bg-purple-100 text-purple-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  {u.role !== 'Founder' && (
                    <select 
                      className="p-2 border rounded bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
                      value={u.role}
                      onChange={(e) => updateRank(u._id, e.target.value)}
                    >
                      <option value="Member">Member</option>
                      <option value="Junior Under Officer">Junior Under Officer</option>
                    </select>
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