# Apps Script: Horarios y Feriados (y menú)

Este script permite **listar** cualquier hoja del libro por nombre. Lo usa el **index** (horarios y próximo feriado) y puede usarlo el **módulo de Administración** para leer/editar horarios y feriados.

## Dónde pegar el código

1. Abrí tu **Google Sheet** (el que tiene las hojas HORARIO-TORO-RAPIDO y FERIADO-TORO-RAPIDO).
2. Menú **Extensiones** → **Apps Script**.
3. Si ya tenés un script para el menú: **agregá** la función `doGet` y `listSheetByName` (o fusioná la lógica de `listSheetByName` en tu script existente cuando reciba `action=list` y `sheetName=...`).
4. Si es script nuevo: pegá todo el código de abajo en `Code.gs`.
5. Guardá y **Implementar** → **Nueva implementación** → Tipo **Aplicación web**:
   - "Ejecutar como": Yo
   - "Quién tiene acceso": Cualquier persona
6. Copiá la **URL de la aplicación web** y usala en `config.js` como `appsScriptMenuUrl` (o la URL que use tu proyecto para leer hojas).

## Código (Code.gs)

```javascript
/**
 * Lista filas de una hoja por nombre.
 * Parámetros (query): action=list, sheetName=NombreDeLaHoja
 * Respuesta JSON: { headers: [...], rows: [[...], ...] }
 * Sirve para: HORARIO-TORO-RAPIDO, FERIADO-TORO-RAPIDO, y hojas del menú.
 */

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = (params.action || "").toString().trim().toLowerCase();
  const sheetName = (params.sheetName || "").toString().trim();

  let result = { error: true, message: "Parámetros insuficientes" };
  if (action === "list" && sheetName) {
    result = listSheetByName(sheetName);
  }

  const output = ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}

/**
 * Abre el libro. Si el script está vinculado al Sheet, usa getActiveSpreadsheet().
 * Si el script es independiente, reemplazá por openById("TU_SPREADSHEET_ID").
 */
function getLibro() {
  return SpreadsheetApp.getActiveSpreadsheet();
  // Si el script NO está vinculado al Sheet, descomentá y poné tu ID:
  // return SpreadsheetApp.openById("TU_SPREADSHEET_ID_AQUI");
}

/**
 * Devuelve { headers: array, rows: array de arrays } o { error: true, message: "..." }.
 */
function listSheetByName(sheetName) {
  try {
    const libro = getLibro();
    const hoja = libro.getSheetByName(sheetName);
    if (!hoja) {
      return { error: true, message: "No existe la hoja: " + sheetName };
    }

    const lastRow = hoja.getLastRow();
    const lastCol = hoja.getLastColumn();
    if (lastRow < 1 || lastCol < 1) {
      return { headers: [], rows: [] };
    }

    const range = hoja.getRange(1, 1, lastRow, lastCol);
    const values = range.getValues();

    const headers = (values[0] || []).map(function (cell) {
      return cell != null ? String(cell).trim() : "";
    });
    const rows = [];
    for (var i = 1; i < values.length; i++) {
      rows.push(values[i] || []);
    }

    return { headers: headers, rows: rows };
  } catch (err) {
    return { error: true, message: err.toString() };
  }
}
```

## Respuesta cuando hay error

Si la hoja no existe o falla algo, el script devuelve por ejemplo:

```json
{ "error": true, "message": "No existe la hoja: HORARIO-TORO-RAPIDO" }
```

El **index** ya está preparado: si no recibe datos válidos (o hay timeout), deja de mostrar "Cargando horarios..." y muestra el texto de respaldo.

## Módulo de Administración

- **Lectura:** El admin puede llamar a la misma URL con `action=list&sheetName=HORARIO-TORO-RAPIDO` o `sheetName=FERIADO-TORO-RAPIDO` para obtener los datos y mostrarlos en pantalla.
- **Edición:** Por ahora los horarios y feriados se editan **directamente en el Google Sheet**. Si más adelante querés que el admin los modifique desde la web, habría que agregar en este mismo script funciones que reciban `action=update` o `action=append` y escriban en la hoja (con permisos del usuario que ejecuta el script).

## Resumen de hojas que usa el proyecto

| Hoja                    | Uso                          |
|-------------------------|------------------------------|
| HORARIO-TORO-RAPIDO     | Horario regular por día      |
| FERIADO-TORO-RAPIDO     | Próximo feriado y si se atiende |
| (Menú simple/compuesto) | Si usás el mismo script, mismo parámetro `sheetName` |
