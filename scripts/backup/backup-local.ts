import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Cargar variables de .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están definidos.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Lista de tablas del ecosistema Kelly's Cake / FoodOS
const TABLES = [
  "productos",
  "catalogos",
  "pedidos",
  "pedido_items",
  "clientes",
  "cotizaciones",
  "cotizacion_items",
  "configuraciones",
  "dispositivos_autorizados",
  "libro_reclamaciones",
  "carrito",
  "carrito_items",
  "multimedia",
  "proyectos",
  "recetas",
  "ingredientes",
];

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const homeDir = process.env.USERPROFILE || process.env.HOME || "C:\\Users\\51958";
  const backupBaseDir = path.join(homeDir, "KellysCake_Backups");
  const currentBackupDir = path.join(backupBaseDir, `backup_${timestamp}`);

  if (!fs.existsSync(backupBaseDir)) {
    fs.mkdirSync(backupBaseDir, { recursive: true });
  }
  fs.mkdirSync(currentBackupDir, { recursive: true });

  console.log(`📦 Iniciando respaldo de Kelly's Cake...`);
  console.log(`📂 Carpeta destino: ${currentBackupDir}\n`);

  const summary: Record<string, { count: number; status: string }> = {};

  for (const table of TABLES) {
    try {
      const { data, error } = await supabase.from(table).select("*");
      if (error) {
        // La tabla puede no existir o no tener permisos
        summary[table] = { count: 0, status: `Ignorada (${error.message})` };
        continue;
      }

      const rowCount = data?.length ?? 0;
      const filePath = path.join(currentBackupDir, `${table}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data ?? [], null, 2), "utf-8");
      summary[table] = { count: rowCount, status: "OK" };
      console.log(`  ✓ Tabla [${table}]: ${rowCount} registros respaldados.`);
    } catch (err) {
      summary[table] = { count: 0, status: `Error: ${err instanceof Error ? err.message : String(err)}` };
    }
  }

  // Guardar manifiesto de respaldo
  const manifest = {
    fecha: new Date().toISOString(),
    origen: SUPABASE_URL,
    tablas: summary,
  };
  fs.writeFileSync(path.join(currentBackupDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");

  console.log(`\n🎉 ¡Copia de seguridad completada con éxito!`);
  console.log(`📁 Ubicación: ${currentBackupDir}`);
}

runBackup().catch((err) => {
  console.error("❌ Error inesperado durante el respaldo:", err);
  process.exit(1);
});
