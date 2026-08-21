import DataTablePagination from "@/components/datatable/DataTablePagination";

type Props = {
  total: number;
  perPage: number;
  page: number;
};

export default function OrdersPagination({
  total,
  perPage,
  page,
}: Props) {
  return (
    <DataTablePagination
      total={total}
      perPage={perPage}
      page={page}
      entityLabel="pedidos"
    />
  );
}
