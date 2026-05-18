"use client";

import { useState, useEffect, useRef } from "react";

type Field = { name: string; label: string; type: string; placeholder: string };

const fields: Field[] = [
  { name: "name", label: "Full Name", type: "text", placeholder: "Jane Smith" },
  {
    name: "email",
    label: "Work Email",
    type: "email",
    placeholder: "jane@company.com",
  },
  { name: "company", label: "Company", type: "text", placeholder: "Acme Corp" },
  {
    name: "website",
    label: "Website",
    type: "text",
    placeholder: "https://acme.com",
  },
];

type Status = "idle" | "loading" | "success" | "error";

type ValidationErrors = Partial<Record<string, string>>;

const validators: Record<string, (v: string) => string | null> = {
  name: (v) => (v.trim().length < 2 ? "Must be at least 2 characters" : null),
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? null
      : "Enter a valid email address",
  company: (v) => (v.trim().length < 1 ? "Company name is required" : null),
  website: (v) => {
    const val = v.trim();
    if (!val) return "Website is required";
    if (!/^https?:\/\/.+\..+/.test(val) && !/.+\..+/.test(val))
      return "Enter a valid URL";
    return null;
  },
};

const validateAll = (data: Record<string, string>): ValidationErrors => {
  const errs: ValidationErrors = {};
  for (const field of fields) {
    const err = validators[field.name]?.(data[field.name] ?? "");
    if (err) errs[field.name] = err;
  }
  return errs;
};

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const dots = Array.from({ length: 55 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.5 + 0.15,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140,120,255,${d.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.55,
      }}
    />
  );
}

function SuccessScreen({ name }: { name: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        ...sty.successWrap,
        opacity: show ? 1 : 0,
        transform: show ? "scale(1)" : "scale(0.93)",
      }}
    >
      <div style={sty.ringWrap} className="ring-anim">
        <div style={sty.ringOuter} />
        <div style={sty.ringInner} />
        <div style={sty.checkCircle}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M6 14l6 6 10-10"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="check-path"
              style={{
                strokeDasharray: 28,
                strokeDashoffset: show ? 0 : 28,
                transition: "stroke-dashoffset 0.5s ease 0.3s",
              }}
            />
          </svg>
        </div>
      </div>

      <h2 style={sty.successTitle}>
        You're in{name ? `, ${name.split(" ")[0]}` : ""}.
      </h2>
      <p style={sty.successSub}>
        Your AI-powered audit is being generated.
        <br />
        Check your inbox within 24 hours.
      </p>
      <div style={sty.successPills}>
        {["Website scanned", "AI analyzing", "Report queued"].map((s, i) => (
          <div
            key={s}
            style={{
              ...sty.pill,
              opacity: show ? 1 : 0,
              transform: show ? "translateY(0)" : "translateY(8px)",
              transition: `all 0.4s ease ${0.5 + i * 0.1}s`,
            }}
          >
            <span style={sty.pillDot} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingOverlay() {
  const [step, setStep] = useState(0);
  const steps = [
    "Scanning your website…",
    "Running AI analysis…",
    "Building your report…",
  ];

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={sty.overlay}>
      <div style={sty.overlayInner}>
        <div style={sty.orbitRing} className="orbit" />
        <div
          style={{ ...sty.orbitRing, ...sty.orbitRing2 }}
          className="orbit-rev"
        />
        <div style={sty.orbitDot} className="orbit-dot" />
        <div
          style={{
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(180,160,255,0.8)",
            fontFamily: "Helvetica Neue, sans-serif",
            marginTop: "20px",
            transition: "opacity 0.3s",
          }}
        >
          {steps[step]}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (touched.has(name)) {
      const err = validators[name]?.(value);
      setErrors((prev) => ({ ...prev, [name]: err ?? undefined }));
    }
  };

  const handleBlur = (name: string) => {
    setFocused(null);
    setTouched((prev) => new Set(prev).add(name));
    const err = validators[name]?.(
      formData[name as keyof typeof formData] ?? "",
    );
    setErrors((prev) => ({ ...prev, [name]: err ?? undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const allTouched = new Set(fields.map((f) => f.name));
    setTouched(allTouched);
    const errs = validateAll(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setStatus("loading");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lead`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.message || "Server error");
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const isDisabled = status === "loading";

  if (status === "success") {
    return (
      <main style={sty.page}>
        <ParticleCanvas />
        <div style={sty.card} className="card-enter">
          <SuccessScreen name={formData.name} />
        </div>
        <style>{css}</style>
      </main>
    );
  }

  return (
    <main style={sty.page}>
      <ParticleCanvas />
      {status === "loading" && <LoadingOverlay />}

      <div
        style={{
          ...sty.card,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.55s ease, transform 0.55s ease",
          filter: status === "loading" ? "blur(2px)" : "none",
          pointerEvents: status === "loading" ? "none" : "auto",
        }}
      >
        <div style={sty.header}>
          <div style={sty.badge}>
            <span style={sty.badgeDot} />
            AI-Powered Audit
          </div>
          <h1 style={sty.title}>Let's talk.</h1>
          <p style={sty.subtitle}>
            Tell us about your business and we'll send a personalized audit
            within 24 hours.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate style={sty.form}>
          {fields.map((field, i) => {
            const hasError = !!(touched.has(field.name) && errors[field.name]);
            const hasValue = !!formData[field.name as keyof typeof formData];
            const isFocused = focused === field.name;

            return (
              <div
                key={field.name}
                style={{ ...sty.fieldGroup, animationDelay: `${i * 70}ms` }}
                className="field-in"
              >
                <label
                  htmlFor={field.name}
                  style={{
                    ...sty.label,
                    color: hasError
                      ? "#f87171"
                      : isFocused || hasValue
                        ? "#9d8fff"
                        : "#686888",
                  }}
                >
                  {field.label}
                </label>

                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={isFocused ? field.placeholder : ""}
                  value={formData[field.name as keyof typeof formData]}
                  onChange={handleChange}
                  onFocus={() => setFocused(field.name)}
                  onBlur={() => handleBlur(field.name)}
                  required
                  disabled={isDisabled}
                  aria-invalid={hasError}
                  aria-describedby={hasError ? `${field.name}-err` : undefined}
                  style={{
                    ...sty.input,
                    color: isFocused ? "#ffffff" : "#e0daff",
                    borderBottomColor: hasError
                      ? "rgba(248,113,113,0.4)"
                      : "#2e2e40",
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                />

                <div
                  style={{
                    ...sty.underline,
                    width: isFocused ? "100%" : "0%",
                    background: hasError
                      ? "linear-gradient(90deg,#f87171,#fca5a5)"
                      : "linear-gradient(90deg,#7c6fff,#c4b5fd)",
                  }}
                />

                {hasError && (
                  <p
                    id={`${field.name}-err`}
                    style={sty.fieldError}
                    role="alert"
                  >
                    {errors[field.name]}
                  </p>
                )}
              </div>
            );
          })}

          {status === "error" && (
            <div style={sty.errorBanner} role="alert">
              <span>⚠</span>
              <span>Something went wrong — please try again.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            style={{
              ...sty.button,
              opacity: isDisabled ? 0.6 : 1,
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
            className={isDisabled ? "" : "submit-btn"}
          >
            {isDisabled ? (
              <span style={sty.btnSpinner} className="spin" />
            ) : (
              <>
                <span>Get My Free Audit</span>
                <span style={sty.arrow} className="arrow">
                  →
                </span>
              </>
            )}
          </button>
        </form>

        <p style={sty.privacy}>🔒 Your data is never sold or shared.</p>
      </div>

      <style>{css}</style>
    </main>
  );
}

const sty: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(ellipse at 30% 20%, #0d0b1e 0%, #07060f 60%, #0a0a0f 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    position: "relative",
  },
  card: {
    position: "relative",
    zIndex: 1,
    background: "linear-gradient(160deg, #131220 0%, #0f0e1a 100%)",
    border: "1px solid rgba(120,100,255,0.14)",
    borderRadius: "20px",
    padding: "52px 48px",
    width: "100%",
    maxWidth: "460px",
    boxShadow: "0 0 100px rgba(100,80,255,0.07), 0 40px 80px rgba(0,0,0,0.7)",
  },

  header: { marginBottom: "36px" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    fontSize: "10px",
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: "#9d8fff",
    background: "rgba(124,111,255,0.1)",
    border: "1px solid rgba(124,111,255,0.22)",
    borderRadius: "100px",
    padding: "5px 13px",
    marginBottom: "20px",
    fontFamily: "Helvetica Neue, sans-serif",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#7c6fff",
    boxShadow: "0 0 6px #7c6fff",
    animation: "pulse 2s ease infinite",
    display: "inline-block",
  },
  title: {
    fontSize: "42px",
    fontWeight: "400",
    color: "#f0eeff",
    margin: "0 0 10px",
    lineHeight: "1.1",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#9090aa",
    margin: 0,
    fontFamily: "Helvetica Neue, sans-serif",
    lineHeight: "1.65",
  },

  form: { display: "flex", flexDirection: "column", gap: "26px" },
  fieldGroup: { position: "relative" },
  label: {
    display: "block",
    fontSize: "10px",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    marginBottom: "8px",
    fontFamily: "Helvetica Neue, sans-serif",
    transition: "color 0.2s ease",
    fontWeight: "500",
  },
  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #2e2e40",
    padding: "10px 0 10px",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box" as const,
    fontFamily: "Georgia, serif",
    transition: "color 0.2s, border-color 0.2s",
    caretColor: "#7c6fff",
  },
  underline: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "1.5px",
    transition: "width 0.32s cubic-bezier(0.4,0,0.2,1)",
  },
  fieldError: {
    margin: "5px 0 0",
    fontSize: "11px",
    color: "#f87171",
    fontFamily: "Helvetica Neue, sans-serif",
    letterSpacing: "0.02em",
    animation: "fadeIn 0.2s ease",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(248,113,113,0.08)",
    border: "1px solid rgba(248,113,113,0.25)",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#fca5a5",
    fontFamily: "Helvetica Neue, sans-serif",
    animation: "fadeIn 0.25s ease",
  },

  button: {
    marginTop: "4px",
    width: "100%",
    padding: "16px 24px",
    background: "linear-gradient(135deg,#5b4fff,#7c6fff)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontFamily: "Helvetica Neue, sans-serif",
    letterSpacing: "0.04em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s",
    boxShadow: "0 4px 28px rgba(92,79,255,0.35)",
    fontWeight: "500",
  },
  arrow: { fontSize: "18px", display: "inline-block" },
  btnSpinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.25)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    display: "inline-block",
  },
  privacy: {
    marginTop: "22px",
    textAlign: "center" as const,
    fontSize: "12px",
    color: "#44445a",
    fontFamily: "Helvetica Neue, sans-serif",
  },

  successWrap: {
    transition:
      "opacity 0.45s ease, transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  ringWrap: {
    position: "relative",
    width: "80px",
    height: "80px",
    marginBottom: "28px",
  },
  ringOuter: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    border: "1.5px solid rgba(124,111,255,0.25)",
    animation: "expandRing 0.6s ease forwards",
  },
  ringInner: {
    position: "absolute",
    inset: "8px",
    borderRadius: "50%",
    border: "1px solid rgba(124,111,255,0.15)",
    animation: "expandRing 0.6s ease 0.1s forwards",
  },
  checkCircle: {
    position: "absolute",
    inset: "16px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#5b4fff,#7c6fff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 28px rgba(92,79,255,0.45)",
  },
  successTitle: {
    fontSize: "34px",
    fontWeight: "400",
    color: "#f0eeff",
    textAlign: "center" as const,
    margin: "0 0 10px",
    letterSpacing: "-0.3px",
  },
  successSub: {
    fontSize: "14px",
    color: "#9090aa",
    textAlign: "center" as const,
    fontFamily: "Helvetica Neue, sans-serif",
    lineHeight: "1.65",
    margin: "0 0 24px",
  },
  successPills: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(124,111,255,0.1)",
    border: "1px solid rgba(124,111,255,0.2)",
    borderRadius: "999px",
    padding: "5px 12px",
    fontSize: "11px",
    color: "#9d8fff",
    fontFamily: "Helvetica Neue, sans-serif",
    letterSpacing: "0.02em",
  },
  pillDot: {
    width: "5px",
    height: "5px",
    borderRadius: "50%",
    background: "#7c6fff",
    boxShadow: "0 0 5px #7c6fff",
  },

  // Loading overlay
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(7,6,15,0.6)",
    backdropFilter: "blur(4px)",
  },
  overlayInner: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0",
    position: "relative",
  },
  orbitRing: {
    position: "absolute",
    width: "64px",
    height: "64px",
    border: "1.5px solid transparent",
    borderTopColor: "rgba(124,111,255,0.7)",
    borderRadius: "50%",
    top: "-32px",
  },
  orbitRing2: {
    width: "44px",
    height: "44px",
    borderTopColor: "transparent",
    borderRightColor: "rgba(180,160,255,0.4)",
    top: "-22px",
  },
  orbitDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#7c6fff",
    boxShadow: "0 0 12px #7c6fff",
    marginBottom: "44px",
  },
};

const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.45; }
  }
  @keyframes expandRing {
    from { transform: scale(0.7); opacity: 0; }
    to   { transform: scale(1);   opacity: 1; }
  }

  .field-in { animation: fadeUp 0.42s ease both; }
  .spin      { animation: spin 0.75s linear infinite; }
  .orbit     { animation: spin 1.4s linear infinite; }
  .orbit-rev { animation: spin 2.2s linear infinite reverse; }
  .orbit-dot { animation: pulse 1.2s ease infinite; }

  .submit-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 10px 36px rgba(92,79,255,0.55) !important;
  }
  .submit-btn:hover .arrow {
    transform: translateX(5px);
    transition: transform 0.2s ease;
  }
  .submit-btn:active {
    transform: translateY(0px) !important;
  }

  input::placeholder {
    color: #3e3e58;
    font-family: Helvetica Neue, sans-serif;
    font-size: 14px;
  }
  input:disabled { cursor: not-allowed; }

  /* Responsive */
  @media (max-width: 520px) {
    .card-enter {
      padding: 36px 28px !important;
    }
  }
`;
