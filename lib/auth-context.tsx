"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "signup" | "forgot" | "reset";
  openAuthModal: (tab?: "login" | "signup" | "forgot" | "reset") => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null; requiresConfirmation?: boolean }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loginAsDemo: (name?: string, email?: string) => void;
  updateUserProfile: (fullName: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = "gesfacture_local_auth_user_v6";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup" | "forgot" | "reset">("login");

  useEffect(() => {
    let isMounted = true;

    // Purge legacy mock users
    try {
      localStorage.removeItem("gesfacture_local_auth_user");
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed &&
          parsed.email &&
          !parsed.email.includes("amadou.diop") &&
          parsed.user_metadata?.full_name !== "Amadou Diop"
        ) {
          setUser(parsed);
        } else {
          localStorage.removeItem(LOCAL_USER_KEY);
        }
      }
    } catch (e) {
      // Ignore
    }

    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    // 2. Récupérer la session Supabase actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          try {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(session.user));
          } catch (e) {}
        }
        setIsLoading(false);
      }
    });

    // 3. Écouter les changements d'état d'authentification en direct
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
        if (session?.user) {
          setUser(session.user);
          try {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(session.user));
          } catch (e) {}
        } else {
          // If explicitly signed out from Supabase
          if (_event === "SIGNED_OUT") {
            setUser(null);
            try {
              localStorage.removeItem(LOCAL_USER_KEY);
            } catch (e) {}
          }
        }
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (tab: "login" | "signup" | "forgot" | "reset" = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const signInWithEmail = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured || !supabase) {
      if (!cleanEmail || !password) {
        return { error: new Error("Veuillez renseigner votre email et mot de passe.") };
      }

      let localAccounts: Record<string, { email: string; password?: string; name?: string }> = {};
      try {
        const stored = localStorage.getItem("gesfacture_local_accounts");
        if (stored) localAccounts = JSON.parse(stored);
      } catch (e) {}

      const existing = localAccounts[cleanEmail];
      if (existing && existing.password && existing.password !== password) {
        return { error: new Error("Mot de passe incorrect pour cette adresse email.") };
      }

      const defaultName = cleanEmail.split("@")[0].replace(/[._-]/g, " ");
      const userName = existing?.name || (defaultName.charAt(0).toUpperCase() + defaultName.slice(1));

      localAccounts[cleanEmail] = {
        email: cleanEmail,
        password: password,
        name: userName,
      };
      try {
        localStorage.setItem("gesfacture_local_accounts", JSON.stringify(localAccounts));
      } catch (e) {}

      const localUser: any = {
        id: "usr-" + Date.now(),
        email: cleanEmail,
        user_metadata: {
          full_name: userName,
        },
        app_metadata: { provider: "local" },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      };

      setUser(localUser);
      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
      } catch (e) {}

      closeAuthModal();
      return { error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      let friendlyMessage = error.message;
      if (error.message.includes("Invalid login credentials")) {
        friendlyMessage = "Adresse email ou mot de passe incorrect. Vérifiez l'orthographe exacte et la casse de votre mot de passe.";
      } else if (error.message.includes("Email not confirmed")) {
        friendlyMessage = "Votre adresse email n'est pas encore confirmée. Vérifiez votre boîte de réception ou désactivez « Confirm email » dans votre console Supabase (Authentication > Providers > Email).";
      } else if (error.message.includes("rate limit") || error.message.includes("429")) {
        friendlyMessage = "Limite de requêtes atteinte par Supabase (Rate limit). Veuillez patienter quelques minutes avant de retenter.";
      }
      return { error: new Error(friendlyMessage) };
    }

    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);
      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
      } catch (e) {}
    }

    closeAuthModal();
    return { error: null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName?.trim() || cleanEmail.split("@")[0];
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    if (!isSupabaseConfigured || !supabase) {
      if (!cleanEmail || !password) {
        return { error: new Error("Veuillez renseigner votre email et mot de passe.") };
      }
      if (password.length < 6) {
        return { error: new Error("Le mot de passe doit comporter au moins 6 caractères.") };
      }

      let localAccounts: Record<string, { email: string; password?: string; name?: string }> = {};
      try {
        const stored = localStorage.getItem("gesfacture_local_accounts");
        if (stored) localAccounts = JSON.parse(stored);
      } catch (e) {}

      localAccounts[cleanEmail] = {
        email: cleanEmail,
        password,
        name: cleanName,
      };
      try {
        localStorage.setItem("gesfacture_local_accounts", JSON.stringify(localAccounts));
      } catch (e) {}

      const localUser: any = {
        id: "usr-" + Date.now(),
        email: cleanEmail,
        user_metadata: {
          full_name: cleanName,
        },
        app_metadata: { provider: "local" },
        aud: "authenticated",
        created_at: new Date().toISOString(),
      };

      setUser(localUser);
      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
      } catch (e) {}

      closeAuthModal();
      return { error: null, requiresConfirmation: false };
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
        },
        emailRedirectTo: `${origin}/login?tab=login`,
      },
    });

    if (error) {
      let friendlyMessage = error.message;
      if (error.message.includes("already registered")) {
        friendlyMessage = "Cette adresse email possède déjà un compte. Cliquez sur « Connexion » ou réinitialisez votre mot de passe.";
      } else if (error.message.includes("Password should be")) {
        friendlyMessage = "Le mot de passe doit comporter au moins 6 caractères.";
      } else if (error.message.includes("rate limit") || error.message.includes("429")) {
        friendlyMessage = "Limite d'envois d'emails atteinte par Supabase (Rate limit). Rendez-vous sur votre console Supabase (Authentication > Providers > Email) et décochez « Confirm email » pour autoriser les inscriptions immédiates.";
      }
      return { error: new Error(friendlyMessage) };
    }

    // Si Supabase a validé la session immédiatement (sans email confirmation)
    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);
      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
      } catch (e) {}
      closeAuthModal();
      return { error: null, requiresConfirmation: false };
    }

    // Si un compte a été créé mais nécessite confirmation
    if (data.user) {
      return { error: null, requiresConfirmation: !data.user.email_confirmed_at };
    }

    return { error: null };
  };

  const resetPasswordForEmail = async (email: string): Promise<{ error: Error | null }> => {
    const cleanEmail = email.trim().toLowerCase();
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

    if (!isSupabaseConfigured || !supabase) {
      return { error: null };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${origin}/login?tab=reset`,
    });

    if (error) {
      let friendlyMessage = error.message;
      if (error.message.includes("rate limit") || error.message.includes("429")) {
        friendlyMessage = "Trop de demandes de réinitialisation. Veuillez patienter quelques minutes (Rate limit Supabase).";
      }
      return { error: new Error(friendlyMessage) };
    }

    return { error: null };
  };

  const updatePassword = async (newPassword: string): Promise<{ error: Error | null }> => {
    if (newPassword.length < 6) {
      return { error: new Error("Le mot de passe doit comporter au moins 6 caractères.") };
    }

    if (!isSupabaseConfigured || !supabase) {
      if (user && user.email) {
        try {
          const stored = localStorage.getItem("gesfacture_local_accounts");
          const accounts = stored ? JSON.parse(stored) : {};
          if (accounts[user.email]) {
            accounts[user.email].password = newPassword;
            localStorage.setItem("gesfacture_local_accounts", JSON.stringify(accounts));
          }
        } catch (e) {}
      }
      return { error: null };
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error: new Error(error.message) };
    }

    if (data.user) {
      setUser(data.user);
      try {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
      } catch (e) {}
    }

    return { error: null };
  };

  // Accès rapide / Démo Dirigeant sans bloquer
  const loginAsDemo = (name = "Administrateur", email = "admin@gesfacture.sn") => {
    const demoUser: any = {
      id: "usr-" + Date.now(),
      email,
      user_metadata: {
        full_name: name,
      },
      app_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };
    setUser(demoUser);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(demoUser));
    } catch (e) {}
    closeAuthModal();
  };

  const updateUserProfile = async (fullName: string): Promise<{ error: Error | null }> => {
    const cleanName = fullName.trim();
    if (isSupabaseConfigured && supabase && session) {
      try {
        const { data, error } = await supabase.auth.updateUser({
          data: { full_name: cleanName },
        });
        if (error) return { error };
        if (data.user) {
          setUser(data.user);
          try {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
          } catch (e) {}
        }
        return { error: null };
      } catch (err: any) {
        return { error: err };
      }
    } else {
      setUser((prev) => {
        if (!prev) return null;
        const updated = {
          ...prev,
          user_metadata: {
            ...prev.user_metadata,
            full_name: cleanName,
          },
        };
        try {
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      return { error: null };
    }
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn("SignOut Supabase warning:", e);
      }
    }
    setUser(null);
    setSession(null);
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
    } catch (e) {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        resetPasswordForEmail,
        updatePassword,
        signOut,
        loginAsDemo,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
