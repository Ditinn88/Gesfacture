"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  UserCheck,
} from "lucide-react";
import { useData } from "@/lib/data-context";
import { sumByCurrency } from "@/lib/utils";
import { Client } from "@/lib/mock-data";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyTotals } from "@/components/ui/currency-totals";
import { Pagination } from "@/components/ui/pagination";
import { RowActionsDropdown, ActionItem } from "@/components/ui/row-actions-dropdown";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const ITEMS_PER_PAGE = 20;

export default function ClientsPage() {
  const router = useRouter();
  const { clients, addClient, updateClient, deleteClient, organization, isLoading } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteModalClient, setDeleteModalClient] = useState<{ id: string; name: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dakar");
  const [country, setCountry] = useState("Sénégal");
  const [status, setStatus] = useState<"actif" | "inactif">("actif");

  // Search filter
  const filteredClients = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        (c.address && c.address.toLowerCase().includes(q)) ||
        (c.phone && c.phone.includes(q))
      );
    });
  }, [clients, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredClients.length / ITEMS_PER_PAGE));
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const totalClientsCount = clients.length;
  // Volume global par devise (on n'additionne jamais des GNF et des FCFA)
  const defaultCurrency = organization.currency || "XOF";
  const totalVolumeInvoiced = sumByCurrency(
    clients.flatMap((c) => (c.totalsByCurrency || []).map((t) => ({ amount: t.total, currency: t.currency }))),
    defaultCurrency
  );
  const activeClientsCount = clients.filter((c) => c.status === "actif").length;

  const handleOpenAdd = () => {
    setEditingClient(null);
    setName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setCity("Dakar");
    setCountry("Sénégal");
    setStatus("actif");
    setModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setEmail(client.email);
    setPhone(client.phone || "");
    setAddress(client.address || "");
    setCity(client.city || "Dakar");
    setCountry(client.country || "Sénégal");
    setStatus(client.status || "actif");
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      alert("Le nom et l'email sont obligatoires.");
      return;
    }

    if (editingClient) {
      updateClient(editingClient.id, {
        name,
        email,
        phone,
        address,
        city,
        country,
        status,
      });
      setToastMessage(`Client « ${name} » modifié avec succès.`);
    } else {
      addClient({
        name,
        email,
        phone,
        address,
        city,
        country,
        status,
        totalInvoiced: 0,
        invoicesCount: 0,
        percentage: 5,
      });
      setToastMessage(`Nouveau client « ${name} » ajouté avec succès.`);
    }

    setModalOpen(false);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const confirmDelete = () => {
    if (deleteModalClient) {
      deleteClient(deleteModalClient.id);
      setToastMessage(`Client « ${deleteModalClient.name} » supprimé.`);
      setDeleteModalClient(null);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <Skeleton className="h-8 w-60 bg-neutral-200/80 dark:bg-neutral-800" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold flex items-center justify-between shadow-none animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Annuaire Clients
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1">
            Gérez votre portefeuille de clients, coordonnées de facturation et historiques de commandes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl shadow-none transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-1">
          <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
            Total Clients Portefeuille
          </p>
          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-mono">
            {totalClientsCount} comptes
          </p>
          <p className="text-[10px] text-neutral-400">Entreprises & Particuliers</p>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-1">
          <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
            Clients Actifs
          </p>
          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-mono">
            {activeClientsCount} actifs
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Facturation régulière
          </p>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-1">
          <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
            Volume Global Facturé
          </p>
          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-mono">
            <CurrencyTotals totals={totalVolumeInvoiced} fallbackCurrency={defaultCurrency} />
          </p>
          <p className="text-[10px] text-neutral-400">Total cumulé émis</p>
        </div>
      </div>

      {/* Clients Management Container */}
      <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-4">
        {/* Search Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, ville..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="text-xs text-neutral-400">
            {filteredClients.length} client{filteredClients.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Clients Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200/90 dark:border-neutral-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200/90 dark:border-neutral-800 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 bg-[#fafaf9] dark:bg-neutral-900/50">
                <th className="py-3 pl-4 pr-3">Client</th>
                <th className="py-3 px-3">Contact</th>
                <th className="py-3 px-3">Adresse / Ville</th>
                <th className="py-3 px-3 text-center">Factures</th>
                <th className="py-3 px-3 text-center">Statut</th>
                <th className="py-3 px-3 text-right">Total Facturé</th>
                <th className="py-3 pr-4 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => {
                  const clientActions: ActionItem[] = [
                    {
                      label: "Modifier les coordonnées",
                      icon: <Edit className="w-3.5 h-3.5" />,
                      onClick: () => handleOpenEdit(client),
                    },
                    {
                      label: "Créer une facture",
                      icon: <FileText className="w-3.5 h-3.5" />,
                      onClick: () => router.push(`/invoices/new`),
                    },
                    {
                      label: "Supprimer le client",
                      icon: <Trash2 className="w-3.5 h-3.5" />,
                      destructive: true,
                      onClick: () => setDeleteModalClient({ id: client.id, name: client.name }),
                    },
                  ];

                  return (
                    <tr
                      key={client.id}
                      className="group hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      {/* Client Name + Avatar Monogram */}
                      <td className="py-3.5 pl-4 pr-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center font-bold text-[10px] tracking-tight shrink-0">
                            {client.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-neutral-900 dark:text-white text-xs">
                              {client.name}
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {client.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phone Contact */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400 text-xs font-mono">
                        {client.phone || "—"}
                      </td>

                      {/* Address / City */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-neutral-600 dark:text-neutral-400 text-xs">
                        {client.address ? `${client.address}, ` : ""}
                        {client.city}, {client.country}
                      </td>

                      {/* Invoices Count */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-mono text-[11px]">
                          {client.invoicesCount || 0}
                        </span>
                      </td>

                      {/* Status Pill Badge */}
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                            client.status === "actif"
                              ? "bg-[#e6f4ea] text-[#137333] border-[#ceead6]/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
                              : "bg-[#f1f3f4] text-[#5f6368] border-[#e0e0e0]/70 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"
                          }`}
                        >
                          {client.status === "actif" ? "Actif" : "Inactif"}
                        </span>
                      </td>

                      {/* Total Invoiced, one line per currency */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-neutral-900 dark:text-white font-mono text-xs">
                        <CurrencyTotals totals={client.totalsByCurrency} fallbackCurrency={defaultCurrency} />
                      </td>

                      {/* Three Dots Crash-Proof Actions Dropdown */}
                      <td className="py-3.5 pr-4 pl-3 text-right whitespace-nowrap">
                        <RowActionsDropdown actions={clientActions} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs">
                        Aucun client trouvé pour « {searchQuery} »
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className="text-xs font-medium text-neutral-600 hover:underline"
                      >
                        Effacer la recherche
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Au moins une vingtaine d'éléments par page) */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredClients.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(p) => setCurrentPage(p)}
          itemLabel="clients"
        />
      </div>

      {/* Modal: Ajouter / Modifier un Client */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                {editingClient ? "Modifier le Client" : "Nouveau Client"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nom ou Raison Sociale *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Teranga Digital SARL"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email de facturation *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@teranga.sn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="+221 77 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Statut du compte
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                  >
                    <option value="actif">Actif</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Adresse (Rue / Quartier)
                </label>
                <input
                  type="text"
                  placeholder="Almadies, Route de la Corniche"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl transition-colors"
                >
                  {editingClient ? "Enregistrer les modifications" : "Ajouter le client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteModalClient)}
        onClose={() => setDeleteModalClient(null)}
        onConfirm={confirmDelete}
        title="Supprimer le client ?"
        description={
          deleteModalClient ? (
            <span>
              Êtes-vous certain de vouloir supprimer définitivement le client{" "}
              <strong className="font-bold text-neutral-900 dark:text-white">
                « {deleteModalClient.name} »
              </strong>{" "}
              ? Cette action est irréversible.
            </span>
          ) : null
        }
        confirmText="Confirmer la suppression"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
}
