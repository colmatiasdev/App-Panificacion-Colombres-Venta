# Instalación del proyecto Panificación Colombres

Guía paso a paso para poner en marcha el sitio de pedidos con menú desde Google Sheets.

## 1. Obtener el código

- **Git:** `git clone <url-del-repositorio>`
- O descargar el ZIP del repositorio y descomprimirlo.

## 2. Google Sheet y hojas

1. Creá un libro en [Google Sheets](https://sheets.google.com) (o usá uno existente).
2. Creá las pestañas (hojas) con los nombres que vas a usar en `config.js`:
   - Menú simple: ej. `menu-toro-rapido-web-simple`
   - Menú compuesto: ej. `menu-toro-rapido-web-compuesto`
   - Detalle menú compuesto: ej. `menu-compuesto-detalle`
   - Opciones por producto: ej. `menu-opciones`
   - Horarios: ej. `HORARIO-TORO-RAPIDO`
   - Feriados: ej. `FERIADO-TORO-RAPIDO`
3. En la **primera fila** de cada hoja poné los encabezados según [HOJAS_GOOGLE_SHEETS.md](HOJAS_GOOGLE_SHEETS.md).
4. Cargá datos de prueba (al menos menú y horarios).

## 3. Apps Script

1. En el mismo libro de Google Sheets: **Extensiones** → **Apps Script**.
2. Pegá el contenido de [APPS_SCRIPT_COMPLETO.gs](APPS_SCRIPT_COMPLETO.gs) en `Code.gs`.
3. Guardá el proyecto.
4. **Implementar** → **Nueva implementación** → Tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
5. Copiá la **URL de la aplicación web** (la necesitás para `config.js`).

Si además usás envío de pedidos a Sheets, asegurate de que el script tenga las funciones que espera el front (doPost con la estructura que usa el módulo de pedidos).

## 4. Configuración local (`config.js`)

1. Abrí `config.js` en la raíz del proyecto.
2. Reemplazá al menos:
   - `telefonoNegocio`: número de WhatsApp con código de país (sin `+`).
   - `appsScriptMenuUrl` y `appsScriptPedidosUrl`: la URL de la aplicación web de Apps Script.
   - Nombres de hojas si no usás los por defecto: `menuSimpleSheetName`, `menuCompuestoSheetName`, `menuCompuestoDetalleSheetName`, `menuOpcionesSheetName`, `horarioSheetName`, `feriadoSheetName`.
3. Ajustá opcional: `instagram`, `costoEnvioBase`, `montoMinimoEnvioGratis`, horarios y badges (ver [CONFIGURACION.md](CONFIGURACION.md)).

## 5. Probar en local

Desde la carpeta del proyecto:

```bash
npx serve .
```

O con Python:

```bash
# Python 3
python -m http.server 8080
```

Abrí en el navegador `http://localhost:8080` (o el puerto que use `serve`). Comprobá:

- Portada carga y muestra estado del local (abierto/cerrado).
- El enlace “Realiza tu pedido” lleva al menú configurado en `menuActivo`.
- El menú carga productos desde la hoja.
- Al abrir un producto, se ven precio y, si corresponde, oferta y opciones.
- Carrito y envío a WhatsApp (sin subir a producción no se enviará el pedido al backend si lo tenés).

## 6. Desplegar en producción

- **GitHub Pages:** subí el repo y activá Pages en la rama que uses (por ejemplo `main`). La URL será `https://<usuario>.github.io/<repo>/`.
- **Netlify / Vercel:** conectá el repositorio y desplegá la carpeta raíz como sitio estático.
- **Otro hosting:** subí todo el contenido de la carpeta (HTML, CSS, JS, `config.js`, `imagenes/`, `scr/`) manteniendo la misma estructura.

Importante: `config.js` va con el resto de archivos; si tiene datos sensibles, valorá usar variables de entorno en el futuro o no versionar ese archivo y generarlo en el servidor.

## 7. Comprobar después de instalar

- [ ] Portada muestra estado (abierto/cerrado) según la hoja de horarios.
- [ ] Menú muestra categorías y productos de la hoja.
- [ ] Productos con “Mostar Descuento” = SI y Precio Regular > Precio Actual muestran oferta.
- [ ] Productos con filas en `menu-opciones` muestran la sección “Opciones y agregados”.
- [ ] Carrito suma bien y el enlace de WhatsApp abre con el mensaje del pedido.
- [ ] Si usás feriados, un día feriado con SE_ATIENDE = NO debe marcar local cerrado (según lógica del index).

## Solución de problemas

- **Menú no carga:** Revisá que la URL de Apps Script sea correcta y que el nombre de la hoja en `config.js` coincida con la pestaña del Sheet. Abrí la consola del navegador (F12) para ver errores.
- **Opciones no se ven:** Verificá que en la hoja de opciones la columna `idproducto` tenga exactamente el mismo valor que el ID del producto en la hoja del menú (idproducto o idmenu-unico).
- **Horarios no se ven:** Comprobá que exista la hoja de horarios y que `horarioSheetName` en `config.js` coincida. Revisá [APPS_SCRIPT_HORARIO_FERIADO.md](APPS_SCRIPT_HORARIO_FERIADO.md).

Para más detalle de cada hoja y columnas, ver [HOJAS_GOOGLE_SHEETS.md](HOJAS_GOOGLE_SHEETS.md) y [CONFIGURACION.md](CONFIGURACION.md).
