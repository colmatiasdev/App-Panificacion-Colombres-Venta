// ========== doPost: create / update / delete (menú, etc.) ==========
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);

    var sheetName = (data.sheetName || "menu-toro-rapido-web").trim();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return jsonOut({ result: "error", error: "Hoja no encontrada: " + sheetName });

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var action = (data.action || "create").toLowerCase();

    if (action === "delete") {
      if (!data.idproducto) return jsonOut({ result: "error", error: "Falta idproducto" });
      var rowIndex = findRowById(sheet, headers, data.idproducto);
      if (rowIndex === -1) return jsonOut({ result: "error", error: "ID no encontrado" });
      var habilitadoCol = findHeaderIndex(headers, "habilitado");
      if (habilitadoCol === -1) return jsonOut({ result: "error", error: "No existe columna habilitado" });
      sheet.getRange(rowIndex, habilitadoCol + 1).setValue("NO");
      return jsonOut({ result: "success" });
    }

    if (action === "update") {
      if (!data.idproducto) return jsonOut({ result: "error", error: "Falta idproducto" });
      var rowIndex = findRowById(sheet, headers, data.idproducto);
      if (rowIndex === -1) return jsonOut({ result: "error", error: "ID no encontrado" });
      headers.forEach(function (h, idx) {
        var key = findKeyInsensitive(data, h);
        if (key !== null) {
          sheet.getRange(rowIndex, idx + 1).setValue(data[key]);
        }
      });
      return jsonOut({ result: "success" });
    }

    // CREATE
    var row = headers.map(function (h) {
      var key = findKeyInsensitive(data, h);
      return key !== null ? data[key] : "";
    });
    sheet.appendRow(row);
    return jsonOut({ result: "success" });

  } catch (err) {
    return jsonOut({ result: "error", error: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

// ========== doGet: listar cualquier hoja por nombre (menú, HORARIO-TORO-RAPIDO, FERIADO-TORO-RAPIDO) ==========
// Parámetros: sheetName (obligatorio). Ejemplo: ?sheetName=HORARIO-TORO-RAPIDO o ?sheetName=FERIADO-TORO-RAPIDO
// Respuesta OK: { headers: [...], rows: [[...], ...] }
// Respuesta error: { result: "error", error: "..." } — el index también reconoce data.error para ocultar "Cargando horarios..."
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = (e.parameter.sheetName || "menu-toro-rapido-web").trim();
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) return jsonOut({ result: "error", error: "Hoja no encontrada: " + sheetName });

    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var lastRow = sheet.getLastRow();
    // Corregido: antes era lastRow - 1 y se perdía la última fila de datos
    var rows = lastRow > 1
      ? sheet.getRange(2, 1, lastRow, sheet.getLastColumn()).getValues()
      : [];

    return jsonOut({ headers: headers, rows: rows });
  } catch (err) {
    return jsonOut({ result: "error", error: err.toString() });
  }
}

function findRowById(sheet, headers, idProducto) {
  var idCol = findHeaderIndex(headers, "idproducto") + 1;
  if (idCol <= 0) return -1;
  var values = sheet.getRange(2, idCol, sheet.getLastRow(), idCol).getValues();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(idProducto).trim()) {
      return i + 2;
    }
  }
  return -1;
}

function findHeaderIndex(headers, name) {
  var target = normalize(name);
  for (var i = 0; i < headers.length; i++) {
    if (normalize(headers[i]) === target) return i;
  }
  return -1;
}

function findKeyInsensitive(obj, key) {
  var target = normalize(key);
  for (var k in obj) {
    if (normalize(k) === target) return k;
  }
  return null;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
