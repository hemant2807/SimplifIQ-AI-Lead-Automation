"use client";

import { useState } from "react";

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

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
  });
  const [focused, setFocused] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const response = await fetch("http://localhost:5000/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>You're in.</h2>
          <p style={styles.successText}>We'll be in touch shortly.</p>
        </div>
        <style>{css}</style>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>AI-Powered</div>
          <h1 style={styles.title}>Let's talk.</h1>
          <p style={styles.subtitle}>
            Tell us about yourself and we'll reach out within 24 hours.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {fields.map((field, i) => (
            <div
              key={field.name}
              style={{ ...styles.fieldGroup, animationDelay: `${i * 60}ms` }}
              className="field-group"
            >
              <label
                htmlFor={field.name}
                style={{
                  ...styles.label,
                  ...(focused === field.name ||
                  formData[field.name as keyof typeof formData]
                    ? styles.labelActive
                    : {}),
                }}
              >
                {field.label}
              </label>
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                placeholder={focused === field.name ? field.placeholder : ""}
                value={formData[field.name as keyof typeof formData]}
                onChange={handleChange}
                onFocus={() => setFocused(field.name)}
                onBlur={() => setFocused(null)}
                required
                style={{
                  ...styles.input,
                  ...(focused === field.name ? styles.inputFocused : {}),
                }}
              />
              <div
                style={{
                  ...styles.inputLine,
                  ...(focused === field.name ? styles.inputLineActive : {}),
                }}
              />
            </div>
          ))}

          {status === "error" && (
            <p style={styles.errorMsg}>
              Something went wrong. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              ...styles.button,
              ...(status === "loading" ? styles.buttonLoading : {}),
            }}
            className="submit-btn"
          >
            {status === "loading" ? (
              <span style={styles.spinner} className="spinner" />
            ) : (
              <>
                <span>Submit</span>
                <span style={styles.arrow}>→</span>
              </>
            )}
          </button>
        </form>

        <p style={styles.privacy}>🔒 Your data is never sold or shared.</p>
      </div>
      <style>{css}</style>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'Georgia', 'Times New Roman', serif",
  },
  card: {
    background: "#111118",
    border: "1px solid #222230",
    borderRadius: "20px",
    padding: "52px 48px",
    width: "100%",
    maxWidth: "460px",
    boxShadow:
      "0 0 80px rgba(120, 100, 255, 0.06), 0 32px 64px rgba(0,0,0,0.6)",
  },
  header: {
    marginBottom: "40px",
  },
  badge: {
    display: "inline-block",
    fontSize: "10px",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#7c6fff",
    background: "rgba(124, 111, 255, 0.1)",
    border: "1px solid rgba(124, 111, 255, 0.25)",
    borderRadius: "100px",
    padding: "4px 12px",
    marginBottom: "20px",
    fontFamily: "'Helvetica Neue', sans-serif",
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
    fontFamily: "'Helvetica Neue', sans-serif",
    lineHeight: "1.6",
    fontWeight: "400",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
  },
  fieldGroup: {
    position: "relative",
    animation: "fadeUp 0.4s ease both",
  },
  label: {
    display: "block",
    fontSize: "11px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#686888",
    marginBottom: "8px",
    fontFamily: "'Helvetica Neue', sans-serif",
    transition: "color 0.2s ease",
    fontWeight: "500",
  },
  labelActive: {
    color: "#7c6fff",
  },
  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #2e2e40",
    padding: "10px 0",
    fontSize: "16px",
    color: "#e8e4ff",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Georgia', serif",
    transition: "color 0.2s ease",
    caretColor: "#7c6fff",
  },
  inputFocused: {
    color: "#ffffff",
  },
  inputLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "1px",
    width: "0%",
    background: "linear-gradient(90deg, #7c6fff, #a78bfa)",
    transition: "width 0.3s ease",
  },
  inputLineActive: {
    width: "100%",
  },
  button: {
    marginTop: "8px",
    width: "100%",
    padding: "16px 24px",
    background: "linear-gradient(135deg, #5b4fff, #7c6fff)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    cursor: "pointer",
    fontFamily: "'Helvetica Neue', sans-serif",
    letterSpacing: "0.04em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "transform 0.15s ease, box-shadow 0.15s ease, opacity 0.2s",
    boxShadow: "0 4px 24px rgba(92, 79, 255, 0.35)",
    fontWeight: "500",
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  arrow: {
    fontSize: "18px",
    transition: "transform 0.2s ease",
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  errorMsg: {
    color: "#f87171",
    fontSize: "13px",
    fontFamily: "'Helvetica Neue', sans-serif",
    margin: "-8px 0",
  },
  privacy: {
    marginTop: "24px",
    textAlign: "center",
    fontSize: "12px",
    color: "#55556e",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  successIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "rgba(124, 111, 255, 0.15)",
    border: "1px solid rgba(124, 111, 255, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    color: "#7c6fff",
    margin: "0 auto 24px",
  },
  successTitle: {
    fontSize: "36px",
    fontWeight: "400",
    color: "#f0eeff",
    textAlign: "center",
    margin: "0 0 10px",
    letterSpacing: "-0.3px",
  },
  successText: {
    fontSize: "15px",
    color: "#9090aa",
    textAlign: "center",
    fontFamily: "'Helvetica Neue', sans-serif",
    margin: 0,
  },
};

const css = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .submit-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(92, 79, 255, 0.5) !important;
  }
  .submit-btn:hover .arrow {
    transform: translateX(4px);
  }
  .submit-btn:active:not(:disabled) {
    transform: translateY(0);
  }
  input::placeholder {
    color: #4a4a62;
    font-family: 'Helvetica Neue', sans-serif;
    font-size: 14px;
  }
`;
