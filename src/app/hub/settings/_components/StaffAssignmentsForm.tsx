"use client";

import { useState, useEffect } from "react";
import { updateStaffAssignments } from "../actions";
import { UserPlus, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type Client = { id: string; companyName: string };
type UserWithAssignments = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  assignedClients: { client: { id: string; companyName: string } }[];
};

type StaffAssignmentsFormProps = {
  staffUsers: UserWithAssignments[];
  allClients: Client[];
};

export function StaffAssignmentsForm({
  staffUsers,
  allClients,
}: StaffAssignmentsFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (staffId: string, clientIds: string[]) => {
    setPending(staffId);
    setError(null);
    const result = await updateStaffAssignments(staffId, clientIds);
    setPending(null);
    if (result.error) setError(result.error);
    else setExpandedId(null);
  };

  if (staffUsers.length === 0) {
    return (
      <p className="text-sm text-(--hub-muted)">
        No staff users. Create STAFF users in Supabase and assign clients here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}
      {staffUsers.map((user) => (
        <StaffRow
          key={user.id}
          user={user}
          allClients={allClients}
          isExpanded={expandedId === user.id}
          onToggle={() =>
            setExpandedId((id) => (id === user.id ? null : user.id))
          }
          onSave={(clientIds) => handleSave(user.id, clientIds)}
          isPending={pending === user.id}
        />
      ))}
    </div>
  );
}

function StaffRow({
  user,
  allClients,
  isExpanded,
  onToggle,
  onSave,
  isPending,
}: {
  user: UserWithAssignments;
  allClients: Client[];
  isExpanded: boolean;
  onToggle: () => void;
  onSave: (clientIds: string[]) => void;
  isPending: boolean;
}) {
  const assignedIds = new Set(user.assignedClients.map((a) => a.client.id));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(assignedIds);
  const assignedKey = [...assignedIds].sort().join(",");

  useEffect(() => {
    setSelectedIds(new Set(user.assignedClients.map((a) => a.client.id)));
  }, [assignedKey]);

  const handleToggleClient = (clientId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) next.delete(clientId);
      else next.add(clientId);
      return next;
    });
  };

  const handleSave = () => {
    onSave(Array.from(selectedIds));
  };

  const hasChanges =
    selectedIds.size !== assignedIds.size ||
    [...selectedIds].some((id) => !assignedIds.has(id));

  return (
    <div className="rounded-lg border border-(--hub-border-light) bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-black/[0.02]"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-(--hub-text)">
            {user.name ?? user.email}
          </span>
          <span className="text-sm text-(--hub-muted)">{user.email}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
            {user.assignedClients.length} client
            {user.assignedClients.length !== 1 ? "s" : ""} assigned
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-(--hub-muted)" />
        ) : (
          <ChevronDown className="h-4 w-4 text-(--hub-muted)" />
        )}
      </button>
      {isExpanded && (
        <div className="border-t border-(--hub-border-light) px-4 py-4">
          <p className="mb-3 text-sm text-(--hub-muted)">
            Select clients this staff member can access:
          </p>
          <div className="mb-4 max-h-48 overflow-y-auto rounded-lg border border-(--hub-border-light) p-3">
            <div className="space-y-2">
              {allClients.map((client) => (
                <label
                  key={client.id}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.has(client.id)}
                    onChange={() => handleToggleClient(client.id)}
                    className="rounded border-(--hub-border-light) text-(--primary) focus:ring-(--primary)"
                  />
                  <span className="text-(--hub-text)">
                    {client.companyName}
                  </span>
                </label>
              ))}
              {allClients.length === 0 && (
                <p className="text-sm text-(--hub-muted)">
                  No clients. Create clients first.
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-(--primary) px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Save assignments
            </button>
            {hasChanges && (
              <span className="text-sm text-amber-600">
                Unsaved changes
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
