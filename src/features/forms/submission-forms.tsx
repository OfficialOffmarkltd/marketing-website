"use client";

import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field } from "@/components/ui/field";
import type { ClientDataConfiguration } from "@/data/client-config";
import { createClientDataSource } from "@/data/client-source";
import { DataSourceError } from "@/domain/errors";

function errorMessage(error: unknown, demo: boolean) {
  if (error instanceof DataSourceError) return error.message;
  return demo
    ? "The simulated submission failed. Try again."
    : "The submission failed. Try again.";
}

export function WaitlistForm({
  serviceId,
  configuration,
}: {
  serviceId: string;
  configuration: ClientDataConfiguration;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const unavailable = configuration.mode === "public";
  const demo = configuration.mode === "demo";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (unavailable || !consent) return;
    setState("submitting");
    setMessage("");
    try {
      await createClientDataSource(configuration).joinWaitlist({
        email,
        serviceId,
        consent: true,
      });
      setState("success");
      setMessage(
        demo
          ? "Simulated signup complete. No subscription or email was created."
          : "You have joined the waitlist.",
      );
    } catch (error) {
      setState("error");
      setMessage(errorMessage(error, demo));
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
            : demo
              ? "Development preview: use a fictional email address."
              : "We will use this address only for service availability updates."
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
          title={
            state === "success"
              ? demo
                ? "Preview complete"
                : "Waitlist joined"
              : "Unable to submit"
          }
          tone={state === "success" ? "success" : "error"}
        >
          {message}
        </Alert>
      )}
    </form>
  );
}

export function ContactForm({
  configuration,
}: {
  configuration: ClientDataConfiguration;
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
  const unavailable = configuration.mode === "public";
  const demo = configuration.mode === "demo";
  const update = (field: keyof typeof values, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (unavailable) return;
    setState("submitting");
    setMessage("");
    try {
      await createClientDataSource(configuration).sendContact(values);
      setState("success");
      setMessage(
        demo
          ? "Simulated enquiry complete. No message or email was sent."
          : "Your enquiry has been received.",
      );
    } catch (error) {
      setState("error");
      setMessage(errorMessage(error, demo));
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
            : demo
              ? "Development preview: this message remains in your browser."
              : "Your enquiry will be sent to the Offmark team."}
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
          title={
            state === "success"
              ? demo
                ? "Preview complete"
                : "Enquiry received"
              : "Unable to submit"
          }
          tone={state === "success" ? "success" : "error"}
        >
          {message}
        </Alert>
      )}
    </form>
  );
}
