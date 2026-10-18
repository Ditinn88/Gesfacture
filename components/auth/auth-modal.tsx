"use client";

import React, { useState } from "react";
import {
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  ArrowLeft,
  KeyRound,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export function AuthModal() {
  const {
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    signInWithEmail,
    signUpWithEmail,
    resetPasswordForEmail,
    updatePassword,
    loginAsDemo,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(authModalTab || "login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (authModalTab) {
      setMode(authModalTab);
    }
  }, [authModalTab]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      if (params.get("auth") === "modal" || params.get("modal") === "auth") {
        openAuthModal();
      }
      if (params.get("tab") === "signup") {
        setMode("signup");
      }
      if (params.get("tab") === "forgot") {
        setMode("forgot");
      }
      if (params.get("tab") === "reset" || hash.includes("type=recovery")) {
        setMode("reset");
        openAuthModal();
      }
    }
  }, [openAuthModal]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    if (mode === "forgot") {
      if (!email) {
        setErrorMsg("Veuillez renseigner votre adresse email.");
        setIsSubmitting(false);
        return;
      }
      const res = await resetPasswordForEmail(email);
      if (res.error) {
        setErrorMsg(res.error.message);
      } else {
        setSuccessMsg(
          "Un email contenant votre lien de réinitialisation sécurisé vient de vous être envoyé. Vérifiez votre boîte de réception (et vos spams si besoin)."
        );
      }
      setIsSubmitting(false);
      return;
    }

    if (mode === "reset") {
      if (!password || !confirmPassword) {
        setErrorMsg("Veuillez renseigner et confirmer votre nouveau mot de passe.");
        setIsSubmitting(false);
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg("Les mots de passe ne correspondent pas.");
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Le mot de passe doit comporter au moins 6 caractères.");
        setIsSubmitting(false);
        return;
      }

      const res = await updatePassword(password);
      if (res.error) {
        setErrorMsg(res.error.message);
      } else {
        setSuccessMsg("Mot de passe mis à jour avec succès ! Vous pouvez vous connecter.");
        setMode("login");
      }
      setIsSubmitting(false);
      return;
    }

    if (!email || !password) {
      setErrorMsg("Veuillez renseigner votre email et mot de passe.");
      setIsSubmitting(false);
      return;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setErrorMsg("Les mots de passe ne correspondent pas.");
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg("Le mot de passe doit comporter au moins 6 caractères.");
        setIsSubmitting(false);
        return;
      }

      const res = await signUpWithEmail(email, password, fullName);
      if (res.error) {
        setErrorMsg(res.error.message);
      } else if (res.requiresConfirmation) {
        setSuccessMsg(
          "Compte créé avec succès ! Veuillez vérifier votre boîte email pour valider votre compte."
        );
      } else {
        closeAuthModal();
      }
    } else {
      const res = await signInWithEmail(email, password);
      if (res.error) {
        setErrorMsg(res.error.message);
      } else {
        closeAuthModal();
      }
    }

    setIsSubmitting(false);
  };

  const handleQuickDemo = () => {
    loginAsDemo("Administrateur", "admin@gesfacture.sn");
    closeAuthModal();
  };

  const isPasswordMatch = confirmPassword.length > 0 && confirmPassword === password;
  const isPasswordMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Cinematic Blur Backdrop */}
      <div
        onClick={closeAuthModal}
        className="fixed inset-0 bg-neutral-900/40 dark:bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      />

      {/* Modal Card - 1:1 Pixel-Perfect to Reference Screenshot */}
      <div className="relative w-full max-w-[400px] bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-neutral-200 dark:border-neutral-800 shadow-2xl z-10 animate-in zoom-in-95 duration-200 space-y-5 text-center">
        {/* Subtle Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Fermer"
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2]" />
        </button>

        {/* Brand Header */}
        <div className="space-y-1 pt-1">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight font-sans">
            GESFACTURE
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
            {mode === "forgot"
              ? "Récupérez l'accès à votre compte."
              : mode === "reset"
              ? "Définissez votre nouveau mot de passe."
              : "Gérez vos factures en toute simplicité."}
          </p>
        </div>

        {/* Segmented Pill Switcher (for login / signup) or Back Bar (for forgot / reset) */}
        {mode === "login" || mode === "signup" ? (
          <div className="relative p-1 bg-[#f0f0ef] dark:bg-neutral-800 rounded-2xl flex items-center select-none">
            {/* Animated Sliding Pill */}
            <div
              className={cn(
                "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-neutral-900 rounded-xl shadow-xs transition-all duration-200 ease-out",
                mode === "login" ? "left-1" : "left-[calc(50%+3px)]"
              )}
            />
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={cn(
                "relative z-10 flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors duration-150 cursor-pointer",
                mode === "login"
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={cn(
                "relative z-10 flex-1 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-colors duration-150 cursor-pointer",
                mode === "signup"
                  ? "text-neutral-900 dark:text-white"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              Inscription
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à la connexion</span>
            </button>
            <span className="text-[11px] font-mono text-neutral-400">
              {mode === "forgot" ? "Mot de passe oublié" : "Nouveau mot de passe"}
            </span>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#fce8e6] dark:bg-rose-950/40 border border-[#fad2cf]/60 dark:border-rose-800/40 text-xs text-[#c5221f] dark:text-rose-300 text-left animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-[#e6f4ea] dark:bg-emerald-950/40 border border-[#ceead6]/60 dark:border-emerald-800/40 text-xs text-[#137333] dark:text-emerald-300 text-left flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#137333] shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {mode === "forgot" ? (
            /* Mode Mot de passe oublié */
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Adresse email de votre compte
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.com"
                  className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10 transition-colors"
                />
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl transition-all active:scale-[0.99] shadow-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <span>Envoyer le lien de réinitialisation</span>
                  )}
                </button>
              </div>
            </>
          ) : mode === "reset" ? (
            /* Mode Définition du Nouveau Mot de passe */
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 car."
                      className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Confirmation
                    </label>
                    {isPasswordMatch && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>OK</span>
                      </span>
                    )}
                    {isPasswordMismatch && (
                      <span className="text-[10px] text-rose-500 font-medium">
                        ≠ Différent
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Répétez"
                      className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl transition-all active:scale-[0.99] shadow-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mise à jour...</span>
                    </>
                  ) : (
                    <span>Mettre à jour mon mot de passe</span>
                  )}
                </button>
              </div>
            </>
          ) : mode === "signup" ? (
            /* Mode Inscription (1:1 Reference Capture) */
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Votre nom complet
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Amadou Fall"
                  className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.com"
                  className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10 transition-colors"
                />
              </div>

              {/* 2 Columns: Mot de passe & Confirmation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 car."
                      className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      Confirmation
                    </label>
                    {isPasswordMatch && (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>OK</span>
                      </span>
                    )}
                    {isPasswordMismatch && (
                      <span className="text-[10px] text-rose-500 font-medium">
                        ≠ Différent
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Répétez"
                      className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl transition-all active:scale-[0.99] shadow-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Création en cours...</span>
                    </>
                  ) : (
                    <span>Créer mon compte</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Mode Connexion */
            <>
              <div>
                <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.com"
                  className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10 transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors font-medium hover:underline cursor-pointer"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-3.5 text-xs sm:text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl transition-all active:scale-[0.99] shadow-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <span>Se connecter</span>
                  )}
                </button>
              </div>
            </>
          )}

          {/* Quick Demo Access (1 clic) */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-[11px] text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-neutral-400" />
              <span>Accès rapide Démo (1 clic)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
