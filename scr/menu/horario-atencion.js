/**
 * Lógica compartida de horario de atención (apertura/cierre).
 * Usado en Resumen del pedido y portada del menú para mostrar avisos de "abre a las HH:MM" y "quedan X min".
 */
(function (global) {
    const ORDEN_DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    const DIA_HOY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

    const normKey = (s) =>
        (s ?? "")
            .toString()
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

    const getValue = (row, candidates) => {
        const key = Object.keys(row || {}).find((k) =>
            candidates.some((c) => normKey(c) === normKey(k))
        );
        return key != null ? row[key] : "";
    };

    const pad2 = (n) => String(Number(n) ?? 0).padStart(2, "0");
    const formatHora24 = (hora, minuto) => {
        const h = Math.min(23, Math.max(0, Number(hora) ?? 0));
        const m = Math.min(59, Math.max(0, Number(minuto) ?? 0));
        return `${pad2(h)}:${pad2(m)}`;
    };

    const normalizarNombreDia = (nombre) => {
        const n = normKey(nombre);
        const found = ORDEN_DIAS.find((d) => normKey(d) === n);
        return found != null ? found : nombre;
    };

    const parseHorarioRows = (rows) => {
        const byDay = {};
        const candidatesDia = ["DIA", "Día", "DÍA", "dia", "day", "Day"];
        const candidatesHoraDesde = ["HORA DESDE", "Hora Desde", "hora desde", "HoraDesde"];
        const candidatesMinDesde = ["MINUTO DESDE", "Minuto Desde", "minuto desde", "MinutoDesde"];
        const candidatesHoraHasta = ["HORA HASTA", "Hora Hasta", "hora hasta", "HoraHasta"];
        const candidatesMinHasta = ["MINUTO HASTA", "Minuto Hasta", "minuto hasta", "MinutoHasta"];
        (rows || []).forEach((row) => {
            const diaRaw = String(getValue(row, candidatesDia)).trim();
            if (!diaRaw) return;
            const dia = normalizarNombreDia(diaRaw);
            const hDesde = Number(getValue(row, candidatesHoraDesde)) || 0;
            const mDesde = Number(getValue(row, candidatesMinDesde)) || 0;
            const hHasta = Number(getValue(row, candidatesHoraHasta)) || 0;
            const mHasta = Number(getValue(row, candidatesMinHasta)) || 0;
            const cerrado = hDesde === 0 && mDesde === 0 && hHasta === 0 && mHasta === 0;
            const rango = cerrado ? "CERRADO" : `${formatHora24(hDesde, mDesde)} - ${formatHora24(hHasta, mHasta)}`;
            if (!byDay[dia]) byDay[dia] = [];
            byDay[dia].push(rango);
        });
        return byDay;
    };

    const parseHoraAMinutos = (str) => {
        const m = String(str || "").trim().match(/^(\d{1,2}):(\d{2})$/);
        if (!m) return null;
        const h = Math.min(23, Math.max(0, Number(m[1]) || 0));
        const min = Math.min(59, Math.max(0, Number(m[2]) || 0));
        return h * 60 + min;
    };

    const estaAbiertoAhora = (byDay) => {
        if (!byDay || typeof byDay !== "object") return false;
        const now = new Date();
        const diaHoy = DIA_HOY_NAMES[now.getDay()];
        const rangos = byDay[diaHoy];
        if (!rangos || !Array.isArray(rangos)) return false;
        const minutosAhora = now.getHours() * 60 + now.getMinutes();
        for (const r of rangos) {
            if (r === "CERRADO") continue;
            const parts = String(r).split(/\s*-\s*/).map((p) => p.trim());
            if (parts.length < 2) continue;
            const desde = parseHoraAMinutos(parts[0]);
            const hasta = parseHoraAMinutos(parts[1]);
            if (desde == null || hasta == null) continue;
            if (desde <= hasta) {
                if (minutosAhora >= desde && minutosAhora < hasta) return true;
            } else {
                if (minutosAhora >= desde || minutosAhora < hasta) return true;
            }
        }
        return false;
    };

    const getProximaApertura = (byDay) => {
        if (!byDay || typeof byDay !== "object") return null;
        const now = new Date();
        const diaIndex = now.getDay();
        const minutosAhora = now.getHours() * 60 + now.getMinutes();
        const collectDesde = (diaNombre) => {
            const rangos = byDay[diaNombre];
            if (!rangos || !Array.isArray(rangos)) return [];
            const list = [];
            for (const r of rangos) {
                if (r === "CERRADO") continue;
                const parts = String(r).split(/\s*-\s*/).map((p) => p.trim());
                if (parts.length < 2) continue;
                const desde = parseHoraAMinutos(parts[0]);
                if (desde != null) list.push(desde);
            }
            return list;
        };
        for (let offset = 0; offset < 7; offset++) {
            const idx = (diaIndex + offset) % 7;
            const diaNombre = DIA_HOY_NAMES[idx];
            const desdes = collectDesde(diaNombre);
            if (desdes.length === 0) continue;
            desdes.sort((a, b) => a - b);
            if (offset === 0) {
                for (const d of desdes) {
                    if (d > minutosAhora) {
                        return { minutosDesdeAhora: d - minutosAhora, hora: Math.floor(d / 60), minuto: d % 60, diaAperturaNombre: diaNombre, offsetDias: 0 };
                    }
                }
            } else {
                const d = desdes[0];
                const minutosHastaMedianoche = 24 * 60 - minutosAhora;
                const minutosHastaApertura = minutosHastaMedianoche + (offset - 1) * 24 * 60 + d;
                return { minutosDesdeAhora: minutosHastaApertura, hora: Math.floor(d / 60), minuto: d % 60, diaAperturaNombre: diaNombre, offsetDias: offset };
            }
        }
        return null;
    };

    const getMinutosHastaCierre = (byDay) => {
        if (!byDay || typeof byDay !== "object") return null;
        const now = new Date();
        const diaHoy = DIA_HOY_NAMES[now.getDay()];
        const rangos = byDay[diaHoy];
        if (!rangos || !Array.isArray(rangos)) return null;
        const minutosAhora = now.getHours() * 60 + now.getMinutes();
        for (const r of rangos) {
            if (r === "CERRADO") continue;
            const parts = String(r).split(/\s*-\s*/).map((p) => p.trim());
            if (parts.length < 2) continue;
            const desde = parseHoraAMinutos(parts[0]);
            const hasta = parseHoraAMinutos(parts[1]);
            if (desde == null || hasta == null) continue;
            let dentro = false;
            if (desde <= hasta) {
                dentro = minutosAhora >= desde && minutosAhora < hasta;
            } else {
                dentro = minutosAhora >= desde || minutosAhora < hasta;
            }
            if (!dentro) continue;
            if (desde <= hasta) return hasta - minutosAhora;
            if (minutosAhora >= desde) return (24 * 60 - minutosAhora) + hasta;
            return hasta - minutosAhora;
        }
        return null;
    };

    /** Segundos hasta el próximo cierre (para cuenta regresiva). */
    const getSegundosHastaCierre = (byDay) => {
        if (!byDay || typeof byDay !== "object") return null;
        const now = new Date();
        const diaHoy = DIA_HOY_NAMES[now.getDay()];
        const rangos = byDay[diaHoy];
        if (!rangos || !Array.isArray(rangos)) return null;
        const segundosAhora = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const minutosAhora = now.getHours() * 60 + now.getMinutes();
        for (const r of rangos) {
            if (r === "CERRADO") continue;
            const parts = String(r).split(/\s*-\s*/).map((p) => p.trim());
            if (parts.length < 2) continue;
            const desde = parseHoraAMinutos(parts[0]);
            const hasta = parseHoraAMinutos(parts[1]);
            if (desde == null || hasta == null) continue;
            let dentro = false;
            if (desde <= hasta) {
                dentro = minutosAhora >= desde && minutosAhora < hasta;
            } else {
                dentro = minutosAhora >= desde || minutosAhora < hasta;
            }
            if (!dentro) continue;
            if (desde <= hasta) return hasta * 60 - segundosAhora;
            if (minutosAhora >= desde) return (24 * 3600 - segundosAhora) + hasta * 60;
            return hasta * 60 - segundosAhora;
        }
        return null;
    };

    const formatCountdown = (totalSegundos) => {
        const s = Math.max(0, Math.floor(totalSegundos));
        const m = Math.floor(s / 60);
        const seg = s % 60;
        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(m)}:${pad(seg)}`;
    };

    const FETCH_SHEET_TIMEOUT = 10000;

    const FERIADO_KEYS = {
        fecha: ["FECHA", "fecha", "Fecha"],
        seAtiende: ["SE_ATIENDE", "se atiende", "Se Atiende"],
        horaDesde: ["HORA DESDE", "Hora Desde", "hora desde"],
        minDesde: ["MINUTO DESDE", "Minuto Desde", "minuto desde"],
        horaHasta: ["HORA HASTA", "Hora Hasta", "hora hasta"],
        minHasta: ["MINUTO HASTA", "Minuto Hasta", "minuto hasta"]
    };

    function rowsFromData(data) {
        if (!data || data.error || data.result === "error") return null;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.rows) && Array.isArray(data.headers)) {
            const headers = data.headers.map((h) => (h != null ? String(h).trim() : ""));
            return data.rows.map((row) => {
                const obj = {};
                headers.forEach((h, i) => { obj[h] = row[i]; });
                return obj;
            });
        }
        if (Array.isArray(data.data)) return data.data;
        return null;
    }

    /** Parsea filas de FERIADO-TORO-RAPIDO: { fecha (Date), seAtiende (bool), rango24h }. */
    function parseFeriadosRows(rows) {
        const list = [];
        (rows || []).forEach((row) => {
            const fechaStr = String(getValue(row, FERIADO_KEYS.fecha)).trim();
            if (!fechaStr) return;
            const match = fechaStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
            const fecha = match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
            if (!fecha || Number.isNaN(fecha.getTime())) return;
            const seAtiendeRaw = String(getValue(row, FERIADO_KEYS.seAtiende)).trim().toUpperCase();
            const seAtiende = seAtiendeRaw === "SI" || seAtiendeRaw === "SÍ";
            let rango24h = "";
            if (seAtiende) {
                const desde = formatHora24(getValue(row, FERIADO_KEYS.horaDesde), getValue(row, FERIADO_KEYS.minDesde));
                const hasta = formatHora24(getValue(row, FERIADO_KEYS.horaHasta), getValue(row, FERIADO_KEYS.minHasta));
                rango24h = `${desde} - ${hasta}`;
            }
            list.push({ fecha, seAtiende, rango24h });
        });
        return list.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    }

    function getFeriadoParaFecha(feriados, date) {
        if (!feriados || !feriados.length) return null;
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        for (const f of feriados) {
            const fd = new Date(f.fecha);
            fd.setHours(0, 0, 0, 0);
            if (d.getTime() === fd.getTime()) return f;
        }
        return null;
    }

    /**
     * Si hoy es feriado con SE_ATIENDE=SI, prevalece el horario del feriado para ese día.
     * Si SE_ATIENDE=NO, prevalece HORARIO-TORO-RAPIDO (no se reemplaza).
     */
    function mergeByDayConFeriadoHoy(byDay, feriados) {
        const res = {};
        for (const dia of ORDEN_DIAS) res[dia] = (byDay[dia] && [...byDay[dia]]) || [];
        const hoy = new Date();
        const feriadoHoy = getFeriadoParaFecha(feriados, hoy);
        if (!feriadoHoy) return res;
        const diaHoy = DIA_HOY_NAMES[hoy.getDay()];
        if (feriadoHoy.seAtiende && feriadoHoy.rango24h) {
            res[diaHoy] = [feriadoHoy.rango24h];
        }
        return res;
    }

    async function fetchHorarioByDay() {
        const scriptUrl = global.APP_CONFIG?.appsScriptMenuUrl || global.APP_CONFIG?.appsScriptPedidosUrl || "";
        const sheetName = global.APP_CONFIG?.horarioSheetName || "HORARIO-TORO-RAPIDO";
        if (!scriptUrl || !sheetName) return null;
        const sep = scriptUrl.includes("?") ? "&" : "?";
        const url = `${scriptUrl}${sep}action=list&sheetName=${encodeURIComponent(sheetName)}&_ts=${Date.now()}`;
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), FETCH_SHEET_TIMEOUT);
            const response = await fetch(url, { cache: "no-store", signal: controller.signal });
            clearTimeout(id);
            if (!response.ok) return null;
            const text = await response.text();
            let data = null;
            try { data = JSON.parse(text); } catch (e) { return null; }
            if (!data || data.error || data.result === "error") return null;
            let rows = null;
            if (Array.isArray(data)) rows = data;
            else if (data && Array.isArray(data.rows) && Array.isArray(data.headers)) {
                const headers = data.headers.map((h) => (h != null ? String(h).trim() : ""));
                rows = data.rows.map((row) => {
                    const obj = {};
                    headers.forEach((h, i) => { obj[h] = row[i]; });
                    return obj;
                });
            } else if (data && Array.isArray(data.data)) rows = data.data;
            return rows != null ? parseHorarioRows(rows) : null;
        } catch (e) {
            if (e.name !== "AbortError") console.warn("Horario menú:", e);
            return null;
        }
    }

    async function fetchFeriados() {
        const scriptUrl = global.APP_CONFIG?.appsScriptMenuUrl || global.APP_CONFIG?.appsScriptPedidosUrl || "";
        const sheetName = global.APP_CONFIG?.feriadoSheetName || "FERIADO-TORO-RAPIDO";
        if (!scriptUrl || !sheetName) return [];
        const sep = scriptUrl.includes("?") ? "&" : "?";
        const url = `${scriptUrl}${sep}action=list&sheetName=${encodeURIComponent(sheetName)}&_ts=${Date.now()}`;
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), FETCH_SHEET_TIMEOUT);
            const response = await fetch(url, { cache: "no-store", signal: controller.signal });
            clearTimeout(id);
            if (!response.ok) return [];
            const text = await response.text();
            let data = null;
            try { data = JSON.parse(text); } catch (e) { return []; }
            const rows = rowsFromData(data);
            return rows != null ? parseFeriadosRows(rows) : [];
        } catch (e) {
            if (e.name !== "AbortError") console.warn("Feriados menú:", e);
            return [];
        }
    }

    /**
     * Horario efectivo: trae HORARIO-TORO-RAPIDO y feriados.
     * - Si hoy es feriado con SE_ATIENDE=SI: usa el horario del feriado para hoy (prevalece sobre HORARIO-TORO-RAPIDO).
     * - Si hoy es feriado con SE_ATIENDE=NO: prevalece HORARIO-TORO-RAPIDO para el horario; además feriadoHoySinAtender=true (menú deshabilita pedido y reserva, oculta "Ver pedido").
     * - Si hoy no está en feriados: solo HORARIO-TORO-RAPIDO.
     * @returns {{ byDay: object, feriadoHoySinAtender: boolean }}
     */
    async function getHorarioEfectivo() {
        const byDay = await fetchHorarioByDay();
        const feriados = await fetchFeriados();
        const merged = mergeByDayConFeriadoHoy(byDay || {}, feriados);
        const feriadoHoy = getFeriadoParaFecha(feriados, new Date());
        const feriadoHoySinAtender = !!(feriadoHoy && !feriadoHoy.seAtiende);
        return { byDay: merged, feriadoHoySinAtender };
    }

    /**
     * Devuelve el estado para mostrar en menú: { abierto, tipo, mensaje }.
     * tipo: "abierto" | "abierto-pronto-cierre" | "cerrado-abre-en" | "cerrado"
     */
    function getEstadoHorario(byDay) {
        if (!byDay) return { abierto: false, tipo: "cerrado", mensaje: "Cerrado por el momento" };
        const abierto = estaAbiertoAhora(byDay);
        const minutosAntesCierre = Math.max(0, Number(global.APP_CONFIG?.minutosAntesCierre) || 30);
        const minutosAntesApertura = Math.max(0, Number(global.APP_CONFIG?.minutosAntesApertura) || 20);

        if (abierto) {
            const minHastaCierre = getMinutosHastaCierre(byDay);
            const segundosHastaCierre = getSegundosHastaCierre(byDay);
            const alertaCierre = minHastaCierre != null && minHastaCierre <= minutosAntesCierre;
            if (alertaCierre) {
                const texto = minHastaCierre <= 0 ? "Cerramos ya" : `¡Quedan ${minHastaCierre} min! Pedí antes del cierre`;
                return { abierto: true, tipo: "abierto-pronto-cierre", mensaje: texto, segundosHastaCierre: segundosHastaCierre != null ? Math.max(0, segundosHastaCierre) : null };
            }
            return { abierto: true, tipo: "abierto", mensaje: "Estamos atendiendo" };
        }

        const proxima = getProximaApertura(byDay);
        const mostrarAbreEn = proxima && proxima.minutosDesdeAhora <= minutosAntesApertura;
        const horaStr = proxima ? `${String(proxima.hora).padStart(2, "0")}:${String(proxima.minuto).padStart(2, "0")}` : "";
        const horasReserva = Math.max(0, Number(global.APP_CONFIG?.horasAntesAperturaParaReserva) || 2);
        const puedeReservar = proxima && proxima.minutosDesdeAhora <= horasReserva * 60;
        const minutosHastaApertura = proxima ? proxima.minutosDesdeAhora : null;
        const textoHastaApertura = minutosHastaApertura != null ? formatTiempoHastaApertura(minutosHastaApertura) : null;
        const diaAperturaLabel = proxima
            ? proxima.offsetDias === 0
                ? "hoy"
                : proxima.offsetDias === 1
                    ? "mañana"
                    : "el " + proxima.diaAperturaNombre
            : null;
        const extra = proxima
            ? { horaApertura: horaStr, minutosHastaApertura, textoHastaApertura, diaAperturaNombre: proxima.diaAperturaNombre, diaAperturaLabel }
            : {};
        if (mostrarAbreEn) {
            return { abierto: false, tipo: "cerrado-abre-en", mensaje: `El local abre a las ${horaStr}`, puedeReservar, ...extra };
        }
        return { abierto: false, tipo: "cerrado", mensaje: "Cerrado por el momento", puedeReservar: !!puedeReservar, ...extra };
    }

    function formatTiempoHastaApertura(minutos) {
        const m = Math.max(0, Math.floor(minutos));
        if (m < 60) return `Faltan ${m} min para la apertura`;
        const h = Math.floor(m / 60);
        const min = m % 60;
        if (min === 0) return h === 1 ? "Falta 1 h para la apertura" : `Faltan ${h} h para la apertura`;
        return `Faltan ${h} h ${min} min para la apertura`;
    }

    global.HorarioAtencion = {
        fetchHorarioByDay,
        fetchFeriados,
        getHorarioEfectivo,
        getEstadoHorario,
        formatCountdown,
        formatTiempoHastaApertura
    };
})(typeof window !== "undefined" ? window : this);
