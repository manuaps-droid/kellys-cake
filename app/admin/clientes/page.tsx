import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

import DataTableToolbar from "@/components/datatable/DataTableToolbar";
import DataTableSearch from "@/components/datatable/DataTableSearch";
import DataTablePagination from "@/components/datatable/DataTablePagination";

import { getCustomersAction } from "@/features/admin/customers/actions/get-customers.action";
import CustomersTable from "@/features/admin/customers/components/CustomersTable";

type Props = {
  searchParams: Promise<{
    search?: string;
    page?: string;
  }>;
};

export default async function AdminCustomersPage({
  searchParams,
}: Props) {
  const filters = await searchParams;

  const pageRaw = Number(filters.page);
  const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

  const result =
    await getCustomersAction({
      search: filters.search,
      page,
      perPage: 25,
    });

  if (!result.success) {
    return (
      <EmptyState
        title="Error"
        description={
          result.message ??
          "No se pudieron cargar los clientes."
        }
      />
    );
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Clientes"
        description="Gestiona los clientes registrados."
      />

      <DataTableToolbar>
        <DataTableSearch
          placeholder="Buscar cliente..."
        />
      </DataTableToolbar>

      <CustomersTable
        customers={result.customers}
      />

      <DataTablePagination
        total={result.total}
        perPage={result.perPage}
        page={page}
        entityLabel="clientes"
      />
    </section>
  );
}
