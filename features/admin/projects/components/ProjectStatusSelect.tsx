"use client";

import { useTransition } from "react";

import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

import {
  PROJECT_STATUS,
  PROJECT_STATUS_LABEL,
} from "../constants/project-status";

import type { AdminProjectStatus } from "../types/project.type";

type Props = {
  projectId: string;
  value: AdminProjectStatus;
};

export default function ProjectStatusSelect({
  projectId,
  value,
}: Props) {
  const [pending, startTransition] =
    useTransition();

  async function handleChange(
    status: string
  ) {
    startTransition(async () => {
      const res = await fetch(
        `/api/admin/proyectos/${projectId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const result =
        await res.json();

      if (!result.success) {
        toast.error(
          result.message ??
            "No se pudo actualizar."
        );

        return;
      }

      toast.success(
        "Estado actualizado."
      );
    });
  }

  return (
    <Select
      defaultValue={value}
      onValueChange={handleChange}
      disabled={pending}
    >
      <SelectTrigger className="w-44">
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {Object.values(
          PROJECT_STATUS
        ).map((status) => (
          <SelectItem
            key={status}
            value={status}
          >
            {
              PROJECT_STATUS_LABEL[
                status
              ]
            }
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
