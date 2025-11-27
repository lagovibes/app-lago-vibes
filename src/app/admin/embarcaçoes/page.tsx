"use client";

import { useState, useEffect } from "react";
import { Plus, Ship, User, Camera } from "lucide-react";

interface Embarcacao {
  id: string;
  nome: string;
  tipo: "Lancha" | "Jet Ski";
  capacidade: string;
  precoBase: number;
  proprietario: string;
  descricao: string;
  fotos: string[];
}

export default function EmbarcacoesPage() {
  const [embarcacoes, setEmbarcacoes] = useState<Embarcacao[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Embarcacao>({
    id: "",
    nome: "",
    tipo: "Lancha",
    capacidade: "",
    precoBase: 0,
    proprietario: "",
    descricao: "",
    fotos: [],
  });

  // Carregar do localStorage
  useEffect(() => {
    const stored = localStorage.getItem("embarcacoes");
    if (stored) setEmbarcacoes(JSON.parse(stored));
  }, []);

  // Salvar
  const handleSubmit = (e: any) => {
    e.preventDefault();

    const nova = { ...formData, id: Date.now().toString() };
    const updated = [...embarcacoes, nova];

    setEmbarcacoes(updated);
    localStorage.setItem("embarcacoes", JSON.stringify(updated));

    alert("🚤 Embarcação registrada com sucesso!");
    setShowForm(false);
    setFormData({
      id: "",
      nome: "",
      tipo: "Lancha",
      capacidade: "",
      precoBase: 0,
      proprietario: "",
      descricao: "",
      fotos: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🚤 Embarcações (Lanchas & Jets)</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Plus size={18}/> Nova Embarcação
        </button>
      </div>

      {/* CADASTRO */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          
          <div>
            <label className="font-semibold">Nome da Embarcação*</label>
            <input className="w-full p-2 border rounded mt-1"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="font-semibold">Tipo</label>
            <select className="w-full p-2 border rounded mt-1"
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
            >
              <option>Lancha</option>
              <option>Jet Ski</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">Capacidade*</label>
            <input className="w-full p-2 border rounded mt-1"
              placeholder="Ex: 10 Pessoas"
              value={formData.capacidade}
              onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="font-semibold">Preço Base (R$)</label>
            <input className="w-full p-2 border rounded mt-1"
              type="number"
              value={formData.precoBase}
              onChange={(e) => setFormData({ ...formData, precoBase: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="font-semibold">Proprietário*</label>
            <input className="w-full p-2 border rounded mt-1"
              placeholder="Nome do proprietário"
              value={formData.proprietario}
              onChange={(e) => setFormData({ ...formData, proprietario: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="font-semibold">Descrição*</label>
            <textarea className="w-full p-2 border rounded mt-1"
              rows={2}
              placeholder="Sobre o passeio..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
            />
          </div>

          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg w-full">
            💾 Salvar Embarcação
          </button>
        </form>
      )}

      {/* LISTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {embarcacoes.map((e) => (
          <div key={e.id} className="p-4 rounded-lg shadow bg-white">
            <h2 className="font-bold text-lg">{e.nome}</h2>
            <p>🛥 Tipo: {e.tipo}</p>
            <p>👥 Capacidade: {e.capacidade}</p>
            <p>💰 A partir de: R$ {e.precoBase}</p>
            <p>👤 Proprietário: {e.proprietario}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
