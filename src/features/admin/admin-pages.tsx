"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, LoadingState } from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";

type StaffRole = "admin" | "operations";
type DemoSession = { role: StaffRole; expiresAt: number };
const sessionKey = "offmark-admin-demo-session";

const navigation = [
  ["", "Overview"],
  ["catalog/drops", "Drops"],
  ["catalog/designs", "Designs"],
  ["services", "Services"],
  ["content/building", "Building updates"],
  ["content/policies", "Policies"],
  ["orders", "Orders"],
  ["users", "Staff users"],
] as const;

function readSession(): DemoSession | null {
  try {
    const raw = sessionStorage.getItem(sessionKey);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<DemoSession>;
    if (
      (value.role !== "admin" && value.role !== "operations") ||
      typeof value.expiresAt !== "number"
    ) {
      return null;
    }
    return value as DemoSession;
  } catch {
    return null;
  }
}

export function AdminLoginPage({ demo = false }: { demo?: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("operations");
  const [message, setMessage] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!demo) return;
    if (email !== "staff@offmark.test" || password !== "preview-only") {
      setMessage("The fictional credentials are invalid.");
      return;
    }
    sessionStorage.setItem(
      sessionKey,
      JSON.stringify({ role, expiresAt: Date.now() + 15 * 60 * 1000 }),
    );
    router.push("/preview/admin");
  };
  return (
    <main id="main" className="admin-login-page">
      <div className="admin-login-panel">
        <p className="eyebrow">Offmark staff</p>
        <h1 className="text-page">Admin sign in</h1>
        {!demo && (
          <Alert title="Admin unavailable">
            The live staff authentication adapter has not been connected.
          </Alert>
        )}
        {demo && (
          <p className="alert">
            Development preview credentials: staff@offmark.test / preview-only
          </p>
        )}
        <form className="submission-form" onSubmit={submit}>
          <Field
            label="Staff email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
            disabled={!demo}
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={!demo}
          />
          {demo && (
            <fieldset className="admin-role-choice">
              <legend className="text-label">Preview role</legend>
              <label>
                <input
                  type="radio"
                  name="role"
                  checked={role === "operations"}
                  onChange={() => setRole("operations")}
                />{" "}
                Operations
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  checked={role === "admin"}
                  onChange={() => setRole("admin")}
                />{" "}
                Admin
              </label>
            </fieldset>
          )}
          <Button type="submit" disabled={!demo}>
            Sign in
          </Button>
          {message && (
            <Alert title="Unable to sign in" tone="error">
              {message}
            </Alert>
          )}
        </form>
      </div>
    </main>
  );
}

function MutationButton({
  children,
  adminOnly = false,
  role,
}: {
  children: ReactNode;
  adminOnly?: boolean;
  role: StaffRole;
}) {
  const [message, setMessage] = useState("");
  const forbidden = adminOnly && role !== "admin";
  return (
    <div className="admin-mutation">
      <Button
        type="button"
        size="compact"
        variant="outline"
        disabled={forbidden}
        onClick={() =>
          setMessage("Simulated mutation complete. No backend record changed.")
        }
      >
        {children}
      </Button>
      {forbidden && <span className="text-metadata">Admin role required</span>}
      {message && <output className="text-metadata">{message}</output>}
    </div>
  );
}

function AdminContent({ section, role }: { section: string; role: StaffRole }) {
  if (section === "users" && role !== "admin") {
    return (
      <Alert title="Forbidden" tone="error">
        Staff user management requires the admin role.
      </Alert>
    );
  }
  const content: Record<
    string,
    { title: string; description: string; rows: string[] }
  > = {
    "": {
      title: "Operational overview",
      description:
        "Review catalogue, publication and fulfillment work requiring attention.",
      rows: [
        "1 sample open drop",
        "3 sample designs",
        "1 sample order awaiting production",
      ],
    },
    "catalog/drops": {
      title: "Drops",
      description:
        "Create and move drops through explicit lifecycle transitions.",
      rows: ["Sample Open Drop · Open", "Sample Retired Drop · Retired"],
    },
    "catalog/designs": {
      title: "Designs and variants",
      description:
        "Manage garment data, NGN prices, availability, media and size guides.",
      rows: [
        "Sample Wrap Shirt · ₦48,500",
        "Sample Panel Trousers · ₦56,500",
        "Sample Unpriced Design · Price required",
      ],
    },
    services: {
      title: "Service availability",
      description: "Manage confirmed service status and destinations.",
      rows: [
        "Seam · In development",
        "Marketplace · In development",
        "Drip · In development",
      ],
    },
    "content/building": {
      title: "Building updates",
      description: "Draft, preview and publish evidence-backed updates.",
      rows: [
        "Sample published milestone · Published",
        "Sample workflow milestone · Published",
      ],
    },
    "content/policies": {
      title: "Policies",
      description: "Draft and publish versioned customer terms.",
      rows: ["Sample preorder policy · demo-1"],
    },
    orders: {
      title: "Orders",
      description: "Keep payment and fulfillment state separate.",
      rows: ["DEMO-ORDER-001 · Paid · Awaiting production"],
    },
    users: {
      title: "Staff users",
      description: "Admin-only access and role management.",
      rows: [
        "staff@offmark.test · Admin",
        "operations@offmark.test · Operations",
      ],
    },
  };
  const selected = content[section] ?? content[""];
  return (
    <div className="admin-content">
      <div>
        <p className="eyebrow">Admin dashboard</p>
        <h1 className="text-page">{selected.title}</h1>
        <p className="text-lead measure">{selected.description}</p>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <caption className="sr-only">{selected.title}</caption>
          <tbody>
            {selected.rows.map((row) => (
              <tr key={row}>
                <td>{row}</td>
                <td>
                  <MutationButton role={role} adminOnly={section === "users"}>
                    {section === "orders" ? "Advance state" : "Edit"}
                  </MutationButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {section === "catalog/drops" && (
        <div className="admin-actions">
          <MutationButton role={role}>Create drop</MutationButton>
          <MutationButton role={role}>Publish</MutationButton>
          <MutationButton role={role}>Close</MutationButton>
          <MutationButton role={role}>Retire</MutationButton>
        </div>
      )}
      {section === "content/building" || section === "content/policies" ? (
        <div className="admin-actions">
          <MutationButton role={role}>Create draft</MutationButton>
          <MutationButton role={role}>Publish</MutationButton>
        </div>
      ) : null}
      <Alert title="Development fixture">
        All records and mutations on this admin preview are fictional.
      </Alert>
    </div>
  );
}

export function AdminPage({
  section = "",
  demo = false,
}: {
  section?: string;
  demo?: boolean;
}) {
  const router = useRouter();
  const [session, setSession] = useState<DemoSession | null | undefined>();
  useEffect(() => setSession(readSession()), []);
  if (!demo) return <AdminLoginPage />;
  if (session === undefined)
    return (
      <main className="admin-login-page">
        <LoadingState label="Checking staff session…" />
      </main>
    );
  if (!session || session.expiresAt <= Date.now()) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-panel">
          <h1 className="text-page">Staff access required.</h1>
          <p>Your fictional session is missing or expired.</p>
          <Link className="button button-primary" href="/preview/admin/login">
            Sign in
          </Link>
        </div>
      </main>
    );
  }
  const base = "/preview/admin";
  const refresh = () => {
    const next = { ...session, expiresAt: Date.now() + 15 * 60 * 1000 };
    sessionStorage.setItem(sessionKey, JSON.stringify(next));
    setSession(next);
  };
  const logout = () => {
    sessionStorage.removeItem(sessionKey);
    router.push("/preview/admin/login");
  };
  return (
    <main id="main" className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href={base}>
          Offmark admin
        </Link>
        <p className="text-metadata">Role: {session.role}</p>
        <nav aria-label="Admin navigation">
          {navigation.map(([href, label]) => (
            <Link
              key={href}
              href={`${base}${href ? `/${href}` : ""}`}
              aria-current={section === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="admin-session-actions">
          <Button
            type="button"
            variant="outline"
            size="compact"
            onClick={refresh}
          >
            Refresh session
          </Button>
          <Button type="button" variant="link" size="compact" onClick={logout}>
            Sign out
          </Button>
        </div>
      </aside>
      <section className="admin-main">
        <AdminContent section={section} role={session.role} />
      </section>
    </main>
  );
}
