# Notas y pendientes – Menú compuesto

## Hojas de Google Sheets

### 1. menu-toro-rapido-web-compuesto
**Columnas:**  
orden, idmenu-unico, Tipo Menu, idmenu-variable, idproducto, Categoria, Producto, Descripcion Producto, Precio Actual, Precio Regular, Monto Descuento, Porcentaje Descuento, Mostar Descuento, Imagen, Es Destacado, Producto Agotado, Stock, Habilitado

- **Tipo Menu** define cómo se muestran los productos:
  - **MENU-SIMPLE**: se usa el diseño actual (igual que menú simple).
  - **MENU-COMPUESTO**: se usará un diseño nuevo que incorpora el detalle de productos de la hoja **menu-compuesto-detalle**.
- **idmenu-variable** relaciona cada fila de esta hoja con las filas de **menu-compuesto-detalle** (misma columna).

---

### 2. menu-compuesto-detalle (nueva hoja)
**Columnas:**  
idmenu-compuesto-detalle, idmenu-variable, idproducto, Cantidad, Producto, Precio Unitario Actual, Precio Total Actual, Imagen, Es Destacado, Producto Agotado, Stock, Habilitado

- **idmenu-variable** debe coincidir con la columna **idmenu-variable** de **menu-toro-rapido-web-compuesto**.
- Esta hoja contiene los ítems de detalle que se mostrarán cuando **Tipo Menu** = MENU-COMPUESTO.

---

## Pendientes por implementar

- [ ] **Diseño MENU-COMPUESTO**: Crear la vista nueva en `menu-compuesto` que, para filas con Tipo Menu = MENU-COMPUESTO, cargue y muestre los productos de **menu-compuesto-detalle** filtrados por **idmenu-variable**.
- [ ] **Carga de la hoja detalle**: En Apps Script y/o front (menu-compuesto.js), cargar la hoja **menu-compuesto-detalle** y cruzar por **idmenu-variable** con la hoja compuesto.
- [ ] **Lógica por Tipo Menu**: En el menú compuesto, según el valor de **Tipo Menu** (MENU-SIMPLE vs MENU-COMPUESTO), decidir si se muestra el ítem con el diseño actual o con el nuevo diseño que incluye el detalle.
- [ ] **URL/Config para detalle**: Si se publica CSV o otra URL para la hoja detalle, agregar en `config.js` (ej. `googleSheetUrlMenuCompuestoDetalle`) y usarla en la carga.

---

## Resumen de relación entre hojas

```
menu-toro-rapido-web-compuesto
  ├── Tipo Menu = "MENU-SIMPLE"  → mostrar con diseño actual (como menú simple)
  └── Tipo Menu = "MENU-COMPUESTO" → mostrar con diseño nuevo
        └── detalle desde menu-compuesto-detalle donde idmenu-variable = idmenu-variable (compuesto)
```

---

*Última actualización: notas creadas al agregar hoja menu-compuesto-detalle.*
