/**
 * GesFacture Landing Page Micro-Interactions & Calculator
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Interactive CTA Ripple Effect
  const ctaBtn = document.getElementById("hero-main-cta");
  if (ctaBtn) {
    ctaBtn.addEventListener("click", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement("span");
      ripple.className = "ripple-wave";
      ripple.style.left = `${x - 20}px`;
      ripple.style.top = `${y - 20}px`;
      ripple.style.width = "40px";
      ripple.style.height = "40px";

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }

  // 2. Mobile Menu Toggle
  const mobileToggle = document.getElementById("mobile-toggle-btn");
  const mobileDrawer = document.getElementById("mobile-drawer");
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener("click", () => {
      mobileDrawer.classList.toggle("hidden");
    });

    const links = mobileDrawer.querySelectorAll("a");
    links.forEach((l) => {
      l.addEventListener("click", () => mobileDrawer.classList.add("hidden"));
    });
  }

  // 3. Interactive Invoice Live Calculator
  const qty1 = document.getElementById("qty-1");
  const price1 = document.getElementById("price-1");
  const rowTotal1 = document.getElementById("row-total-1");

  const qty2 = document.getElementById("qty-2");
  const price2 = document.getElementById("price-2");
  const rowTotal2 = document.getElementById("row-total-2");

  const displaySubtotal = document.getElementById("display-subtotal");
  const displayTva = document.getElementById("display-tva");
  const displayTotal = document.getElementById("display-total");

  let currentCurrency = "FCFA";

  function formatNumber(num) {
    return new Intl.NumberFormat("fr-FR").format(Math.round(num));
  }

  function updateCalculations() {
    const q1 = parseFloat(qty1 ? qty1.value : 1) || 0;
    const p1 = parseFloat(price1 ? price1.value : 350000) || 0;
    const totalRow1 = q1 * p1;
    if (rowTotal1) rowTotal1.textContent = `${formatNumber(totalRow1)} ${currentCurrency}`;

    const q2 = parseFloat(qty2 ? qty2.value : 2) || 0;
    const p2 = parseFloat(price2 ? price2.value : 150000) || 0;
    const totalRow2 = q2 * p2;
    if (rowTotal2) rowTotal2.textContent = `${formatNumber(totalRow2)} ${currentCurrency}`;

    const subtotal = totalRow1 + totalRow2;
    const tva = subtotal * 0.18; // 18% standard VAT
    const totalTTC = subtotal + tva;

    if (displaySubtotal) displaySubtotal.textContent = `${formatNumber(subtotal)} ${currentCurrency}`;
    if (displayTva) displayTva.textContent = `${formatNumber(tva)} ${currentCurrency}`;
    if (displayTotal) displayTotal.textContent = `${formatNumber(totalTTC)} ${currentCurrency}`;
  }

  if (qty1 && price1 && qty2 && price2) {
    [qty1, price1, qty2, price2].forEach((input) => {
      input.addEventListener("input", updateCalculations);
    });
  }

  // Currency Switcher buttons
  const currencyButtons = document.querySelectorAll(".currency-toggle-btn");
  currencyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      currencyButtons.forEach((b) => {
        b.classList.remove("bg-white", "text-brand-navy", "shadow-sm");
        b.classList.add("text-slate-500");
      });
      btn.classList.add("bg-white", "text-brand-navy", "shadow-sm");
      btn.classList.remove("text-slate-500");

      currentCurrency = btn.getAttribute("data-curr") || "FCFA";
      updateCalculations();
    });
  });

  // Copy link button micro-interaction
  const copyBtn = document.getElementById("copy-link-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText("https://gesfacture.app/pay/inv_2026_084");
      }
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `<span>✓ Lien sécurisé copié !</span>`;
      copyBtn.classList.add("bg-emerald-600");
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove("bg-emerald-600");
      }, 2000);
    });
  }

  // Pricing Monthly / Yearly Switcher
  const toggleMonthly = document.getElementById("toggle-monthly");
  const toggleYearly = document.getElementById("toggle-yearly");
  const proPrice = document.getElementById("pro-price");
  const proSubtext = document.getElementById("pro-subtext");
  const bizPrice = document.getElementById("biz-price");
  const bizSubtext = document.getElementById("biz-subtext");

  if (toggleMonthly && toggleYearly) {
    toggleMonthly.addEventListener("click", () => {
      toggleMonthly.classList.add("bg-white", "text-brand-navy", "shadow-sm");
      toggleMonthly.classList.remove("text-slate-500");
      toggleYearly.classList.remove("bg-white", "text-brand-navy", "shadow-sm");
      toggleYearly.classList.add("text-slate-500");

      if (proPrice) proPrice.textContent = "5 000";
      if (proSubtext) proSubtext.textContent = "Facturé mensuellement";
      if (bizPrice) bizPrice.textContent = "15 000";
      if (bizSubtext) bizSubtext.textContent = "Facturé mensuellement";
    });

    toggleYearly.addEventListener("click", () => {
      toggleYearly.classList.add("bg-white", "text-brand-navy", "shadow-sm");
      toggleYearly.classList.remove("text-slate-500");
      toggleMonthly.classList.remove("bg-white", "text-brand-navy", "shadow-sm");
      toggleMonthly.classList.add("text-slate-500");

      if (proPrice) proPrice.textContent = "4 000";
      if (proSubtext) proSubtext.textContent = "48 000 FCFA facturés annuellement (économisez 20%)";
      if (bizPrice) bizPrice.textContent = "12 000";
      if (bizSubtext) bizSubtext.textContent = "144 000 FCFA facturés annuellement (économisez 20%)";
    });
  }

  // Close modal when clicking outside of modal card
  const modalBackdrop = document.getElementById("auth-modal");
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        window.closeAuthModal();
      }
    });
  }

  // Close on ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("auth-modal");
      if (modal && !modal.classList.contains("hidden")) {
        window.closeAuthModal();
      }
    }
  });
});

// ==========================================
// 4. Interactive Auth Modal Global Handlers
// ==========================================
window.openAuthModal = function (tab = "login") {
  const modal = document.getElementById("auth-modal");
  const card = document.getElementById("auth-modal-card");
  if (!modal || !card) return;

  window.switchAuthTab(tab);

  modal.classList.remove("hidden");
  modal.classList.add("flex");
  requestAnimationFrame(() => {
    modal.classList.remove("opacity-0", "pointer-events-none");
    modal.classList.add("opacity-100");
    card.classList.remove("scale-95");
    card.classList.add("scale-100");
  });
  document.body.style.overflow = "hidden";
};

window.closeAuthModal = function () {
  const modal = document.getElementById("auth-modal");
  const card = document.getElementById("auth-modal-card");
  if (!modal || !card) return;

  modal.classList.remove("opacity-100");
  modal.classList.add("opacity-0", "pointer-events-none");
  card.classList.remove("scale-100");
  card.classList.add("scale-95");

  setTimeout(() => {
    modal.classList.remove("flex");
    modal.classList.add("hidden");
    document.body.style.overflow = "";
  }, 250);
};

window.switchAuthTab = function (tab) {
  const tabLogin = document.getElementById("auth-tab-login");
  const tabSignup = document.getElementById("auth-tab-signup");
  const formLogin = document.getElementById("auth-form-login");
  const formSignup = document.getElementById("auth-form-signup");
  const title = document.getElementById("auth-modal-title");
  const subtitle = document.getElementById("auth-modal-subtitle");
  const alertBox = document.getElementById("auth-alert");

  if (alertBox) alertBox.classList.add("hidden");

  if (tab === "signup") {
    if (tabSignup) {
      tabSignup.classList.add("bg-white", "text-slate-900", "shadow-sm");
      tabSignup.classList.remove("text-slate-600");
    }
    if (tabLogin) {
      tabLogin.classList.remove("bg-white", "text-slate-900", "shadow-sm");
      tabLogin.classList.add("text-slate-600");
    }

    if (formLogin) formLogin.classList.add("hidden");
    if (formSignup) formSignup.classList.remove("hidden");

    if (title) title.textContent = "Créez votre compte gratuit";
    if (subtitle) subtitle.textContent = "Commencez à facturer et encaisser en moins de 2 minutes.";
  } else {
    if (tabLogin) {
      tabLogin.classList.add("bg-white", "text-slate-900", "shadow-sm");
      tabLogin.classList.remove("text-slate-600");
    }
    if (tabSignup) {
      tabSignup.classList.remove("bg-white", "text-slate-900", "shadow-sm");
      tabSignup.classList.add("text-slate-600");
    }

    if (formSignup) formSignup.classList.add("hidden");
    if (formLogin) formLogin.classList.remove("hidden");

    if (title) title.textContent = "Accédez à votre espace";
    if (subtitle) subtitle.textContent = "Gérez vos factures et encaissez par Wave & Mobile Money.";
  }
};

window.togglePasswordVisibility = function (inputId) {
  const input = document.getElementById(inputId);
  if (input) {
    input.type = input.type === "password" ? "text" : "password";
  }
};

window.handleAuthSubmit = function (e, mode) {
  e.preventDefault();
  const alertBox = document.getElementById("auth-alert");
  if (!alertBox) return;

  alertBox.className = "mb-4 p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2";
  if (mode === "login") {
    alertBox.innerHTML = `<span>✓ Connexion réussie ! Redirection en cours...</span>`;
  } else {
    alertBox.innerHTML = `<span>✓ Compte créé avec succès ! Bienvenue sur GesFacture. Redirection...</span>`;
  }
  alertBox.classList.remove("hidden");

  setTimeout(() => {
    window.location.href = "login.html";
  }, 1200);
};

window.loginDemoUser = function () {
  const alertBox = document.getElementById("auth-alert");
  if (alertBox) {
    alertBox.className = "mb-4 p-3 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-2";
    alertBox.innerHTML = `<span>⚡ Connexion démo activée ! Ouverture de votre espace...</span>`;
    alertBox.classList.remove("hidden");
  }
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1000);
};
