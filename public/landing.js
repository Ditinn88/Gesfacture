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
});
