import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
const archiver = require("archiver") as any;

async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: cliente } = await supabase
    .from("clientes")
    .select("rol, activo")
    .eq("user_id", user.id)
    .maybeSingle();

  return Boolean(
    cliente?.activo && cliente.rol === "admin"
  );
}

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

const TABLES: Array<{ name: string; sql: string; orderby: string }> = [
  {
    name: "clientes",
    sql: "*",
    orderby: "created_at",
  },
  {
    name: "proyectos_personalizados",
    sql: "*",
    orderby: "created_at",
  },
  {
    name: "proyecto_catalogos",
    sql: "*",
    orderby: "id",
  },
  {
    name: "proyecto_imagenes",
    sql: "*, media(url, nombre)",
    orderby: "id",
  },
  {
    name: "catalogo_personalizacion",
    sql: "*",
    orderby: "orden",
  },
  {
    name: "media",
    sql: "*",
    orderby: "created_at",
  },
  {
    name: "foodos_productos",
    sql: "*",
    orderby: "created_at",
  },
  {
    name: "producto_catalogo",
    sql: "*",
    orderby: "id",
  },
];

const PAGE_SIZE = 500;

export async function GET(request: NextRequest) {
  // El request se usa solo para validar admin; el body no se consume.
  void request;
  if (!(await isAdmin())) {
    return NextResponse.json(
      { success: false, message: "No autorizado." },
      { status: 401 }
    );
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const supabase = createAdminClient();

  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `kellys-cake-export-${dateStr}.zip`;

  const encoder = new TextEncoder();

  // Use the Web Streams API to stream the ZIP without buffering it
  // entirely in memory, so thousands of records don't OOM the route.
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const archive = archiver("zip", { zlib: { level: 6 } });

        archive.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        archive.on("warning", (err: Error) => console.warn("zip warn", err));
        archive.on("error", (err: Error) => {
          console.error("zip error", err);
          controller.error(err);
        });
        archive.on("end", () => controller.close());

        for (const t of TABLES) {
          let from = 0;
          const buffers: string[] = [];
          let headersEmitted = false;

          while (true) {
            const { data, error } = await supabase
              .from(t.name)
              .select(t.sql)
              .order(t.orderby)
              .range(from, from + PAGE_SIZE - 1);

            if (error) {
              console.error(`Export ${t.name} error:`, error);
              break;
            }

            const rows = (data ?? []) as unknown as Array<Record<string, unknown>>;

            if (rows.length === 0) {
              if (!headersEmitted) {
                // empty: emit empty file
                archive.append("", { name: `${t.name}.csv` });
              }
              break;
            }

            if (!headersEmitted) {
              const headers = Object.keys(rows[0]);
              buffers.push(headers.join(",") + "\n");
              headersEmitted = true;
            }

            buffers.push(
              rows
                .map((r) =>
                  Object.keys(r)
                    .map((h) => esc(r[h]))
                    .join(",")
                )
                .join("\n") + "\n"
            );

            if (rows.length < PAGE_SIZE) break;
            from += PAGE_SIZE;
          }

          const csv = buffers.join("");
          archive.append(encoder.encode(csv), { name: `${t.name}.csv` });
        }

        archive.finalize();
      } catch (err) {
        console.error("Export stream error:", err);
        controller.error(err instanceof Error ? err : new Error(String(err)));
      }
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

