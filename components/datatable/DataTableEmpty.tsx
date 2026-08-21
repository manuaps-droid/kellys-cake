type DataTableEmptyProps = {
  title?: string;

  description?: string;

  colSpan: number;
};

export default function DataTableEmpty({
  title = "Sin resultados",
  description = "No existen registros para mostrar.",
  colSpan,
}: DataTableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-8 py-16 text-center"
      >
        <h3 className="text-lg font-semibold text-cake-espresso">
          {title}
        </h3>

        <p className="mt-2 text-gray-500">
          {description}
        </p>
      </td>
    </tr>
  );
}