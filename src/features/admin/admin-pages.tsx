"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Alert, LoadingState } from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";
import type { ClientDataConfiguration } from "@/data/client-config";
import {
  AdminHttpClient,
  type StaffRole,
  type StaffUser,
} from "@/data/http/admin-source";
import { DataSourceError } from "@/domain/errors";

type DemoSession = { role: StaffRole; expiresAt: number };
const demoSessionKey = "offmark-admin-demo-session";
const liveUserKey = "offmark-admin-user";

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

function readDemoSession(): DemoSession | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(demoSessionKey) ?? "null",
    ) as Partial<DemoSession> | null;
    return value &&
      (value.role === "admin" || value.role === "staff") &&
      typeof value.expiresAt === "number"
      ? (value as DemoSession)
      : null;
  } catch {
    return null;
  }
}

function readLiveUser(): StaffUser | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(liveUserKey) ?? "null",
    ) as Partial<StaffUser> | null;
    return value &&
      typeof value.id === "string" &&
      typeof value.email === "string" &&
      (value.role === "admin" || value.role === "staff")
      ? (value as StaffUser)
      : null;
  } catch {
    return null;
  }
}

function messageFor(error: unknown) {
  if (!(error instanceof DataSourceError))
    return "The admin request could not be completed.";
  return error.requestId
    ? `${error.message} Request ID: ${error.requestId}`
    : error.message;
}

export function AdminLoginPage({
  configuration,
}: {
  configuration: ClientDataConfiguration;
}) {
  const router = useRouter();
  const demo = configuration.mode === "demo";
  const live = configuration.mode === "live";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("staff");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      if (demo) {
        if (email !== "staff@offmark.test" || password !== "preview-only") {
          setMessage("The fictional credentials are invalid.");
          return;
        }
        sessionStorage.setItem(
          demoSessionKey,
          JSON.stringify({ role, expiresAt: Date.now() + 15 * 60 * 1000 }),
        );
        router.push("/preview/admin");
        return;
      }
      if (configuration.mode !== "live") return;
      const response = await new AdminHttpClient(configuration.apiOrigin).login(
        email,
        password,
      );
      sessionStorage.setItem(liveUserKey, JSON.stringify(response.user));
      router.push("/admin");
    } catch (error) {
      setMessage(messageFor(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main id="main" className="admin-login-page">
      <div className="admin-login-panel">
        <p className="eyebrow">Offmark staff</p>
        <h1 className="text-page">Admin sign in</h1>
        {!demo && !live && (
          <Alert title="Admin unavailable">
            Set the site data mode and API origin to enable staff access.
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
            disabled={!demo && !live}
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
            disabled={!demo && !live}
          />
          {demo && (
            <fieldset className="admin-role-choice">
              <legend className="text-label">Preview role</legend>
              <label>
                <input
                  type="radio"
                  name="role"
                  checked={role === "staff"}
                  onChange={() => setRole("staff")}
                />{" "}
                Staff
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
          <Button type="submit" disabled={(!demo && !live) || submitting}>
            {submitting ? "Signing in…" : "Sign in"}
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

const demoContent: Record<
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
    rows: ["Sample Wrap Shirt · ₦48,500", "Sample Panel Trousers · ₦56,500"],
  },
  services: {
    title: "Service availability",
    description: "Manage confirmed service status and destinations.",
    rows: ["Seam · In development", "Marketplace · In development"],
  },
  "content/building": {
    title: "Building updates",
    description: "Draft, preview and publish evidence-backed updates.",
    rows: ["Sample milestone · Published", "Sample workflow · Published"],
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
    rows: ["staff@offmark.test · Admin", "team@offmark.test · Staff"],
  },
};

function DemoAdminContent({
  section,
  role,
}: {
  section: string;
  role: StaffRole;
}) {
  const [message, setMessage] = useState("");
  if (section === "users" && role !== "admin") {
    return (
      <Alert title="Forbidden" tone="error">
        Staff user management requires the admin role.
      </Alert>
    );
  }
  const selected = demoContent[section] ?? demoContent[""];
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
                  <Button
                    type="button"
                    size="compact"
                    variant="outline"
                    onClick={() =>
                      setMessage(
                        "Simulated mutation complete. No record changed.",
                      )
                    }
                  >
                    Edit
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message && <output className="text-metadata">{message}</output>}
      <Alert title="Development fixture">
        All records and mutations on this admin preview are fictional.
      </Alert>
    </div>
  );
}

type MutationDefinition = {
  label: string;
  method: "POST" | "PATCH";
  path: string;
  needsId?: boolean;
  example: Record<string, unknown>;
};

const mutations: Record<string, MutationDefinition[]> = {
  "catalog/drops": [
    {
      label: "Create",
      method: "POST",
      path: "admin/drops",
      example: {
        slug: "",
        name: "",
        story: "",
        campaignImage: { src: "", alt: "", width: 1, height: 1 },
      },
    },
    {
      label: "Edit",
      method: "PATCH",
      path: "admin/drops/:id",
      needsId: true,
      example: { name: "" },
    },
    {
      label: "Publish",
      method: "POST",
      path: "admin/drops/:id/publish",
      needsId: true,
      example: {},
    },
    {
      label: "Close",
      method: "POST",
      path: "admin/drops/:id/close",
      needsId: true,
      example: { closesAt: new Date().toISOString() },
    },
    {
      label: "Retire",
      method: "POST",
      path: "admin/drops/:id/retire",
      needsId: true,
      example: {},
    },
  ],
  "catalog/designs": [
    {
      label: "Create design",
      method: "POST",
      path: "admin/designs",
      example: {
        dropId: "",
        slug: "",
        name: "",
        description: "",
        priceMinor: 1,
        materials: "",
        fit: "",
        care: "",
        estimatedDispatchText: "",
      },
    },
    {
      label: "Edit design",
      method: "PATCH",
      path: "admin/designs/:id",
      needsId: true,
      example: { name: "" },
    },
    {
      label: "Create variant",
      method: "POST",
      path: "admin/designs/variants",
      example: { designId: "", size: "", colour: "", available: true },
    },
    {
      label: "Edit variant",
      method: "PATCH",
      path: "admin/designs/variants/:id",
      needsId: true,
      example: { available: true },
    },
  ],
  services: [
    {
      label: "Edit",
      method: "PATCH",
      path: "admin/services/:id",
      needsId: true,
      example: { availability: "in_development", destination: null },
    },
  ],
  "content/building": [
    {
      label: "Create draft",
      method: "POST",
      path: "admin/build-updates",
      example: {
        slug: "",
        product: "",
        title: "",
        summary: "",
        body: "",
        kind: "work_in_progress",
      },
    },
    {
      label: "Edit",
      method: "PATCH",
      path: "admin/build-updates/:id",
      needsId: true,
      example: { title: "" },
    },
    {
      label: "Publish",
      method: "POST",
      path: "admin/build-updates/:id/publish",
      needsId: true,
      example: {},
    },
  ],
  "content/policies": [
    {
      label: "Create draft",
      method: "POST",
      path: "admin/policies",
      example: {
        slug: "",
        title: "",
        version: "",
        effectiveAt: new Date().toISOString(),
        body: "",
      },
    },
    {
      label: "Edit",
      method: "PATCH",
      path: "admin/policies/:id",
      needsId: true,
      example: { title: "" },
    },
    {
      label: "Publish",
      method: "POST",
      path: "admin/policies/:id/publish",
      needsId: true,
      example: {},
    },
  ],
  orders: [
    {
      label: "Advance fulfillment",
      method: "POST",
      path: "admin/orders/:id/fulfill",
      needsId: true,
      example: { targetState: "in_production", detail: "" },
    },
  ],
  users: [
    {
      label: "Create staff user",
      method: "POST",
      path: "admin/users",
      example: { email: "", password: "", role: "staff" },
    },
    {
      label: "Change role",
      method: "PATCH",
      path: "admin/users/:id",
      needsId: true,
      example: { role: "staff" },
    },
  ],
};

function asRows(payload: unknown): Record<string, unknown>[] {
  const value =
    payload && typeof payload === "object" && "data" in payload
      ? (payload as { data?: unknown }).data
      : payload;
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object",
      )
    : [];
}

function recordLabel(record: Record<string, unknown>) {
  const primary =
    record.name ??
    record.title ??
    record.email ??
    record.reference ??
    record.slug ??
    record.id;
  const state =
    record.status ??
    record.availability ??
    record.fulfillmentState ??
    record.role;
  return [primary, state].filter(Boolean).join(" · ") || "Unnamed record";
}

function LiveAdminContent({
  section,
  role,
  client,
  currentUserId,
}: {
  section: string;
  role: StaffRole;
  client: AdminHttpClient;
  currentUserId: string;
}) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const definitions = useMemo(() => mutations[section] ?? [], [section]);
  const [actionIndex, setActionIndex] = useState(0);
  const action = definitions[actionIndex];
  const [recordId, setRecordId] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<unknown>();
  const [body, setBody] = useState("{}");
  const [submitting, setSubmitting] = useState(false);
  const [paymentState, setPaymentState] = useState("");
  const [fulfillmentState, setFulfillmentState] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setRows(
        asRows(
          await client.list(section, {
            paymentState,
            fulfillmentState,
          }),
        ),
      );
    } catch (loadError) {
      setError(messageFor(loadError));
    } finally {
      setLoading(false);
    }
  }, [client, fulfillmentState, paymentState, section]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setActionIndex(0);
    setBody(JSON.stringify(definitions[0]?.example ?? {}, null, 2));
    setRecordId("");
    setSelectedRecord(undefined);
    setResult("");
  }, [definitions]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!action) return;
    if (
      section === "users" &&
      action.label === "Change role" &&
      recordId === currentUserId
    ) {
      setError("Sign in as another admin to change your own role.");
      return;
    }
    if (
      [
        "Publish",
        "Close",
        "Retire",
        "Advance fulfillment",
        "Change role",
      ].includes(action.label) &&
      !window.confirm(`Confirm action: ${action.label}?`)
    ) {
      return;
    }
    setError("");
    setResult("");
    setSubmitting(true);
    try {
      const payload = body.trim() ? (JSON.parse(body) as unknown) : undefined;
      const path = action.path.replace(":id", encodeURIComponent(recordId));
      await client.mutate(path, action.method, payload);
      setResult(`${action.label} completed.`);
      await load();
    } catch (mutationError) {
      setError(
        mutationError instanceof SyntaxError
          ? "The request body must be valid JSON."
          : messageFor(mutationError),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const selectRecord = async (id: string, row: Record<string, unknown>) => {
    setRecordId(id);
    setSelectedRecord(row);
    if (section !== "orders" || !id) return;
    setError("");
    try {
      setSelectedRecord(await client.getOrder(id));
    } catch (detailError) {
      setError(messageFor(detailError));
    }
  };

  if (section === "users" && role !== "admin") {
    return (
      <Alert title="Forbidden" tone="error">
        Staff user management requires the admin role.
      </Alert>
    );
  }

  const selected = demoContent[section] ?? demoContent[""];
  return (
    <div className="admin-content">
      <div>
        <p className="eyebrow">Admin dashboard</p>
        <h1 className="text-page">{selected.title}</h1>
        <p className="text-lead measure">{selected.description}</p>
      </div>
      {section === "orders" && (
        <fieldset className="admin-actions admin-order-filters">
          <legend className="sr-only">Order filters</legend>
          <label className="field">
            <span className="text-label">Payment state</span>
            <select
              value={paymentState}
              onChange={(event) => setPaymentState(event.target.value)}
            >
              <option value="">All</option>
              {["pending", "paid", "failed", "refunded"].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="text-label">Fulfillment state</span>
            <select
              value={fulfillmentState}
              onChange={(event) => setFulfillmentState(event.target.value)}
            >
              <option value="">All</option>
              {[
                "awaiting_production",
                "in_production",
                "quality_check",
                "dispatched",
                "delivered",
                "cancelled",
              ].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </fieldset>
      )}
      {loading ? (
        <LoadingState label="Loading admin records…" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <caption className="sr-only">{selected.title}</caption>
            <tbody>
              {rows.map((row, index) => {
                const id = String(row.reference ?? row.id ?? "");
                return (
                  <tr key={id || `${recordLabel(row)}-${index}`}>
                    <td>{recordLabel(row)}</td>
                    <td>
                      <Button
                        type="button"
                        size="compact"
                        variant="outline"
                        onClick={() => void selectRecord(id, row)}
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td>No records returned.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {selectedRecord !== undefined && (
        <details className="admin-record-detail" open={section === "orders"}>
          <summary className="text-label">Selected record details</summary>
          <pre>{JSON.stringify(selectedRecord, null, 2)}</pre>
        </details>
      )}
      {definitions.length > 0 && (
        <form className="submission-form admin-editor" onSubmit={submit}>
          <label className="field">
            <span className="text-label">Action</span>
            <select
              value={actionIndex}
              onChange={(event) => {
                const index = Number(event.target.value);
                setActionIndex(index);
                setBody(
                  JSON.stringify(definitions[index]?.example ?? {}, null, 2),
                );
              }}
            >
              {definitions.map((definition, index) => (
                <option key={definition.label} value={index}>
                  {definition.label}
                </option>
              ))}
            </select>
          </label>
          {action?.needsId && (
            <Field
              label={section === "orders" ? "Order reference" : "Record ID"}
              value={recordId}
              onChange={(event) => setRecordId(event.target.value)}
              required
            />
          )}
          <label className="field">
            <span className="text-label">JSON request body</span>
            <textarea
              rows={10}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              spellCheck={false}
            />
          </label>
          <Button
            type="submit"
            disabled={submitting || (action?.needsId && !recordId)}
          >
            {submitting ? "Saving…" : (action?.label ?? "Save")}
          </Button>
        </form>
      )}
      {error && (
        <Alert title="Request failed" tone="error">
          {error}
        </Alert>
      )}
      {result && <Alert title="Saved">{result}</Alert>}
    </div>
  );
}

export function AdminPage({
  section = "",
  configuration,
}: {
  section?: string;
  configuration: ClientDataConfiguration;
}) {
  const router = useRouter();
  const demo = configuration.mode === "demo";
  const base = demo ? "/preview/admin" : "/admin";
  const client = useMemo(
    () =>
      configuration.mode === "live"
        ? new AdminHttpClient(configuration.apiOrigin)
        : null,
    [configuration],
  );
  const [role, setRole] = useState<StaffRole | null>();
  const [currentUserId, setCurrentUserId] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (demo) {
      const session = readDemoSession();
      setRole(session && session.expiresAt > Date.now() ? session.role : null);
      setCurrentUserId("");
      return;
    }
    if (!client) {
      setRole(null);
      return;
    }
    const user = readLiveUser();
    if (!user) {
      setRole(null);
      return;
    }
    client
      .refresh()
      .then(() => {
        setCurrentUserId(user.id);
        setRole(user.role);
      })
      .catch((error) => {
        sessionStorage.removeItem(liveUserKey);
        setAuthError(messageFor(error));
        setRole(null);
      });
  }, [client, demo]);

  if (role === undefined) {
    return (
      <main className="admin-login-page">
        <LoadingState label="Checking staff session…" />
      </main>
    );
  }
  if (!role) {
    return (
      <main className="admin-login-page">
        <div className="admin-login-panel">
          <h1 className="text-page">Staff access required.</h1>
          <p>{authError || "Your staff session is missing or expired."}</p>
          <Link className="button button-primary" href={`${base}/login`}>
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const refresh = async () => {
    if (demo) {
      sessionStorage.setItem(
        demoSessionKey,
        JSON.stringify({ role, expiresAt: Date.now() + 15 * 60 * 1000 }),
      );
      return;
    }
    try {
      await client?.refresh();
    } catch (error) {
      setAuthError(messageFor(error));
    }
  };
  const logout = async () => {
    if (demo) sessionStorage.removeItem(demoSessionKey);
    else {
      try {
        await client?.logout();
      } finally {
        sessionStorage.removeItem(liveUserKey);
      }
    }
    router.push(`${base}/login`);
  };

  return (
    <main id="main" className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-brand" href={base}>
          Offmark admin
        </Link>
        <p className="text-metadata">Role: {role}</p>
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
        {demo ? (
          <DemoAdminContent section={section} role={role} />
        ) : client ? (
          <LiveAdminContent
            section={section}
            role={role}
            client={client}
            currentUserId={currentUserId}
          />
        ) : (
          <Alert title="Admin unavailable">
            Set a live API origin to use the admin.
          </Alert>
        )}
      </section>
    </main>
  );
}
