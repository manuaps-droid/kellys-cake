"use client";

import { useState } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/Button";

import UpdateCustomerModal from "./UpdateCustomerModal";
import DeleteCustomerButton from "./DeleteCustomerButton";

import type { AdminCustomer } from "../types/customer.type";

type Props = {
  customer: AdminCustomer;
};

export default function CustomerActions({ customer }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-end gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
        >
          <Link href={`/admin/clientes/${customer.id}`}>
            Ver detalle
          </Link>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
        >
          Actualización
        </Button>

        <DeleteCustomerButton
          customerId={customer.id}
          customerName={`${customer.nombre} ${customer.apellidos ?? ""}`}
        />
      </div>

      <UpdateCustomerModal
        customer={customer}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}