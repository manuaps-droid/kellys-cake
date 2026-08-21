import PageHeader from "@/components/common/PageHeader";
import EmptyState from "@/components/common/EmptyState";

import DataTableToolbar from "@/components/datatable/DataTableToolbar";
import DataTableSearch from "@/components/datatable/DataTableSearch";

import { getOrdersAction } from "@/features/admin/orders/actions/get-orders.action";
import OrdersTable from "@/features/admin/orders/components/OrdersTable";
import OrdersPagination from "@/features/admin/orders/components/OrdersPagination";

type Props = {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function AdminOrdersPage({
  searchParams,
}: Props) {
  const filters =
    await searchParams;

  const pageRaw = Number(filters.page);
  const page = Number.isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

  const result =
    await getOrdersAction({
      search: filters.search,
      status: filters.status,
      page,
      perPage: 25,
    });

  if (!result.success) {
    return (
      <EmptyState
        title="Error"
        description={
          result.message ??
          "No se pudieron cargar los pedidos."
        }
      />
    );
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Pedidos"
        description="Gestiona los pedidos realizados por los clientes."
      />

      <DataTableToolbar>
        <DataTableSearch
          placeholder="Buscar pedido o cliente..."
        />
      </DataTableToolbar>

      <OrdersTable
        orders={result.orders}
      />

      <OrdersPagination
        total={result.total}
        perPage={result.perPage}
        page={page}
      />
    </section>
  );
}