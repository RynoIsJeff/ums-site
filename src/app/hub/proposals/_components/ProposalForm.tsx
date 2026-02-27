"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ProposalFormState } from "../actions";
import { Input, Select } from "@/app/hub/_components/form";

type Client = { id: string; companyName: string };

type ProposalFormProps = {
  clients: Client[];
  action: (prev: ProposalFormState, formData: FormData) => Promise<ProposalFormState>;
  initialState?: ProposalFormState;
  defaultValues?: { clientId?: string; title?: string; content?: string };
  submitLabel: string;
  backHref: string;
};

export function ProposalForm({
  clients,
  action,
  initialState = {},
  defaultValues,
  submitLabel,
  backHref,
}: ProposalFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const clientOptions = clients.map((c) => ({ value: c.id, label: c.companyName }));

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <Select
        id="clientId"
        name="clientId"
        label="Client"
        options={clientOptions}
        placeholder="Select client"
        defaultValue={defaultValues?.clientId ?? ""}
        required
      />
      <Input
        id="title"
        name="title"
        label="Title"
        type="text"
        placeholder="Proposal title"
        defaultValue={defaultValues?.title}
        required
      />
      <div>
        <label htmlFor="content" className="mb-1 block text-xs font-medium text-(--hub-muted)">
          Content
        </label>
        <textarea
          id="content"
          name="content"
          rows={12}
          className="w-full rounded-md border border-(--hub-border) bg-white px-3 py-2 text-(--hub-text) focus:outline-none focus:ring-2 focus:ring-(--primary)"
          placeholder="Proposal or contract content (markdown supported)"
          defaultValue={defaultValues?.content}
          required
        />
      </div>
      <div className="flex gap-3">
        <SubmitButton label={submitLabel} />
        <a
          href={backHref}
          className="rounded-md border border-(--hub-border) px-4 py-2 text-sm font-medium hover:bg-(--hub-bg)"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-(--primary) px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}
