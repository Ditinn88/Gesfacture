"use client";

import React, { useState } from "react";
import { Info, Mail, MessageSquare, Trash2, UserPlus, Users } from "lucide-react";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { Member, MemberRole, MEMBER_ROLE_DESCRIPTIONS, WORKSPACE_ROLE_LABELS } from "@/lib/mock-data";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const ROLES: MemberRole[] = ["admin", "comptable", "lecteur"];

const inputClass =
  "w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10";

const secondaryButton =
  "inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 dark:hover:border-white border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-none transition-all duration-200 active:scale-95 whitespace-nowrap";

// Lien d'inscription avec l'email du membre prérempli : il doit s'inscrire avec cette adresse
const signupUrl = (email: string) =>
  `${typeof window !== "undefined" ? window.location.origin : ""}/login?tab=signup&email=${encodeURIComponent(email)}`;

const invitationText = (member: Member, companyName: string) =>
  `Bonjour${member.name ? ` ${member.name}` : ""}, je vous ai ajouté(e) comme ${WORKSPACE_ROLE_LABELS[
    member.role
  ].toLowerCase()} dans l'espace GESFACTURE de ${companyName}. Créez votre compte avec cette adresse email (${
    member.email
  }) puis confirmez-la : vous aurez accès à nos factures et clients. ${signupUrl(member.email)}`;

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex items-start gap-2.5 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
      <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
      <div className="space-y-1">{children}</div>
    </div>
  );
}

export function MembersPanel() {
  const {
    organization,
    members,
    membersAvailable,
    workspaceRole,
    isLoading,
    addMember,
    updateMemberRole,
    removeMember,
  } = useData();
  const { user, session, openAuthModal } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("comptable");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<Member | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);

  const companyName = organization.name || "notre entreprise";
  const isOwner = workspaceRole === "owner";

  const handleAdd = async () => {
    setError(null);
    if (!email.trim()) {
      setError("Saisissez l'adresse email du membre.");
      return;
    }
    setIsSubmitting(true);
    const result = await addMember({ email, name, role });
    setIsSubmitting(false);
    if (result) {
      setError(result);
      return;
    }
    setJustAdded({ id: "", email: email.trim().toLowerCase(), name: name.trim(), role });
    setName("");
    setEmail("");
    setRole("comptable");
  };

  const handleRoleChange = async (member: Member, next: MemberRole) => {
    setError(null);
    const result = await updateMemberRole(member.id, next);
    if (result) setError(result);
  };

  const handleRemove = async () => {
    if (!memberToRemove) return;
    const result = await removeMember(memberToRemove.id);
    setMemberToRemove(null);
    if (result) setError(result);
  };

  const shareButtons = (member: Member) => (
    <>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(invitationText(member, companyName))}`}
        target="_blank"
        rel="noopener noreferrer"
        className={secondaryButton}
        title="Envoyer l'invitation par WhatsApp"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>WhatsApp</span>
      </a>
      <a
        href={`mailto:${member.email}?subject=${encodeURIComponent(
          `Invitation à l'espace GESFACTURE de ${companyName}`
        )}&body=${encodeURIComponent(invitationText(member, companyName))}`}
        className={secondaryButton}
        title="Envoyer l'invitation par email"
      >
        <Mail className="w-3.5 h-3.5" />
        <span>Email</span>
      </a>
    </>
  );

  const header = (
    <div>
      <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Équipe & Membres</h2>
      <p className="text-xs text-neutral-400 mt-0.5">
        Donnez accès à vos factures et clients à vos collaborateurs, chacun avec son rôle.
      </p>
    </div>
  );

  const card = (children: React.ReactNode) => (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-5">
      {header}
      {children}
    </div>
  );

  if (isLoading) {
    return card(
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  // Mode local ou démo : les membres ont besoin d'un vrai compte partagé dans Supabase
  if (!session) {
    return card(
      <InfoBox>
        <p className="font-semibold text-neutral-900 dark:text-white">Un compte GESFACTURE est nécessaire</p>
        <p>
          {user
            ? "Le mode démo enregistre vos données sur cet appareil uniquement. Connectez-vous avec un compte confirmé par email pour inviter des membres."
            : "Vos données sont enregistrées sur cet appareil uniquement. Connectez-vous ou créez un compte pour inviter des membres."}
        </p>
        {!user && (
          <button type="button" onClick={() => openAuthModal()} className={cn(secondaryButton, "mt-2")}>
            Connexion / Inscription
          </button>
        )}
      </InfoBox>
    );
  }

  if (!membersAvailable) {
    return card(
      <InfoBox>
        <p className="font-semibold text-neutral-900 dark:text-white">Mise à jour de la base requise</p>
        <p>
          Pour activer les membres, exécutez une fois le fichier <span className="font-mono">supabase/schema.sql</span>{" "}
          dans Supabase (SQL Editor), puis rechargez cette page.
        </p>
      </InfoBox>
    );
  }

  const memberRows = (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-100 dark:divide-neutral-800">
      {isOwner && (
        <div className="p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center text-xs font-bold shrink-0">
            {(user?.user_metadata?.full_name || user?.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
              {user?.user_metadata?.full_name || "Vous"}
            </p>
            <p className="text-[11px] text-neutral-400 truncate">{user?.email}</p>
          </div>
          <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 shrink-0">
            {WORKSPACE_ROLE_LABELS.owner}
          </span>
        </div>
      )}

      {members.length === 0 ? (
        <p className="p-4 text-xs text-neutral-400 text-center">Aucun membre pour le moment.</p>
      ) : (
        members.map((member) => (
          <div key={member.id} className="p-3 flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center text-xs font-bold shrink-0">
                {(member.name || member.email).slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                  {member.name || member.email.split("@")[0]}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">{member.email}</p>
              </div>
            </div>

            {isOwner ? (
              <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member, e.target.value as MemberRole)}
                  aria-label={`Rôle de ${member.email}`}
                  className="px-2 py-1.5 text-[11px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-neutral-900 dark:focus:border-white"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {WORKSPACE_ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                {shareButtons(member)}
                <button
                  type="button"
                  onClick={() => setMemberToRemove(member)}
                  className="inline-flex items-center justify-center p-1.5 text-[#c5221f] dark:text-rose-400 bg-white dark:bg-neutral-800 hover:bg-[#c5221f] hover:text-white border border-neutral-200 dark:border-neutral-700 rounded-lg transition-all"
                  title="Retirer ce membre"
                  aria-label={`Retirer ${member.email}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 shrink-0">
                {WORKSPACE_ROLE_LABELS[member.role]}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  );

  // Membre d'un espace : consultation de l'équipe, gestion réservée au chef d'entreprise
  if (!isOwner) {
    return card(
      <>
        <InfoBox>
          <p>
            Vous êtes membre de l&apos;espace <strong className="text-neutral-900 dark:text-white">{companyName}</strong>{" "}
            avec le rôle <strong className="text-neutral-900 dark:text-white">{WORKSPACE_ROLE_LABELS[workspaceRole]}</strong>{" "}
            : {MEMBER_ROLE_DESCRIPTIONS[workspaceRole as MemberRole].toLowerCase()}.
          </p>
          <p>Seul le chef d&apos;entreprise peut ajouter ou retirer des membres.</p>
        </InfoBox>
        {memberRows}
      </>
    );
  }

  return (
    <>
      {card(
        <>
          <InfoBox>
            <p>
              1. Ajoutez le membre avec son adresse email et son rôle. 2. Envoyez-lui l&apos;invitation par WhatsApp ou
              email. 3. Il crée son compte avec <strong>cette même adresse</strong> et la confirme : il voit alors vos
              factures et clients.
            </p>
          </InfoBox>

          {/* Ajout d'un membre */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 space-y-3">
            <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-neutral-400" />
              Ajouter un membre
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="member-name" className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Nom complet
                </label>
                <input
                  id="member-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex : Aïssatou Bah"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="member-email" className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Email *
                </label>
                <input
                  id="member-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdd();
                    }
                  }}
                  placeholder="collaborateur@entreprise.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Choix du rôle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" role="radiogroup" aria-label="Rôle du membre">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={role === r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "text-left p-2.5 rounded-xl border transition-all",
                    role === r
                      ? "border-neutral-900 dark:border-white bg-white dark:bg-neutral-900 ring-1 ring-neutral-900/10 dark:ring-white/10"
                      : "border-neutral-200 dark:border-neutral-700 bg-[#fafaf9] dark:bg-neutral-800/40 hover:border-neutral-400 dark:hover:border-neutral-500"
                  )}
                >
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white">{WORKSPACE_ROLE_LABELS[r]}</p>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 leading-snug">
                    {MEMBER_ROLE_DESCRIPTIONS[r]}
                  </p>
                </button>
              ))}
            </div>

            {error && <p className="text-[11px] text-[#c5221f] dark:text-rose-400">{error}</p>}

            <button
              type="button"
              onClick={handleAdd}
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl transition-all active:scale-95 shadow-none disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Ajout en cours..." : "Ajouter le membre"}</span>
            </button>
          </div>

          {/* Invitation à envoyer juste après l'ajout */}
          {justAdded && (
            <div className="p-3.5 rounded-xl bg-[#f3faf5] dark:bg-emerald-950/30 border border-[#ceead6] dark:border-emerald-800/50 space-y-2">
              <p className="text-xs text-[#137333] dark:text-emerald-300 font-semibold">
                {justAdded.name || justAdded.email} a été ajouté(e). Envoyez-lui l&apos;invitation :
              </p>
              <div className="flex items-center gap-1.5 flex-wrap">{shareButtons(justAdded)}</div>
            </div>
          )}

          {/* Liste de l'équipe */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              Équipe ({members.length + 1})
            </p>
            {memberRows}
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemove}
        title="Retirer ce membre ?"
        description={
          <span>
            <strong className="font-bold text-neutral-900 dark:text-white">{memberToRemove?.email}</strong> n&apos;aura
            plus accès aux factures et clients de l&apos;entreprise.
          </span>
        }
        confirmText="Retirer le membre"
        cancelText="Annuler"
        variant="danger"
      />
    </>
  );
}
