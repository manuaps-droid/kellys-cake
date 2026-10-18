# Agente sincronizador Contapro → FoodOS

Conecta tu sistema contable Contapro con FoodOS de forma automática:
el agente vigila una carpeta de tu PC, toma los reportes Excel/CSV que
Contapro exporta y los envía directo al panel (rentabilidad y KPIs) sin
que tengas que subir nada a mano.

## Instalación (una sola vez, en la PC donde usas Contapro)

1. Copia la carpeta `scripts/contapro-sync` de este proyecto a tu PC,
   por ejemplo a `C:\Contapro\sync`.
2. Instala [Node.js](https://nodejs.org) (versión LTS) si no lo tienes.
3. Abre una terminal (CMD/PowerShell) en esa carpeta y ejecuta:

   ```
   npm install
   ```

4. Copia `config.example.json` como `config.json` y complétalo:

   | Campo | Valor |
   |---|---|
   | `endpoint` | `https://kellyscake.pe/api/contapro/sync` (ya viene) |
   | `secret` | Tu `CONTAPRO_SYNC_SECRET` (el mismo que está en Vercel) |
   | `carpeta` | La carpeta donde exportas los reportes de Contapro, ej: `C:\\Contapro\\exportaciones` |
   | `meses_atras` | Cuántos meses hacia atrás sincronizar (por defecto 3) |

5. Crea la carpeta que pusiste en `carpeta` y exporta de Contapro tus
   reportes de compras y ventas ahí.

## Uso manual (probar que todo funciona)

```
node sincronizar.cjs
```

Verás `✓` por cada archivo sincronizado y el archivo quedará movido a la
subcarpeta `procesados` (así no se vuelve a importar).

## Reglas de los archivos

- Formatos aceptados: `.xlsx` y `.csv`
- El **nombre del archivo** debe contener `compra` o `venta`
  (ej: `registro-compras-octubre.xlsx`, `ventas-2026-10.xlsx`).
- Si el mismo archivo se sincroniza dos veces, FoodOS lo detecta y lo
  **omite automáticamente** (no duplica datos).

## Automático diario (Programador de tareas de Windows)

Ejecuta una sola vez en CMD como administrador (ajusta la ruta a donde
copiaste la carpeta):

```
schtasks /Create /SC DAILY /ST 09:30 /TN "FoodOS Contapro" /TR "node C:\Contapro\sync\sincronizar.cjs"
```

Desde ese momento, cada mañana a las 9:30 los reportes nuevos llegan
solas a FoodOS. Para desactivarlo:
`schtasks /Delete /TN "FoodOS Contapro"`.

## Seguridad

- La comunicación viaja por HTTPS y está firmada con tu
  `CONTAPRO_SYNC_SECRET`: sin esa clave nadie puede inyectar datos.
- El panel de FoodOS (Admin → Contapro) sigue disponible para importes
  manuales cuando lo necesites.
