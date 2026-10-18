"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as any) || "login";

  const {
    user,
    signInWithEmail,
    signUpWithEmail,
    resetPasswordForEmail,
    updatePassword,
    loginAsDemo,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup" | "forgot" | "reset">(
    initialTab === "signup" ? "signup" : initialTab === "reset" ? "reset" : initialTab === "forgot" ? "forgot" : "login"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signup") {
      setMode("signup");
    } else if (tab === "login") {
      setMode("login");
    } else if (tab === "forgot") {
      setMode("forgot");
    } else if (tab === "reset") {
      setMode("reset");
    }

    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setMode("reset");
    }
  }, [searchParams]);

  // If already authenticated and not resetting password, redirect to dashboard
  useEffect(() => {
    if (user && mode !== "reset") {
      router.push("/dashboard");
    }
  }, [user, mode, router]);

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
        setSuccessMsg("Mot de passe mis à jour avec succès ! Vous pouvez maintenant vous connecter.");
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
        router.push("/dashboard");
      }
    } else {
      const res = await signInWithEmail(email, password);
      if (res.error) {
        setErrorMsg(res.error.message);
      } else {
        router.push("/dashboard");
      }
    }

    setIsSubmitting(false);
  };

  const handleQuickDemo = () => {
    loginAsDemo("Administrateur", "admin@gesfacture.sn");
    router.push("/dashboard");
  };

  const isPasswordMatch = confirmPassword.length > 0 && confirmPassword === password;
  const isPasswordMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <div className="min-h-screen w-full bg-[#fbfbfe] relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 text-slate-900">
      {/* Background ambient radial gradients matching landing page */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl rounded-full"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[350px] bg-indigo-500/5 blur-3xl rounded-full"
      />

      {/* Top back button to landing page */}
      <div className="w-full max-w-[420px] mb-4 flex items-center justify-between relative z-10 px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs backdrop-blur-sm group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Retour à l&apos;accueil</span>
        </Link>
        <span className="text-[11px] font-semibold text-slate-400">
          GesFacture v2.4
        </span>
      </div>

      {/* Centered Modal / Card - High aesthetic matched to landing page */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-[0_20px_50px_rgba(17,8,41,0.08)] space-y-5 text-center relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Clickable Brand Logo linking to Landing Page */}
        <div className="flex flex-col items-center pt-1">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group mb-2 transition-transform hover:scale-105"
            title="Retour à la page d'accueil GesFacture"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xl text-[#110829] tracking-tight group-hover:text-indigo-600 transition-colors">
                GesFacture
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-600 -mt-1">
                Afrique
              </span>
            </div>
          </Link>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mt-1">
            {mode === "forgot"
              ? "Récupérez l'accès sécurisé à votre compte."
              : mode === "reset"
              ? "Définissez votre nouveau mot de passe sécurisé."
              : mode === "signup"
              ? "Créez votre compte en 30 secondes pour facturer et encaisser en FCFA."
              : "Connectez-vous pour accéder à vos factures et encaissements direct FCFA."}
          </p>
        </div>

        {/* Segmented Pill Switcher (for login / signup) or Back Bar (for forgot / reset) */}
        {mode === "login" || mode === "signup" ? (
          <div className="relative p-1 bg-slate-100/90 rounded-2xl flex items-center select-none border border-slate-200/60">
            {/* Animated Sliding Pill */}
            <div
              className={cn(
                "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-all duration-200 ease-out",
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
                "relative z-10 flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors duration-150 cursor-pointer",
                mode === "login"
                  ? "text-[#110829]"
                  : "text-slate-500 hover:text-slate-900"
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
                "relative z-10 flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-colors duration-150 cursor-pointer",
                mode === "signup"
                  ? "text-[#110829]"
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              Inscription
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between px-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à la connexion</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              {mode === "forgot" ? "Mot de passe oublié" : "Nouveau mot de passe"}
            </span>
          </div>
        )}

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-left animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-left flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {mode === "forgot" ? (
            /* Mode Mot de passe oublié */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Adresse email de votre compte
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.com"
                  className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 rounded-full transition-all active:scale-[0.99] shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
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
                      className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      Confirmation
                    </label>
                    {isPasswordMatch && (
                      <span className="text-[10px] font-semibold text-emerald-600 inline-flex items-center gap-0.5">
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
                      className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
                  className="w-full py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 rounded-full transition-all active:scale-[0.99] shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
            /* Mode Inscription */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Votre nom complet
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Amadou Fall"
                  className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Adresse email professionnelle
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.com"
                  className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              {/* 2 Columns: Mot de passe & Confirmation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
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
                      className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-800">
                      Confirmation
                    </label>
                    {isPasswordMatch && (
                      <span className="text-[10px] font-semibold text-emerald-600 inline-flex items-center gap-0.5">
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
                      className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
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
                  className="w-full py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 rounded-full transition-all active:scale-[0.99] shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Création de votre compte...</span>
                    </>
                  ) : (
                    <span>Créer mon compte gratuitement</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Mode Connexion */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Adresse email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.com"
                  className="w-full px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-800">
                    Mot de passe
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 transition-colors font-medium hover:underline cursor-pointer"
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
                    className="w-full pl-3.5 pr-8 py-2.5 sm:py-3 text-xs sm:text-sm bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-1.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 rounded-full transition-all active:scale-[0.99] shadow-md shadow-indigo-600/25 hover:shadow-indigo-600/35 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
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
          <div className="pt-2 text-center border-t border-slate-100 mt-2">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1.5 py-1 px-3 rounded-full hover:bg-indigo-50 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tester en mode Démo (1 clic direct)</span>
            </button>
          </div>
        </form>

        {/* Security / Compliance note */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Chiffrement SSL 256-bit · Données sécurisées</span>
        </div>
      </div>

      {/* Return to Dashboard link */}
      <div className="mt-5 text-center relative z-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Accéder directement au tableau de bord</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fbfbfe]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20 animate-pulse">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-400">Chargement de l&apos;espace sécurisé...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
