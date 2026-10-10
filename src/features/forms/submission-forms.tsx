"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";
import { DemoDataSource } from "@/data/demo/source";
import type { SubmissionScenario } from "@/data/demo/submission-scenarios";
import { DataSourceError } from "@/domain/errors";

type FormMode = "demo" | "unavailable";

function errorMessage(error: unknown) {
  if (error instanceof DataSourceError) return error.message;
  return "The simulated submission failed. Try again.";
}

export function WaitlistForm({
  serviceId,
  mode,
  scenario = "success",
}: {
  serviceId: string;
  mode: FormMode;
  scenario?: SubmissionScenario;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const unavailable = mode === "unavailable";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (unavailable || !consent) return;
    setState("submitting");
    setMessage("");
    try {
      await new DemoDataSource(scenario).joinWaitlist({
        email,
        serviceId,
        consent: true,
      });
      setState("success");
      setMessage(
        "Simulated signup complete. No subscription or email was created.",
      );
    } catch (error) {
      setState("error");
      setMessage(errorMessage(error));
    }
  };

  return (
    <form className="submission-form" onSubmit={submit}>
      <Field
        label="Email address"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
        disabled={unavailable || state === "submitting"}
        helper={
          unavailable
            ? "A waitlist destination has not been confirmed."
            : "Development preview: use a fictional email address."
        }
      />
      <label className="submission-consent">
        <input
          type="checkbox"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
          required
          disabled={unavailable || state === "submitting"}
        />
        <span>I agree to receive availability updates for this service.</span>
      </label>
      <Button
        type="submit"
        loading={state === "submitting"}
        disabled={unavailable || !consent}
      >
        Join waitlist
      </Button>
      {message && (
        <Alert
          title={state === "success" ? "Preview complete" : "Unable to submit"}
          tone={state === "success" ? "success" : "error"}
        >
          {message}
        </Alert>
      )}
    </form>
  );
}

export function ContactForm({
  mode,
  scenario = "success",
}: {
  mode: FormMode;
  scenario?: SubmissionScenario;
}) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [state, setState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const unavailable = mode === "unavailable";
  const update = (field: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (unavailable) return;
    setState("submitting");
    setMessage("");
    try {
      await new DemoDataSource(scenario).sendContact(values);
      setState("success");
      setMessage("Simulated enquiry complete. No message or email was sent.");
    } catch (error) {
      setState("error");
      setMessage(errorMessage(error));
    }
  };

  return (
    <form className="submission-form" onSubmit={submit}>
      <div className="submission-form-grid">
        <Field
          label="Name"
          value={values.name}
          onChange={(event) => update("name", event.target.value)}
          autoComplete="name"
          required
          disabled={unavailable || state === "submitting"}
        />
        <Field
          label="Email address"
          type="email"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          autoComplete="email"
          required
          disabled={unavailable || state === "submitting"}
        />
      </div>
      <Field
        label="Subject"
        value={values.subject}
        onChange={(event) => update("subject", event.target.value)}
        required
        disabled={unavailable || state === "submitting"}
      />
      <div className="field">
        <label htmlFor="contact-message" className="text-label">
          Message *
        </label>
        <textarea
          id="contact-message"
          className="field-input submission-textarea"
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          required
          disabled={unavailable || state === "submitting"}
        />
        <p className="field-helper">
          {unavailable
            ? "A verified contact destination has not been connected."
            : "Development preview: this message remains in your browser."}
        </p>
      </div>
      <Button
        type="submit"
        loading={state === "submitting"}
        disabled={unavailable}
      >
        Send enquiry
      </Button>
      {message && (
        <Alert
          title={state === "success" ? "Preview complete" : "Unable to submit"}
          tone={state === "success" ? "success" : "error"}
        >
          {message}
        </Alert>
      )}
    </form>
  );
}
