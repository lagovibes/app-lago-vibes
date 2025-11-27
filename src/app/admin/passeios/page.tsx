"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Passeio {
  id: number;
  nome: string;
  tipo: "Lancha" | "Jet Ski";
  capacidade: number;
  valor: number;
  proprietario: string;
  descricao?: string;
}

export default function PasseiosPage() {
  const [passeios, setPasseios] = useState<Passeio[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPasseio, setEditingPasseio] = useState<Passeio | null>(null);

  // 🔹 Carregar do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("passeios");
    if (stored) setPasseios(JSON.parse(stored));
  }, []);

  // 🔹 Salvar no localStorage sempre que atualizar
  useEffect(() => {
    localStorage.setItem("passeios", JSON.stringify(passeios));
  }, [passeios]);

  const handleSubmit = (e: any) => {
    e.preventDefault();

    const form = new FormData(e.target);
    const novoPasseio: Passeio = {
      id: editingPasseio ? editingPasseio.id : Date.now(),
      nome: form.get("nome") as string,
      tipo: form.get("tipo") as "Lancha" | "Jet Ski",
      capacidade: Number(form.get("capacidade")),
      valor: Number(form.get("valor")),
      proprietario: form.get("proprietario") as string,
      descricao: form.get("descricao") as string,
    };

    if (editingPasseio) {
      setPasseios(passeios.map(p => p.id === editingPasseio.id ? novoPasseio : p));
      setEditingPasseio(null);
    } else {
      setPasseios([...passeios, novoPasseio]);
    }

    setShowForm(false);
  };

  const removerPasseio = (id: number) => {
    setPasseios(passeios.filter(p => p.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🚤 Passeios</h1>

      {/* Botão Adicionar */}
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        <Plus size={18} /> Novo Passeio
      </button>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 grid gap-3 p-4 border rounded-lg">
          <input name="nome" placeholder="Nome" className="border p-2 rounded" required />
          <select name="tipo" className="border p-2 rounded">
            <option>Lancha</option>
            <option>Jet Ski</option>
          </select>
          <input name="capacidade" type="number" placeholder="Capacidade" className="border p-2 rounded" required />
          <input name="valor" type="number" placeholder="Valor da Diária" className="border p-2 rounded" required />
          <input name="proprietario" placeholder="Proprietário" className="border p-2 rounded" required />
          <textarea name="descricao" placeholder="Descrição" className="border p-2 rounded" />

          <button className="bg-green-600 text-white p-2 rounded hover:bg-green-700">
            Salvar Passeio
          </button>
        </form>
      )}

      {/* Lista de Passeios */}
      <div className="mt-6 grid gap-4">
        {passeios.map(p => (
          <div key={p.id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <p className="font-bold">{p.nome} - {p.tipo}</p>
              <p className="text-sm text-gray-600">Capacidade: {p.capacidade}</p>
              <p className="text-sm text-gray-600">Valor: R$ {p.valor}</p>
              <p className="text-sm text-gray-600">Proprietário: {p.proprietario}</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setEditingPasseio(p); setShowForm(true); }}>
                <Edit className="text-blue-600" size={20} />
              </button>
              <button onClick={() => removerPasseio(p.id)}>
                <Trash2 className="text-red-600" size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
