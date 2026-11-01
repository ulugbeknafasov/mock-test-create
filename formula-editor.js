(function () {
  "use strict";

  let activeTarget = null;
  let activeSubject = "matematika";
  let modal = null;
  let mathEditor = null;
  let unicodeEditor = null;
  let mathLivePromise = null;

  const IS_MATH = () =>
    activeSubject === "matematika" ||
    activeSubject === "fizika";

  const NUMBERS = [..."0123456789"].map(x => ({ label: x, value: x }));

  const LATIN_LETTERS = [
    ..."abcdefghijklmnopqrstuvwxyz",
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  ].map(x => ({ label: x, value: x }));

  const BASIC_MATH = [
    ["+", "+"], ["−", "-"], ["×", "\\times "],
    ["÷", "\\div "], ["=", "="], ["≠", "\\ne "],
    ["≈", "\\approx "], ["±", "\\pm "], ["∓", "\\mp "],
    ["(", "("], [")", ")"], ["[", "["], ["]", "]"],
    ["{", "\\{"], ["}", "\\}"], ["<", "<"], [">", ">"],
    ["≤", "\\le "], ["≥", "\\ge "], ["%", "\\%"],
    [",", ","], [".", "."], ["|", "|"],
    ["∞", "\\infty "], ["π", "\\pi "], ["e", "e"],
    ["°", "^{\\circ}"], ["√", "\\sqrt{#?}"]
  ].map(([label, value]) => ({ label, value }));

  const STRUCTURES = [
    ["Kasr", "\\frac{#?}{#?}"],
    ["Ildiz", "\\sqrt{#?}"],
    ["Kub ildiz", "\\sqrt[3]{#?}"],
    ["n-darajali ildiz", "\\sqrt[#?]{#?}"],
    ["Daraja", "^{#?}"],
    ["Indeks", "_{#?}"],
    ["Daraja va indeks", "_{#?}^{#?}"],
    ["Yig'indi", "\\sum_{#?}^{#?}"],
    ["Ko'paytma", "\\prod_{#?}^{#?}"],
    ["Integral", "\\int_{#?}^{#?}"],
    ["Ikki karrali integral", "\\iint"],
    ["Hosila", "\\frac{d}{dx}"],
    ["Limit", "\\lim_{#?}"],
    ["Matritsa", "\\begin{pmatrix}#?& #?\\\\#?& #?\\end{pmatrix}"],
    ["Modul", "\\left|#?\\right|"],
    ["Qavs", "\\left(#?\\right)"],
    ["Vektor", "\\vec{#?}"],
    ["Ustki chiziq", "\\overline{#?}"],
    ["Burchak", "\\angle "],
    ["Nisbat", "\\frac{#?}{#?}"]
  ].map(([label, value]) => ({ label, value }));

  const TRIG_FUNCTIONS = [
    ["sin", "\\sin("], ["cos", "\\cos("], ["tg", "\\tan("], ["ctg", "\\cot("],
    ["tan", "\\tan("], ["cot", "\\cot("], ["sec", "\\sec("], ["csc", "\\csc("],
    ["sin⁻¹", "\\arcsin("], ["cos⁻¹", "\\arccos("], ["tg⁻¹", "\\arctan("],
    ["log", "\\log("], ["ln", "\\ln("], ["lg", "\\log_{10}("],
    ["lim", "\\lim_{#?}"], ["max", "\\max("], ["min", "\\min("],
    ["f(x)", "f(x)"], ["d/dx", "\\frac{d}{dx}"], ["eˣ", "e^{x}"],
    ["log₂", "\\log_{2}("], ["logₙ", "\\log_{n}("],
    ["Δ", "\\Delta "], ["θ", "\\theta "], ["α", "\\alpha "], ["β", "\\beta "]
  ].map(([label, value]) => ({ label, value }));

  const GREEK = [
    ..."αβγδεζηθικλμνξοπρστυφχψω",
    ..."ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ"
  ].map(x => ({
    label: x,
    value: "\\" + ({
      "α": "alpha", "β": "beta", "γ": "gamma", "δ": "delta", "ε": "epsilon", "ζ": "zeta",
      "η": "eta", "θ": "theta", "ι": "iota", "κ": "kappa", "λ": "lambda", "μ": "mu",
      "ν": "nu", "ξ": "xi", "ο": "omicron", "π": "pi", "ρ": "rho", "σ": "sigma",
      "τ": "tau", "υ": "upsilon", "φ": "phi", "χ": "chi", "ψ": "psi", "ω": "omega",
      "Α": "Alpha", "Β": "Beta", "Γ": "Gamma", "Δ": "Delta", "Ε": "Epsilon", "Ζ": "Zeta",
      "Η": "Eta", "Θ": "Theta", "Ι": "Iota", "Κ": "Kappa", "Λ": "Lambda", "Μ": "Mu",
      "Ν": "Nu", "Ξ": "Xi", "Ο": "Omicron", "Π": "Pi", "Ρ": "Rho", "Σ": "Sigma",
      "Τ": "Tau", "Υ": "Upsilon", "Φ": "Phi", "Χ": "Chi", "Ψ": "Psi", "Ω": "Omega"
    })[x] + " "
  }));

  const MATH_SYMBOLS = [
    ..."∑∫∬∮∂∇∈∉⊂⊆∪∩∅∀∃⇒⇔⊥∥∠∝∴∵",
    ..."∞∼≅≡∝∅ℝℕℤℚℂ"
  ].map(x => ({ label: x, value: x }));

  const PHYSICS_SYMBOLS = [
    ..."FmasvtgPAEWNpρμλωTQ IURqCB", "ΩΦηφℏνΔθλ",
    "°C", "°F", "m/s", "km/h", "m/s²", "N", "J", "W", "Pa", "Hz", "V",
    "A", "Ω", "C", "T", "kg", "mol", "K", "s", "m", "cm", "mm"
  ].filter(x => x !== " ").map(x => ({ label: x, value: x }));

  const INDEX_TOOLS = [..."⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻", ..."₀₁₂₃₄₅₆₇₈₉"].map(x => ({ label: x, value: x }));

  const CHEMISTRY_SYMBOLS = [
    ["→", " → "], ["⇌", " ⇌ "], ["↔", " ↔ "], ["↑", "↑"], ["↓", "↓"], ["Δ", "Δ"],
    ["°", "°"], ["·", "·"], ["±", "±"], ["=", " = "], ["+", " + "], ["−", " − "],
    ["(s)", "(s)"], ["(l)", "(l)"], ["(g)", "(g)"], ["(aq)", "(aq)"],
    ["e⁻", "e⁻"], ["hν", "hν"], ["t°", "t°"]
  ].map(([label, value]) => ({ label, value }));

  const CHEMISTRY_IONS = [
    "H⁺", "OH⁻", "Na⁺", "K⁺", "Ag⁺", "Ca²⁺", "Mg²⁺", "Ba²⁺", "Zn²⁺",
    "Cu²⁺", "Fe²⁺", "Fe³⁺", "Al³⁺", "Cl⁻", "Br⁻", "I⁻", "NO₃⁻",
    "SO₄²⁻", "SO₃²⁻", "CO₃²⁻", "HCO₃⁻", "PO₄³⁻", "NH₄⁺", "MnO₄⁻", "Cr₂O₇²⁻"
  ].map(x => ({ label: x, value: x }));

  const BIOLOGY_SYMBOLS = [
    "♀", "♂", "×", "F₁", "F₂", "P", "DNA", "RNA", "mRNA", "tRNA",
    "ATP", "ADP", "NAD", "NADH", "O₂", "CO₂", "H₂O", "α", "β", "γ",
    "Δ", "→", "↔", "↑", "↓", "Aa", "AA", "aa", "Xᴬ", "Xᵃ",
    "Y", "XX", "XY", "n", "2n", "G₁", "G₂", "S", "M"
  ].map(x => ({ label: x, value: x }));

  const ELEMENTS = (
    "H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca " +
    "Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr " +
    "Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe " +
    "Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu " +
    "Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn " +
    "Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr " +
    "Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og"
  ).split(" ").map(x => ({ label: x, value: x }));

  const BANKS = {
    matematika: {
      "1. Raqamlar": NUMBERS, "2. Lotin harflari": LATIN_LETTERS,
      "3. Asosiy belgilar": BASIC_MATH, "4. Kasr, ildiz, daraja va indeks": STRUCTURES,
      "5. Trigonometriya va funksiyalar": TRIG_FUNCTIONS, "6. Yunon harflari": GREEK,
      "7. Qo'shimcha matematik belgilar": MATH_SYMBOLS
    },
    fizika: {
      "1. Raqamlar": NUMBERS, "2. Lotin harflari": LATIN_LETTERS,
      "3. Asosiy belgilar": BASIC_MATH, "4. Kasr, ildiz, daraja va indeks": STRUCTURES,
      "5. Matematik funksiyalar": TRIG_FUNCTIONS, "6. Fizik belgilar": PHYSICS_SYMBOLS,
      "7. Yunon harflari": GREEK
    },
    kimyo: {
      "1. Raqamlar": NUMBERS, "2. Elementlar": ELEMENTS,
      "3. Yuqori va pastki indekslar": INDEX_TOOLS, "4. Ionlar": CHEMISTRY_IONS,
      "5. Reaksiya va amallar": CHEMISTRY_SYMBOLS
    },
    biologiya: {
      "1. Raqamlar": NUMBERS, "2. Biologik belgilar": BIOLOGY_SYMBOLS,
      "3. Yuqori va pastki indekslar": INDEX_TOOLS, "4. Elementlar": ELEMENTS
    }
  };

  function loadMathLive() {
    if (customElements.get("math-field")) return Promise.resolve();
    if (mathLivePromise) return mathLivePromise;

    mathLivePromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathlive@0.111.0";
      script.onload = () => resolve();
      script.onerror = () => { mathLivePromise = null; reject(new Error("MathLive yuklanmadi")); };
      document.head.appendChild(script);
    });
    return mathLivePromise;
  }

  function addStyles() {
    if (document.getElementById("formula-editor-styles")) return;
    const style = document.createElement("style");
    style.id = "formula-editor-styles";
    style.textContent = `
      .fm-backdrop { position:fixed; inset:0; z-index:2147483000; background:rgba(8,13,25,.75); display:flex; align-items:flex-end; justify-content:center; padding:4px; box-sizing:border-box; }
      .fm-backdrop[hidden] { display:none!important; }
      .fm-panel { width:min(520px,100%); max-height:96dvh; overflow-y:auto; background:#0756b8; color:white; border-radius:14px; padding:10px; box-sizing:border-box; box-shadow:0 10px 40px #0008; }
      .fm-head { display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:15px; margin-bottom:8px; }
      .fm-close { width:30px; height:30px; border:0; border-radius:50%; background:#ffffff22; color:white; font-size:22px; cursor:pointer; }
      .fm-field { width:100%; min-height:65px; resize:vertical; background:white; color:#111827; border-radius:8px; padding:10px; font-size:22px; margin-bottom:8px; box-sizing:border-box; border:none; outline:none; }
      .fm-math-field { display:block; width:100%; min-height:80px; background:white; color:#111827; border-radius:8px; padding:12px; font-size:25px; margin-bottom:8px; box-sizing:border-box; border:none; outline:none; }
      .fm-math-field[hidden], .fm-field[hidden] { display:none!important; }
      .fm-section { margin:9px 0; }
      .fm-section-title { font-size:13px; font-weight:bold; padding:6px 2px; border-bottom:1px solid #ffffff44; margin-bottom:6px; }
      .fm-keys-flex { display:flex; flex-wrap:wrap; gap:4px; }
      .fm-number-grid { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:5px; }
      .fm-elements-grid { display:grid; grid-template-columns:repeat(8,minmax(0,1fr)); gap:4px; }
      .fm-key { min-height:39px; min-width:38px; border:0; border-radius:5px; background:white; color:#0756b8; font-size:14px; font-weight:bold; padding:5px; cursor:pointer; display:flex; align-items:center; justify-content:center; user-select:none; }
      .fm-key:active { background:#bfdbfe; transform:scale(.96); }
      .fm-fixed-tools { display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:4px; margin-top:8px; }
      .fm-fixed-tools button { min-width:0; min-height:37px; border:0; border-radius:6px; font-size:14px; font-weight:bold; background:#1e3a8a; color:white; cursor:pointer; }
      .fm-actions { display:flex; gap:6px; margin-top:6px; }
      .fm-actions button { flex:1; min-height:40px; border:0; border-radius:6px; font-size:14px; font-weight:bold; cursor:pointer; }
      .fm-cancel { background:#334155; color:white; }
      .fm-save { background:#0f9f82; color:white; }
      .fm-open { display:inline-flex; align-items:center; justify-content:center; min-width:36px; height:36px; margin-left:4px; border:0; border-radius:6px; background:#e0f2fe; color:#075985; font-weight:bold; cursor:pointer; }
      .fm-structure-key { min-width:55px; min-height:48px; padding:5px 9px; }
      .fm-preview { display:inline-flex; align-items:center; justify-content:center; color:#0756b8; font-family:serif; font-size:20px; line-height:1; min-width:27px; min-height:28px; }
      .fm-visual-preview { position:absolute; inset:0; background:#fff; border-radius:12px; display:flex; align-items:center; padding:0 12px; font-size:20px; cursor:pointer; z-index:5; }
    `;
    document.head.appendChild(style);
  }

  function createStructurePreview(label) {
    const previews = {
      "Kasr": `<span class="fm-preview" style="display:inline-flex;flex-direction:column;align-items:center;font-size:16px"><span style="border-bottom:1px solid #0756b8;padding:0 3px">a</span><span>b</span></span>`,
      "Ildiz": `<span class="fm-preview">√x</span>`,
      "Kub ildiz": `<span class="fm-preview">³√x</span>`,
      "n-darajali ildiz": `<span class="fm-preview">ⁿ√x</span>`,
      "Daraja": `<span class="fm-preview">xⁿ</span>`,
      "Indeks": `<span class="fm-preview">xₙ</span>`,
      "Daraja va indeks": `<span class="fm-preview">xᵢⁿ</span>`,
      "Yig'indi": `<span class="fm-preview">∑</span>`,
      "Ko'paytma": `<span class="fm-preview">∏</span>`,
      "Integral": `<span class="fm-preview">∫</span>`,
      "Ikki karrali integral": `<span class="fm-preview">∬</span>`,
      "Hosila": `<span class="fm-preview">d/dx</span>`,
      "Limit": `<span class="fm-preview">lim</span>`,
      "Matritsa": `<span class="fm-preview">[a]</span>`,
      "Modul": `<span class="fm-preview">|x|</span>`,
      "Qavs": `<span class="fm-preview">(x)</span>`,
      "Vektor": `<span class="fm-preview">a⃗</span>`,
      "Ustki chiziq": `<span class="fm-preview">ā</span>`,
      "Burchak": `<span class="fm-preview">∠</span>`,
      "Nisbat": `<span class="fm-preview">a:b</span>`
    };
    return previews[label] || null;
  }

  function ensureModal() {
    if (modal) return;
    addStyles();

    modal = document.createElement("div");
    modal.className = "fm-backdrop";
    modal.hidden = true;

    modal.innerHTML = `
      <section class="fm-panel" role="dialog" aria-modal="true">
        <div class="fm-head">
          <span id="fm-title">Formula muharriri</span>
          <button type="button" class="fm-close" id="fm-close">×</button>
        </div>
        <textarea id="fm-field" class="fm-field" hidden></textarea>
        <math-field id="fm-math-field" class="fm-math-field" inputmode="none" virtual-keyboard-mode="manual" hidden></math-field>
        <div class="fm-fixed-tools">
          <button type="button" id="fm-left">←</button>
          <button type="button" id="fm-up">↑</button>
          <button type="button" id="fm-down">↓</button>
          <button type="button" id="fm-right">→</button>
          <button type="button" id="fm-backspace">⌫</button>
          <button type="button" id="fm-clear">C</button>
        </div>
        <div class="fm-actions">
          <button type="button" class="fm-cancel" id="fm-cancel">Bekor qilish</button>
          <button type="button" class="fm-save" id="fm-save">Tayyor ✓</button>
        </div>
        <div id="fm-sections"></div>
      </section>
    `;

    document.body.appendChild(modal);

    unicodeEditor = modal.querySelector("#fm-field");
    mathEditor = modal.querySelector("#fm-math-field");

    modal.querySelector("#fm-close").addEventListener("click", close);
    modal.querySelector("#fm-cancel").addEventListener("click", close);
    modal.querySelector("#fm-save").addEventListener("click", save);

    const cursorCommands = {
      "fm-left": "moveToPreviousChar",
      "fm-right": "moveToNextChar",
      "fm-up": "moveUp",
      "fm-down": "moveDown"
    };

    Object.entries(cursorCommands).forEach(([id, command]) => {
      const button = modal.querySelector("#" + id);
      button.addEventListener("pointerdown", ev => ev.preventDefault());
      button.addEventListener("click", () => {
        if (IS_MATH() && !mathEditor.hidden) mathEditor.executeCommand(command);
      });
    });

    modal.querySelector("#fm-backspace").addEventListener("click", () => {
      if (IS_MATH() && !mathEditor.hidden) mathEditor.executeCommand("deleteBackward");
    });

    modal.querySelector("#fm-clear").addEventListener("click", () => {
      if (IS_MATH() && !mathEditor.hidden) mathEditor.value = "";
    });

    modal.addEventListener("click", ev => { if (ev.target === modal) close(); });
  }

  function insertValue(value) {
    if (!modal) return;
    if (IS_MATH() && !mathEditor.hidden) {
      mathEditor.executeCommand(["insert", value, { selectionMode: "placeholder" }]);
    }
  }

  function renderBank() {
    const container = modal.querySelector("#fm-sections");
    container.replaceChildren();
    const bank = BANKS[activeSubject];

    Object.entries(bank).forEach(([title, items], index) => {
      const section = document.createElement("section");
      section.className = "fm-section";
      const heading = document.createElement("div");
      heading.className = "fm-section-title";
      heading.textContent = title;
      section.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = index === 0 ? "fm-number-grid" : (title.includes("Elementlar") ? "fm-elements-grid" : "fm-keys-flex");

      items.forEach(item => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "fm-key";
        const preview = IS_MATH() && title.includes("Kasr, ildiz") ? createStructurePreview(item.label) : null;

        if (preview) {
          button.classList.add("fm-structure-key");
          button.innerHTML = preview;
        } else {
          button.textContent = item.label;
        }

        button.addEventListener("pointerdown", ev => ev.preventDefault());
        button.addEventListener("click", ev => {
          ev.preventDefault();
          ev.stopPropagation();
          insertValue(item.value);
        });
        grid.appendChild(button);
      });
      section.appendChild(grid);
      container.appendChild(section);
    });
  }

  async function open(target, subject) {
    if (!target) return;
    activeTarget = target;
    const currentTarget = target;
    const key = String(subject || "matematika").toLowerCase().trim();
    activeSubject = BANKS[key] ? key : "matematika";

    ensureModal();
    modal.hidden = false;

    if (IS_MATH()) {
      try {
        await loadMathLive();
        if (activeTarget !== currentTarget) return;

        unicodeEditor.hidden = true;
        mathEditor.hidden = false;
        mathEditor.setAttribute("inputmode", "none");
        mathEditor.setAttribute("virtual-keyboard-mode", "manual");
        mathEditor.mathVirtualKeyboardPolicy = "manual";

        mathEditor.value = target.value || "";
        renderBank();
        
        // Telefon klaviaturasi sakrashining oldini olish uchun
        mathEditor.blur();
        setTimeout(() => mathEditor.focus(), 50);
      } catch (error) {
        console.error("MathLive xatosi:", error);
        close();
      }
    } else {
      mathEditor.hidden = true;
      unicodeEditor.hidden = false;
      unicodeEditor.value = target.value || "";
      renderBank();
      unicodeEditor.focus();
    }
  }

  function save() {
    if (!activeTarget) {
      close();
      return;
    }

    if (IS_MATH()) {
      const val = mathEditor.value;
      activeTarget.value = val;

      let visualContainer = activeTarget.parentNode.querySelector(".fm-visual-preview");
      if (!visualContainer) {
        visualContainer = document.createElement("div");
        visualContainer.className = "fm-visual-preview";
        
        visualContainer.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          open(activeTarget, activeSubject);
        });

        activeTarget.style.position = "relative";
        activeTarget.style.color = "transparent";
        activeTarget.insertAdjacentElement("afterend", visualContainer);
      }

      visualContainer.innerHTML = `<math-field read-only style="border:none; background:transparent; pointer-events:none; width:100%;">${val}</math-field>`;
    } else {
      activeTarget.value = unicodeEditor.value;
    }

    activeTarget.dispatchEvent(new Event("input", { bubbles: true }));
    activeTarget.dispatchEvent(new Event("change", { bubbles: true }));
    close();
  }

  function close() {
    if (modal) modal.hidden = true;
    if (window.mathVirtualKeyboard) window.mathVirtualKeyboard.hide();
    activeTarget = null;
  }

  function attach(target, subject) {
    if (!target || target.dataset.formulaButtonAttached === "1") return;
    target.dataset.formulaButtonAttached = "1";

    const selectedSubject = String(subject || "matematika").toLowerCase();

    function openForTarget(event) {
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      open(target, selectedSubject);
    }

    target.addEventListener("click", openForTarget);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "fm-open";
    button.textContent = "∑";
    button.title = "Maxsus klaviaturani ochish";
    button.addEventListener("click", openForTarget);

    target.insertAdjacentElement("afterend", button);
  }

  window.FormulaEditor = { open, attach, close, banks: BANKS };
})();
