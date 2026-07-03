"use client";
import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [projects, setProjects] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newSpec, setNewSpec] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) setProjects(await res.json());
    } catch (err) { console.error("Fetch failed", err); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const createProject = async (e) => {
    e.preventDefault();
    if (!newTitle || !newSpec) return;
    await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, clientSpecification: newSpec })
    });
    setNewTitle(""); setNewSpec(""); fetchProjects();
  };

  const moveProject = async (projectId, newStage) => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, newStage })
    });
    if (res.ok) fetchProjects();
    else {
      const data = await res.json();
      alert(data.error || "Action denied");
    }
  };

  const deleteProject = async (projectId) => {
    if (!confirm("Terminate this operation?")) return;
    await fetch('/api/projects', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId })
    });
    fetchProjects();
  };

  if (status === "loading") return <div className="p-8 text-white bg-slate-900 h-screen">Loading Command Center...</div>;
  if (status === "unauthenticated") return (
    <div className="flex h-screen items-center justify-center bg-slate-900">
      <button onClick={() => signIn()} className="px-8 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">System Login</button>
    </div>
  );

  return (
    <div className="p-8 bg-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 bg-slate-900 text-white p-6 rounded-lg shadow-lg">
        <div>
          <h1 className="text-3xl font-bold">Command Center</h1>
          <p className="text-slate-300">Clearance: <span className="text-green-400 font-bold">{session?.user?.role}</span></p>
        </div>
        <div className="flex gap-4">
          {session?.user?.role === 'Founder' && <a href="/roster" className="bg-blue-600 px-4 py-2 rounded font-bold">Roster</a>}
          <button onClick={() => signOut()} className="bg-red-500 px-4 py-2 rounded font-bold">Sign Out</button>
        </div>
      </div>

      {/* Creation Form */}
      {session?.user?.role !== 'Member' && (
        <form onSubmit={createProject} className="mb-8 p-6 bg-white rounded shadow-md flex gap-4">
          <input className="border p-2 flex-1 rounded" placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <input className="border p-2 flex-1 rounded" placeholder="Specs" value={newSpec} onChange={(e) => setNewSpec(e.target.value)} />
          <button className="bg-green-600 text-white px-6 py-2 rounded font-bold">Add Operation</button>
        </form>
      )}

      {/* Board */}
      <div className="flex gap-6">
        {['todo', 'production', 'checking'].map(stage => (
          <div key={stage} className="flex-1 bg-slate-200 p-4 rounded shadow-inner min-h-[400px]">
            <h2 className="font-bold mb-4 capitalize text-slate-700">{stage}</h2>
            {projects.filter(p => p.stage === stage).map(p => (
              <div key={p._id} className="bg-white p-4 mb-3 rounded shadow-sm border-l-4 border-slate-800">
                <h3 className="font-bold text-slate-800">{p.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{p.clientSpecification}</p>
                <div className="mt-4 flex gap-2">
                  {stage === 'todo' && <button onClick={() => moveProject(p._id, 'production')} className="bg-blue-500 text-white px-2 py-1 text-[10px] rounded">Deploy</button>}
                  {stage === 'production' && <button onClick={() => moveProject(p._id, 'checking')} className="bg-purple-500 text-white px-2 py-1 text-[10px] rounded">Check</button>}
                  {session?.user?.role === 'Founder' && <button onClick={() => deleteProject(p._id)} className="text-red-500 underline text-[10px]">Terminate</button>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}