import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  TrendingUp,
  Thermometer,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Printer,
  FileText,
  LineChart,
  Droplets,
  User,
  Info,
} from 'lucide-react';

/**
 * Determine equipment specifications based on the 18 standardized hospital .html templates
 */
export function getEquipmentSpecs(cabinetName, dataRows = []) {
  const norm = String(cabinetName || '')
    .toLowerCase()
    .normalize('NFC')
    .trim();

  // 1. Room with Humidity (Dual-scale: Temperature 15-32°C, Humidity 15-100%)
  const isRoom =
    norm.includes('phòng') ||
    norm.includes('độ ẩm') ||
    norm.includes('nhận mẫu') ||
    norm.includes('đông máu') ||
    norm.includes('ngân hàng máu');

  if (isRoom) {
    let title = 'PHIẾU THEO DÕI NHIỆT ĐỘ VÀ ẨM ĐỘ';
    let roomType = 'Phòng';
    let deviceCode = 'HE-sp-003';
    if (norm.includes('nhận mẫu')) {
      title += ' PHÒNG NHẬN MẪU';
      roomType = 'Phòng nhận mẫu';
      deviceCode = 'HE-sp-003';
    } else if (norm.includes('đông máu') || norm.includes('tế bào')) {
      title += ' PHÒNG ĐÔNG MÁU - TẾ BÀO';
      roomType = 'Phòng đông máu - Tế bào';
      deviceCode = 'HE-sp-002';
    } else if (norm.includes('ngân hàng máu')) {
      title += ' PHÒNG NGÂN HÀNG MÁU';
      roomType = 'Phòng ngân hàng máu';
      deviceCode = 'HE-sp-001';
    } else {
      title += ` ${cabinetName.toUpperCase()}`;
    }

    return {
      type: 'ROOM_DUAL',
      title,
      roomType,
      code: 'FM-EQ-HE-004 V4.0',
      standardTemp: '21 - 26°C',
      standardHumidity: '≤ 70%',
      deviceCode,
      managerCode: 'TAN006',
      tempScale: [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15],
      humScale: [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15],
      tempMin: 21,
      tempMax: 26,
      humMax: 70,
    };
  }

  // 2. Bể điều nhiệt Memmert WTB35 (37°C & 56°C)
  if (norm.includes('memmert') || norm.includes('bể điều nhiệt') || norm.includes('wtb35')) {
    return {
      type: 'MEMMERT',
      title: 'PHIẾU THEO DÕI NHIỆT ĐỘ BỂ ĐIỀU NHIỆT MEMMERT WTB35',
      code: 'FM-EQ-HE-003 V4.0',
      standardTemp: '37°C & 56°C',
      deviceCode: 'HE-tb-015',
      managerCode: 'LIB001',
      temps: [57, 56, 55, 'sep', 38, 37, 36],
      highlightTemps: [56, 37],
    };
  }

  // 3. Tủ âm sâu PHCBi (-80°C ~ -70°C)
  if (norm.includes('âm sâu') || (norm.includes('phcbi') && (norm.includes('80') || norm.includes('70')))) {
    return {
      type: 'CABINET',
      title: 'PHIẾU THEO DÕI NHIỆT ĐỘ TỦ ÂM SÂU (-80°C ~ -70°C)',
      code: 'FM-EQ-HE-003 V4.0',
      standardTemp: '-80°C ~ -70°C',
      deviceCode: 'HE-bb-014',
      managerCode: 'LIB001',
      temps: [-70, -71, -72, -73, -74, -75, -76, -77, -78, -79, -80, -81, -82, -83, -84, -85],
      highlightTemps: [-70, -80],
    };
  }

  // 4. Tủ đông trữ chế phẩm máu (-30°C ~ -35°C) (KW, Panasonic MDF-137, Thermo Scientific)
  if (norm.includes('tủ đông') || norm.includes('kw') || norm.includes('mdf-137') || norm.includes('-30')) {
    return {
      type: 'CABINET',
      title: 'PHIẾU THEO DÕI NHIỆT ĐỘ TỦ ĐÔNG TRỮ CHẾ PHẨM MÁU (-30°C ~ -35°C)',
      code: 'FM-EQ-HE-003 V4.0',
      standardTemp: '-30°C ~ -35°C',
      deviceCode: 'HE-bb-005',
      managerCode: 'LIB001',
      temps: [-30, -31, -32, -33, -34, -35, -36],
      highlightTemps: [-30, -35],
    };
  }

  // 5. Máy ủ lắc tiểu cầu HELMER PC100i (20°C ~ 24°C)
  if (norm.includes('tiểu cầu') || norm.includes('helmer') || norm.includes('pc100i')) {
    return {
      type: 'CABINET',
      title: 'PHIẾU THEO DÕI NHIỆT ĐỘ MÁY Ủ LẮC TIỂU CẦU 20-24°C',
      code: 'FM-EQ-HE-003 V4.0',
      standardTemp: '20°C ~ 24°C',
      deviceCode: 'HE-bb-008',
      managerCode: 'LIB001',
      temps: [25, 24, 23, 22, 21, 20, 19],
      highlightTemps: [20, 24],
    };
  }

  // 6. Tủ lạnh trữ máu 2-6°C (Fiochetti, PHCBi-A, PHCBi-B)
  if (norm.includes('fiochetti') || norm.includes('phcbi-a') || norm.includes('phcbi-b')) {
    return {
      type: 'CABINET',
      title: 'PHIẾU THEO DÕI NHIỆT ĐỘ TỦ LẠNH TRỮ MÁU 2-6°C',
      code: 'FM-EQ-HE-003 V4.0',
      standardTemp: '2°C ~ 6°C',
      deviceCode: 'HE-bb-002',
      managerCode: 'LIB001',
      temps: [6, 5, 4, 3, 2, 1],
      highlightTemps: [2, 6],
    };
  }

  // 7. Tủ lạnh trữ hóa chất / lưu mẫu 2-8°C (Dometic BR320, Sanyo, Panasonic, etc.)
  return {
    type: 'CABINET',
    title: 'PHIẾU THEO DÕI NHIỆT ĐỘ TỦ LẠNH TRỮ HÓA CHẤT 2-8°C',
    code: 'FM-EQ-HE-003 V4.0',
    standardTemp: '2°C ~ 8°C',
    deviceCode: 'HE-bb-001',
    managerCode: 'LIB001',
    temps: [8, 7, 6, 5, 4, 3, 2],
    highlightTemps: [2, 8],
  };
}

export default function MonthlyChartModule({
  dataRows = [],
  activeCabinet = 'ALL',
  onSelectCabinet,
  activeMonth = 'ALL',
  onSelectMonth,
  tenTuList = [],
  thangList = [],
  onRefresh,
  getStaffDisplayName,
}) {
  // View mode: 'hospitalSheet' (Medical chart from .html) | 'interactiveCurve' (Modern SVG curve)
  const [viewMode, setViewMode] = useState('hospitalSheet');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Normalize string for accurate comparison
  const cleanStr = (s) =>
    String(s || '')
      .normalize('NFC')
      .trim()
      .toLowerCase();

  // Helper: Extract month/year (MM/YYYY)
  const getMonthYear = (r) => {
    if (r.nam_thang && r.nam_thang.includes('/')) {
      const parts = r.nam_thang.trim().split('/');
      if (parts.length === 2) {
        return `${parts[1].padStart(2, '0')}/${parts[0]}`;
      }
    }
    if (r.ngay) {
      const parts = r.ngay.trim().split('/');
      if (parts.length === 3) {
        return `${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
    }
    if (r.ngay_h) {
      const datePart = r.ngay_h.trim().split(' ')[0];
      const parts = datePart.split('/');
      if (parts.length === 3) {
        return `${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
    }
    return '';
  };

  // Helper: Parse measurement timestamp strictly from ngay_h (or ngay + khung_h)
  const getRecordTimestamp = (r) => {
    if (r.ngay_h) {
      const trimmed = r.ngay_h.trim();
      const parts = trimmed.split(' ');
      const dParts = parts[0].split('/');
      if (dParts.length === 3) {
        const d = dParts[0].padStart(2, '0');
        const m = dParts[1].padStart(2, '0');
        const y = dParts[2];
        let timePart = parts[1];
        if (!timePart || timePart.indexOf(':') === -1) {
          timePart = r.khung_h === 'Chiều' ? '14:00:00' : '08:00:00';
        } else {
          const tSegments = timePart.split(':');
          const hh = (tSegments[0] || '00').padStart(2, '0');
          const mm = (tSegments[1] || '00').padStart(2, '0');
          const ss = (tSegments[2] || '00').padStart(2, '0');
          timePart = `${hh}:${mm}:${ss}`;
        }
        const t = new Date(`${y}-${m}-${d}T${timePart}`).getTime();
        if (!isNaN(t) && t > 0) return t;
      }
    }
    if (r.ngay) {
      const dParts = r.ngay.trim().split('/');
      if (dParts.length === 3) {
        const d = dParts[0].padStart(2, '0');
        const m = dParts[1].padStart(2, '0');
        const y = dParts[2];
        const timePart = r.khung_h === 'Chiều' ? '14:00:00' : '08:00:00';
        const t = new Date(`${y}-${m}-${d}T${timePart}`).getTime();
        if (!isNaN(t) && t > 0) return t;
      }
    }
    return 0;
  };

  // Currently resolved cabinet (defaults to first cabinet if 'ALL')
  const resolvedCabinet = useMemo(() => {
    if (activeCabinet && activeCabinet !== 'ALL') {
      return activeCabinet;
    }
    return tenTuList.length > 0 ? tenTuList[0] : '';
  }, [activeCabinet, tenTuList]);

  // Currently resolved month (defaults to first available month if 'ALL')
  const resolvedMonth = useMemo(() => {
    if (activeMonth && activeMonth !== 'ALL') {
      return activeMonth;
    }
    return thangList.length > 0 ? thangList[0] : '05/2026';
  }, [activeMonth, thangList]);

  // Month navigation: previous / next
  const currentMonthIndex = thangList.indexOf(resolvedMonth);
  const handlePrevMonth = () => {
    if (currentMonthIndex < thangList.length - 1) {
      onSelectMonth(thangList[currentMonthIndex + 1]);
    }
  };
  const handleNextMonth = () => {
    if (currentMonthIndex > 0) {
      onSelectMonth(thangList[currentMonthIndex - 1]);
    }
  };

  // Filter rows for this cabinet and this month, sorted chronologically ascending
  const chartRows = useMemo(() => {
    if (!resolvedCabinet) return [];
    const target = cleanStr(resolvedCabinet);
    return dataRows
      .filter((r) => {
        const matchTu =
          cleanStr(r.ten) === target || cleanStr(r.id_tu) === target;
        const matchThang = getMonthYear(r) === resolvedMonth;
        return matchTu && matchThang;
      })
      .sort((a, b) => getRecordTimestamp(a) - getRecordTimestamp(b));
  }, [dataRows, resolvedCabinet, resolvedMonth]);

  // Equipment specs
  const specs = useMemo(() => {
    return getEquipmentSpecs(resolvedCabinet, dataRows);
  }, [resolvedCabinet, dataRows]);

  // Map month data into { [day]: { S: { temp, hum, sign }, C: { temp, hum, sign } } }
  const monthDataMap = useMemo(() => {
    const map = {};
    chartRows.forEach((r) => {
      let day = null;
      if (r.ngay) {
        const parts = r.ngay.split('/');
        if (parts.length >= 2) day = parseInt(parts[0], 10);
      } else if (r.ngay_h) {
        const datePart = r.ngay_h.split(' ')[0];
        const parts = datePart.split('/');
        if (parts.length >= 2) day = parseInt(parts[0], 10);
      }
      if (!day || isNaN(day) || day < 1 || day > 31) return;

      const session = (r.khung_h || '')
        .trim()
        .toLowerCase()
        .startsWith('c')
        ? 'C'
        : 'S';
      if (!map[day]) map[day] = {};

      const temp =
        r.nhiet_do_do_dc !== '' && !isNaN(Number(r.nhiet_do_do_dc))
          ? Number(r.nhiet_do_do_dc)
          : null;
      const hum =
        r.do_am_do_dc !== '' && !isNaN(Number(r.do_am_do_dc))
          ? Number(r.do_am_do_dc)
          : null;
      const staffName = getStaffDisplayName
        ? getStaffDisplayName(r.id_nv)
        : r.id_nv || '';

      map[day][session] = {
        temp,
        hum,
        sign: staffName,
        id_nv: r.id_nv,
        ket_qua: r.ket_qua,
        raw: r,
      };
    });
    return map;
  }, [chartRows, getStaffDisplayName]);

  // Summary KPIs
  const stats = useMemo(() => {
    const total = chartRows.length;
    let datCount = 0;
    let warningCount = 0;
    const temps = [];
    const hums = [];

    chartRows.forEach((r) => {
      const kq = (r.ket_qua || '').toUpperCase();
      if (kq === 'ĐẠT') datCount++;
      else warningCount++;

      const t = Number(r.nhiet_do_do_dc);
      if (!isNaN(t)) temps.push(t);

      const h = Number(r.do_am_do_dc);
      if (!isNaN(h)) hums.push(h);
    });

    const datRate = total > 0 ? ((datCount / total) * 100).toFixed(1) : 0;
    const minTemp = temps.length > 0 ? Math.min(...temps) : null;
    const maxTemp = temps.length > 0 ? Math.max(...temps) : null;
    const avgTemp =
      temps.length > 0
        ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
        : null;
    const avgHum =
      hums.length > 0
        ? (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1)
        : null;

    return { total, datCount, warningCount, datRate, minTemp, maxTemp, avgTemp, avgHum };
  }, [chartRows]);

  // Extract month and year parts for header
  const [monthPart, yearPart] = useMemo(() => {
    if (resolvedMonth && resolvedMonth.includes('/')) {
      const parts = resolvedMonth.split('/');
      return [parts[0], parts[1]];
    }
    return ['05', '2026'];
  }, [resolvedMonth]);

  return (
    <div className="flex flex-1 flex-col overflow-auto bg-slate-50/60 p-4 space-y-4">
      {/* Top Header Card (Controls) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Biểu Đồ & Phiếu Theo Dõi Nhiệt Độ Theo Tháng
                </h2>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                  {specs.code}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Chuẩn hóa biểu mẫu theo các file theo dõi tủ bệnh viện Nhi Đồng 1 &bull; Tiêu chuẩn: {specs.standardTemp} {specs.standardHumidity ? `& ${specs.standardHumidity}` : ''}
              </p>
            </div>
          </div>

          {/* Right: Selectors, Mode Toggle & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('hospitalSheet')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition-all ${
                  viewMode === 'hospitalSheet'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Biểu mẫu BV (Theo .html)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('interactiveCurve')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-bold transition-all ${
                  viewMode === 'interactiveCurve'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LineChart className="h-3.5 w-3.5" />
                <span>Biểu đồ trực quan</span>
              </button>
            </div>

            {/* Cabinet selector */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs">
              <Thermometer className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-slate-600">Thiết bị:</span>
              <select
                value={resolvedCabinet}
                onChange={(e) => onSelectCabinet(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none max-w-[220px] truncate cursor-pointer"
                title={resolvedCabinet}
              >
                {tenTuList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Month selector with prev/next buttons */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                disabled={currentMonthIndex >= thangList.length - 1}
                title="Tháng trước"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2 font-bold text-slate-800">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <select
                  value={resolvedMonth}
                  onChange={(e) => onSelectMonth(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  {thangList.map((m) => (
                    <option key={m} value={m}>
                      Tháng {m}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                disabled={currentMonthIndex <= 0}
                title="Tháng sau"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-white hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => window.print()}
              title="In phiếu theo dõi A4 Landscape"
              className="flex h-8 items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>In phiếu (A4)</span>
            </button>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefresh}
              title="Làm mới dữ liệu từ Google Sheets"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-blue-600 active:scale-95 transition"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* KPIs row */}
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 border-t border-slate-100 pt-3 text-xs">
          <div className="rounded-lg bg-slate-50 p-2">
            <span className="text-[11px] text-slate-500">Tổng lượt ghi nhận</span>
            <p className="text-base font-extrabold text-slate-800">{stats.total} lượt</p>
          </div>
          <div className="rounded-lg bg-emerald-50/70 p-2">
            <span className="text-[11px] text-emerald-700">Tỷ lệ ĐẠT chuẩn</span>
            <p className="text-base font-extrabold text-emerald-800">{stats.datRate}%</p>
          </div>
          <div className="rounded-lg bg-blue-50/70 p-2">
            <span className="text-[11px] text-blue-700">Nhiệt độ TB</span>
            <p className="text-base font-extrabold text-blue-800">
              {stats.avgTemp !== null ? `${stats.avgTemp}°C` : '—'}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <span className="text-[11px] text-slate-500">Min &bull; Max đo được</span>
            <p className="text-base font-extrabold text-slate-800">
              {stats.minTemp !== null ? `${stats.minTemp}°C ~ ${stats.maxTemp}°C` : '—'}
            </p>
          </div>
          {stats.avgHum !== null && (
            <div className="rounded-lg bg-rose-50/70 p-2">
              <span className="text-[11px] text-rose-700">Độ ẩm TB</span>
              <p className="text-base font-extrabold text-rose-800">{stats.avgHum}%</p>
            </div>
          )}
          <div className="rounded-lg bg-amber-50/70 p-2">
            <span className="text-[11px] text-amber-700">Tiêu chuẩn kiểm soát</span>
            <p className="text-base font-extrabold text-amber-800 truncate" title={specs.standardTemp}>
              {specs.standardTemp}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'hospitalSheet' ? (
        <div className="space-y-6">
          {specs.type === 'ROOM_DUAL' ? (
            /* Room with Temperature & Humidity */
            <HospitalRoomSheet
              specs={specs}
              cabinetName={resolvedCabinet}
              month={monthPart}
              year={yearPart}
              dataMap={monthDataMap}
              chartRows={chartRows}
            />
          ) : (
            /* Cabinet / Refrigerator / Memmert / Freezer */
            <HospitalCabinetSheet
              specs={specs}
              cabinetName={resolvedCabinet}
              month={monthPart}
              year={yearPart}
              dataMap={monthDataMap}
              chartRows={chartRows}
            />
          )}
        </div>
      ) : (
        /* Modern Interactive Curve View */
        <InteractiveCurveView
          chartRows={chartRows}
          specs={specs}
          resolvedCabinet={resolvedCabinet}
          resolvedMonth={resolvedMonth}
          hoveredPoint={hoveredPoint}
          setHoveredPoint={setHoveredPoint}
          getStaffDisplayName={getStaffDisplayName}
        />
      )}

      {/* Print Media Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 4mm 5mm;
          }
          body, html {
            background: #fff !important;
            color: #000 !important;
          }
          .no-print {
            display: none !important;
          }
          .hospital-sheet-page {
            width: 287mm !important;
            max-width: 287mm !important;
            margin: 0 auto 5mm auto !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 3mm !important;
            page-break-after: always !important;
            break-after: page !important;
            background: #fff !important;
          }
          .hospital-sheet-page:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Component: Hospital Cabinet Sheet (Matching 1 - 15 .html templates)
 * Divided into Page 1 (Days 1 - 15) and Page 2 (Days 16 - 31)
 */
function HospitalCabinetSheet({ specs, cabinetName, month, year, dataMap, chartRows }) {
  const temps = specs.temps || [8, 7, 6, 5, 4, 3, 2];
  const highlightTemps = specs.highlightTemps || [2, 8];

  return (
    <div className="space-y-6">
      {/* Page 1: Days 1 to 15 */}
      <HospitalHalfTable
        specs={specs}
        cabinetName={cabinetName}
        month={month}
        year={year}
        pageIndex={1}
        startDay={1}
        endDay={15}
        temps={temps}
        highlightTemps={highlightTemps}
        dataMap={dataMap}
      />

      {/* Page 2: Days 16 to 31 */}
      <HospitalHalfTable
        specs={specs}
        cabinetName={cabinetName}
        month={month}
        year={year}
        pageIndex={2}
        startDay={16}
        endDay={31}
        temps={temps}
        highlightTemps={highlightTemps}
        dataMap={dataMap}
      />
    </div>
  );
}

/**
 * Component: Half Table for Page 1 (1 - 15) or Page 2 (16 - 31)
 */
function HospitalHalfTable({
  specs,
  cabinetName,
  month,
  year,
  pageIndex,
  startDay,
  endDay,
  temps,
  highlightTemps,
  dataMap,
}) {
  const days = endDay - startDay + 1;
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1050);

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth || 1050);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute SVG line points
  const linePoints = useMemo(() => {
    const pts = [];
    const cornerWidth = 60; // width of 'Nhiệt độ' cell
    const sessionColWidth = (containerWidth - cornerWidth) / (days * 2);
    const headerHeight = 72; // header height (3 rows)
    const rowHeight = 24; // temperature row height

    for (let d = startDay; d <= endDay; d++) {
      ['S', 'C'].forEach((session) => {
        const entry = dataMap[d]?.[session];
        if (entry && entry.temp !== null && entry.temp !== undefined) {
          const colIndex = (d - startDay) * 2 + (session === 'C' ? 1 : 0);
          const x = cornerWidth + (colIndex + 0.5) * sessionColWidth;

          // Find row index of this temperature
          const rowIndex = temps.indexOf(entry.temp);
          if (rowIndex !== -1) {
            const y = headerHeight + (rowIndex + 0.5) * rowHeight;
            pts.push({ x, y, temp: entry.temp, day: d, session });
          } else {
            // Nearest proportional position
            const numTemps = temps.filter((t) => typeof t === 'number');
            if (numTemps.length >= 2) {
              const maxT = Math.max(...numTemps);
              const minT = Math.min(...numTemps);
              const ratio = (maxT - entry.temp) / (maxT - minT || 1);
              const clamped = Math.max(0, Math.min(1, ratio));
              const y = headerHeight + (clamped * (temps.length - 1) + 0.5) * rowHeight;
              pts.push({ x, y, temp: entry.temp, day: d, session });
            }
          }
        }
      });
    }
    return pts;
  }, [containerWidth, days, startDay, endDay, dataMap, temps]);

  const svgPolylinePoints = linePoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div
      ref={containerRef}
      className="hospital-sheet-page mx-auto w-full max-w-[1140px] rounded-2xl border border-slate-300 bg-white p-4 shadow-md transition-all select-none text-slate-900"
    >
      {/* Top hospital info line */}
      <div className="flex items-start justify-between text-[11px] leading-tight mb-2 border-b border-slate-100 pb-2">
        <div>
          <p className="font-bold text-slate-900">Bệnh viện Nhi Đồng 1</p>
          <p className="text-slate-600">Ban QLCLXN</p>
          <p className="font-semibold text-blue-900">Khoa Xét nghiệm Huyết Học</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-700">{specs.title}</p>
          <p className="text-[10px] text-slate-500 font-mono">{specs.code}</p>
        </div>
      </div>

      {/* Main Title */}
      <div className="text-center my-2">
        <h1 className="text-base font-black uppercase text-slate-900 tracking-wide">
          {specs.title}
        </h1>
        <div className="text-xs font-bold text-blue-700 mt-0.5">
          (TRANG {pageIndex}: NGÀY {startDay} - {endDay})
        </div>
      </div>

      {/* Metadata bar */}
      <div className="grid grid-cols-3 gap-3 text-xs mb-2.5 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200">
        <div>
          <p>
            <span className="font-bold text-slate-700">Loại tủ:</span>{' '}
            <span className="font-semibold text-blue-900 border-b border-dotted border-slate-400 pb-0.5">
              {cabinetName}
            </span>
          </p>
          <p className="mt-1">
            <span className="font-bold text-slate-700">Người quản lý:</span>{' '}
            <span className="font-semibold text-slate-800 border-b border-dotted border-slate-400 pb-0.5">
              {specs.managerCode}
            </span>
          </p>
        </div>
        <div className="text-center">
          <p>
            <span className="font-bold text-slate-700">Mã thiết bị:</span>{' '}
            <span className="font-semibold text-slate-800 border-b border-dotted border-slate-400 pb-0.5">
              {specs.deviceCode}
            </span>
          </p>
          <p className="mt-1">
            <span className="font-bold text-slate-700">Tiêu chuẩn:</span>{' '}
            <span className="font-bold text-emerald-700 border-b border-dotted border-slate-400 pb-0.5">
              {specs.standardTemp}
            </span>
          </p>
        </div>
        <div className="text-right">
          <p>
            <span className="font-bold text-slate-700">Tháng:</span>{' '}
            <span className="font-bold text-blue-700 border-b border-dotted border-slate-400 px-1 pb-0.5">
              {month}
            </span>{' '}
            <span className="font-bold text-slate-700">Năm:</span>{' '}
            <span className="font-bold text-blue-700 border-b border-dotted border-slate-400 px-1 pb-0.5">
              {year}
            </span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Lưu: <span className="font-bold">Mẫu BP</span> &bull; <span className="font-bold">Hóa chất</span>
          </p>
        </div>
      </div>

      {/* The Medical Grid Table with SVG Overlay */}
      <div className="relative border border-slate-400 rounded-lg overflow-hidden bg-white">
        {/* SVG Polyline Overlay */}
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          style={{ width: `${containerWidth}px` }}
        >
          {svgPolylinePoints && (
            <polyline
              points={svgPolylinePoints}
              fill="none"
              stroke="#dc2626"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {linePoints.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="3.5" fill="#dc2626" stroke="#ffffff" strokeWidth="1" />
            </g>
          ))}
        </svg>

        {/* HTML Table Grid */}
        <table className="w-full border-collapse text-center text-xs select-none" style={{ tableLayout: 'fixed' }}>
          <thead>
            {/* Header Row 1: Ngày trong tháng */}
            <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-400">
              <th className="w-[60px] border-r border-slate-400 py-1 font-bold text-[11px]">
                Nhiệt độ
              </th>
              <th colSpan={days * 2} className="py-1 font-bold text-[11px]">
                Ngày trong tháng ({startDay} - {endDay})
              </th>
            </tr>
            {/* Header Row 2: Days numbers */}
            <tr className="bg-slate-50 font-bold text-slate-700 border-b border-slate-300">
              <th className="w-[60px] border-r border-slate-400 py-0.5 text-[10px]" />
              {Array.from({ length: days }, (_, i) => (
                <th key={i} colSpan={2} className="border-r border-slate-300 py-0.5 text-[10px]">
                  {startDay + i}
                </th>
              ))}
            </tr>
            {/* Header Row 3: Sessions S and C */}
            <tr className="bg-slate-100/70 font-semibold text-slate-600 border-b border-slate-400">
              <th className="w-[60px] border-r border-slate-400 py-0.5 text-[10px]">Buổi</th>
              {Array.from({ length: days }, (_, i) => (
                <React.Fragment key={i}>
                  <th className="border-r border-slate-200 py-0.5 text-[10px] text-blue-700 font-bold">
                    S
                  </th>
                  <th className="border-r border-slate-300 py-0.5 text-[10px] text-amber-700 font-bold">
                    C
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {temps.map((t, rowIdx) => {
              if (t === 'sep') {
                return (
                  <tr key="sep" className="bg-slate-200 h-2 border-b border-slate-300">
                    <td colSpan={days * 2 + 1} className="py-0 text-[9px] text-slate-400">
                      --- Vùng phân cách nhiệt độ ---
                    </td>
                  </tr>
                );
              }

              const isBoundary = highlightTemps.includes(t);

              return (
                <tr
                  key={rowIdx}
                  className={`h-6 border-b border-slate-300 hover:bg-slate-50/50 ${
                    isBoundary ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Temperature label cell */}
                  <td
                    className={`w-[60px] border-r border-slate-400 font-bold text-[11px] ${
                      isBoundary ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    {t}°C
                  </td>

                  {/* Day session cells */}
                  {Array.from({ length: days }, (_, dayIdx) => {
                    const d = startDay + dayIdx;
                    const valS = dataMap[d]?.S?.temp;
                    const valC = dataMap[d]?.C?.temp;
                    const hasS = valS === t;
                    const hasC = valC === t;

                    return (
                      <React.Fragment key={d}>
                        <td
                          className={`relative border-r border-slate-200 p-0 ${
                            hasS ? 'bg-red-50/40' : ''
                          }`}
                          title={hasS ? `Ngày ${d} Sáng: ${valS}°C` : ''}
                        >
                          {hasS && (
                            <div className="mx-auto h-2 w-2 rounded-full bg-red-600 shadow-xs" />
                          )}
                        </td>
                        <td
                          className={`relative border-r border-slate-300 p-0 ${
                            hasC ? 'bg-red-50/40' : ''
                          }`}
                          title={hasC ? `Ngày ${d} Chiều: ${valC}°C` : ''}
                        >
                          {hasC && (
                            <div className="mx-auto h-2 w-2 rounded-full bg-red-600 shadow-xs" />
                          )}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}

            {/* Signature Row: Staff full names */}
            <tr className="h-16 border-t-2 border-slate-400 bg-white">
              <td className="w-[60px] border-r border-slate-400 font-bold text-[11px] text-slate-700 align-middle">
                Tên
              </td>
              {Array.from({ length: days }, (_, dayIdx) => {
                const d = startDay + dayIdx;
                const signS = dataMap[d]?.S?.sign || '';
                const signC = dataMap[d]?.C?.sign || '';

                return (
                  <React.Fragment key={d}>
                    <td
                      className="border-r border-slate-200 p-0.5 align-middle overflow-hidden text-center"
                      title={signS ? `Ngày ${d} S: ${signS}` : ''}
                    >
                      {signS && (
                        <span
                          className="inline-block text-[9px] font-bold text-blue-900 max-h-[58px] truncate"
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                          {signS}
                        </span>
                      )}
                    </td>
                    <td
                      className="border-r border-slate-300 p-0.5 align-middle overflow-hidden text-center"
                      title={signC ? `Ngày ${d} C: ${signC}` : ''}
                    >
                      {signC && (
                        <span
                          className="inline-block text-[9px] font-bold text-amber-900 max-h-[58px] truncate"
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                          {signC}
                        </span>
                      )}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>

            {/* Manager Row */}
            <tr className="h-8 border-t border-slate-300 bg-slate-50 font-bold text-xs text-slate-800">
              <td className="w-[60px] border-r border-slate-400 text-[10px] align-middle">
                Trưởng bộ phận
              </td>
              <td colSpan={days * 2} className="align-middle text-center font-bold text-blue-900">
                {specs.managerCode}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Note & footer */}
      <div className="flex items-center justify-between text-[10px] text-slate-500 italic mt-2">
        <p>* Ghi chú: S = Sáng (8:00), C = Chiều (16:00). Đánh dấu điểm nhiệt độ đo được.</p>
        <p>Ngày hiệu lực: 01/{month}/{year}</p>
      </div>
    </div>
  );
}

/**
 * Component: Hospital Room Sheet (Matching 16, 17, 18 .html templates)
 * Dual-scale: Temperature (15-32°C) and Humidity (15-100%)
 */
function HospitalRoomSheet({ specs, cabinetName, month, year, dataMap, chartRows }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1100);

  const tempScale = specs.tempScale || [
    32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15,
  ];
  const humScale = specs.humScale || [
    100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15,
  ];

  useEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth || 1100);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Compute SVG line points for Temperature (Blue) and Humidity (Red)
  const { tempLinePoints, humLinePoints } = useMemo(() => {
    const tPts = [];
    const hPts = [];
    const cornerWidth = 72; // Left 2 columns: T °C (34px) + Ẩm độ % (38px)
    const sessionColWidth = (containerWidth - cornerWidth) / (31 * 2);
    const headerHeight = 44; // 2 header rows
    const rowHeight = 19; // row height

    for (let d = 1; d <= 31; d++) {
      ['S', 'C'].forEach((session) => {
        const entry = dataMap[d]?.[session];
        if (!entry) return;

        const colIndex = (d - 1) * 2 + (session === 'C' ? 1 : 0);
        const x = cornerWidth + (colIndex + 0.5) * sessionColWidth;

        // Temperature point
        if (entry.temp !== null && entry.temp !== undefined) {
          const tRow = 32 - Math.round(entry.temp);
          if (tRow >= 0 && tRow < tempScale.length) {
            const y = headerHeight + (tRow + 0.5) * rowHeight;
            tPts.push({ x, y, temp: entry.temp, day: d, session });
          }
        }

        // Humidity point
        if (entry.hum !== null && entry.hum !== undefined) {
          const hRow = Math.round((100 - entry.hum) / 5);
          if (hRow >= 0 && hRow < humScale.length) {
            const y = headerHeight + (hRow + 0.5) * rowHeight;
            hPts.push({ x, y, hum: entry.hum, day: d, session });
          }
        }
      });
    }
    return { tempLinePoints: tPts, humLinePoints: hPts };
  }, [containerWidth, dataMap, tempScale.length, humScale.length]);

  const tempPolylinePoints = tempLinePoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const humPolylinePoints = humLinePoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  return (
    <div
      ref={containerRef}
      className="hospital-sheet-page mx-auto w-full max-w-[1200px] rounded-2xl border border-slate-300 bg-white p-4 shadow-md transition-all select-none text-slate-900"
    >
      {/* Top hospital info line */}
      <div className="flex items-start justify-between text-[11px] leading-tight mb-2 border-b border-slate-100 pb-2">
        <div>
          <p className="font-bold text-slate-900">Bệnh viện Nhi Đồng 1</p>
          <p className="font-semibold text-blue-900">Khoa Xét nghiệm Huyết Học</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-slate-700">{specs.title}</p>
          <p className="text-[10px] text-slate-500 font-mono">{specs.code}</p>
        </div>
      </div>

      {/* Main Title */}
      <div className="text-center my-2">
        <h1 className="text-base font-black uppercase text-slate-900 tracking-wide underline">
          {specs.title}
        </h1>
      </div>

      {/* Metadata bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <div>
          <span className="font-bold text-slate-600">Nhiệt độ chuẩn:</span>{' '}
          <span className="font-black text-blue-700">{specs.standardTemp}</span>
        </div>
        <div>
          <span className="font-bold text-slate-600">Độ ẩm chuẩn:</span>{' '}
          <span className="font-black text-rose-600">{specs.standardHumidity}</span>
        </div>
        <div>
          <span className="font-bold text-slate-600">Mã nhiệt ẩm kế:</span>{' '}
          <span className="font-bold text-slate-800">{specs.deviceCode}</span>
        </div>
        <div className="text-right">
          <span className="font-bold text-slate-600">Tháng:</span>{' '}
          <span className="font-black text-blue-700 px-1">{month}</span> &bull;{' '}
          <span className="font-bold text-slate-600">Năm:</span>{' '}
          <span className="font-black text-blue-700 px-1">{year}</span>
        </div>
      </div>

      {/* The Medical Grid Table with SVG Overlay */}
      <div className="relative border border-slate-400 rounded-lg overflow-hidden bg-white">
        {/* SVG Overlay for Dual Lines */}
        <svg
          className="pointer-events-none absolute inset-0 z-10 h-full w-full"
          style={{ width: `${containerWidth}px` }}
        >
          {/* Blue line: Temperature */}
          {tempPolylinePoints && (
            <polyline
              points={tempPolylinePoints}
              fill="none"
              stroke="#0056b3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {tempLinePoints.map((p, idx) => (
            <circle key={`t-${idx}`} cx={p.x} cy={p.y} r="3" fill="#0056b3" stroke="#ffffff" strokeWidth="1" />
          ))}

          {/* Red line: Humidity */}
          {humPolylinePoints && (
            <polyline
              points={humPolylinePoints}
              fill="none"
              stroke="#d32f2f"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {humLinePoints.map((p, idx) => (
            <circle key={`h-${idx}`} cx={p.x} cy={p.y} r="3" fill="#d32f2f" stroke="#ffffff" strokeWidth="1" />
          ))}
        </svg>

        {/* HTML Table Grid */}
        <table className="w-full border-collapse text-center text-xs select-none" style={{ tableLayout: 'fixed' }}>
          <thead>
            {/* Header Row 1: Ngày (1 to 31) */}
            <tr className="bg-slate-100 font-bold text-slate-800 border-b border-slate-400">
              <th colSpan={2} className="w-[72px] border-r border-slate-400 py-1 font-bold text-[10px]">
                Ngày
              </th>
              {Array.from({ length: 31 }, (_, i) => (
                <th key={i} colSpan={2} className="border-r border-slate-300 py-1 font-bold text-[10px]">
                  {i + 1}
                </th>
              ))}
            </tr>
            {/* Header Row 2: T °C | Ẩm độ % | S | C */}
            <tr className="bg-slate-50 font-bold text-[9px] border-b border-slate-400">
              <th className="w-[34px] border-r border-slate-300 py-0.5 text-blue-900 font-black">
                T ºC
              </th>
              <th className="w-[38px] border-r border-slate-400 py-0.5 text-rose-600 font-black">
                Ẩm %
              </th>
              {Array.from({ length: 31 }, (_, i) => (
                <React.Fragment key={i}>
                  <th className="border-r border-slate-200 py-0.5 text-blue-700 font-bold">
                    S
                  </th>
                  <th className="border-r border-slate-300 py-0.5 text-amber-700 font-bold">
                    C
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody>
            {tempScale.map((t, rowIdx) => {
              const h = humScale[rowIdx];
              const isHeavyBorder = t === 26 || t === 20;

              return (
                <tr
                  key={rowIdx}
                  className={`h-[19px] border-b ${
                    isHeavyBorder ? 'border-b-2 border-b-slate-900 bg-emerald-50/20' : 'border-b-slate-200'
                  }`}
                >
                  {/* Temp Axis Label */}
                  <td className="w-[34px] border-r border-slate-300 font-bold text-[10px] text-slate-900">
                    {t}
                  </td>
                  {/* Humidity Axis Label */}
                  <td className="w-[38px] border-r border-slate-400 font-bold text-[10px] text-rose-600">
                    {h}
                  </td>

                  {/* Day session cells */}
                  {Array.from({ length: 31 }, (_, dayIdx) => {
                    const d = dayIdx + 1;
                    const valS = dataMap[d]?.S;
                    const valC = dataMap[d]?.C;
                    const hasTempS = valS?.temp !== null && Math.round(valS?.temp) === t;
                    const hasTempC = valC?.temp !== null && Math.round(valC?.temp) === t;
                    const hasHumS = valS?.hum !== null && Math.round((100 - valS?.hum) / 5) === rowIdx;
                    const hasHumC = valC?.hum !== null && Math.round((100 - valC?.hum) / 5) === rowIdx;

                    return (
                      <React.Fragment key={d}>
                        <td className="relative border-r border-slate-100 p-0">
                          {hasTempS && (
                            <div className="mx-auto h-2 w-2 rounded-full bg-blue-700" title={`Nhiệt độ: ${valS.temp}°C`} />
                          )}
                          {hasHumS && (
                            <div className="mx-auto h-2 w-2 rounded-full bg-rose-600 mt-0.5" title={`Độ ẩm: ${valS.hum}%`} />
                          )}
                        </td>
                        <td className="relative border-r border-slate-300 p-0">
                          {hasTempC && (
                            <div className="mx-auto h-2 w-2 rounded-full bg-blue-700" title={`Nhiệt độ: ${valC.temp}°C`} />
                          )}
                          {hasHumC && (
                            <div className="mx-auto h-2 w-2 rounded-full bg-rose-600 mt-0.5" title={`Độ ẩm: ${valC.hum}%`} />
                          )}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              );
            })}

            {/* Signature Row: Staff full names */}
            <tr className="h-16 border-t-2 border-slate-400 bg-white">
              <td colSpan={2} className="w-[72px] border-r border-slate-400 font-bold text-[10px] text-slate-700 align-middle">
                Người ghi
              </td>
              {Array.from({ length: 31 }, (_, dayIdx) => {
                const d = dayIdx + 1;
                const signS = dataMap[d]?.S?.sign || '';
                const signC = dataMap[d]?.C?.sign || '';

                return (
                  <React.Fragment key={d}>
                    <td className="border-r border-slate-200 p-0.5 align-middle overflow-hidden text-center">
                      {signS && (
                        <span
                          className="inline-block text-[9px] font-bold text-blue-900 max-h-[58px] truncate"
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                          {signS}
                        </span>
                      )}
                    </td>
                    <td className="border-r border-slate-300 p-0.5 align-middle overflow-hidden text-center">
                      {signC && (
                        <span
                          className="inline-block text-[9px] font-bold text-amber-900 max-h-[58px] truncate"
                          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                        >
                          {signC}
                        </span>
                      )}
                    </td>
                  </React.Fragment>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Legend & instructions */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 border-t border-slate-200 pt-2 mt-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-blue-800">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-700 inline-block" /> Chấm xanh: Nhiệt độ
          </span>
          <span className="flex items-center gap-1.5 font-bold text-rose-700">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-600 inline-block" /> Chấm đỏ: Ẩm độ
          </span>
          <span>S (Sáng): 7:30 - 8:00 &bull; C (Chiều): 15:30 - 16:00</span>
        </div>
        <div>
          <span>Người quản lý: <strong>{specs.managerCode}</strong></span>
        </div>
      </div>
    </div>
  );
}

/**
 * Component: Modern Interactive Curve Chart with Stats and Hover Tooltips
 */
function InteractiveCurveView({
  chartRows,
  specs,
  resolvedCabinet,
  resolvedMonth,
  hoveredPoint,
  setHoveredPoint,
  getStaffDisplayName,
}) {
  const chartWidth = 980;
  const chartHeight = 380;
  const padding = { top: 45, right: 65, bottom: 65, left: 65 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Y Scale calculation
  const { yMin, yMax, yTicks } = useMemo(() => {
    const values = [];
    chartRows.forEach((r) => {
      const t = Number(r.nhiet_do_do_dc);
      if (!isNaN(t)) values.push(t);
    });

    if (specs.tempMin !== undefined && specs.tempMax !== undefined) {
      values.push(specs.tempMin, specs.tempMax);
    } else if (specs.highlightTemps) {
      values.push(...specs.highlightTemps);
    }

    if (values.length === 0) {
      return { yMin: 0, yMax: 10, yTicks: [0, 2, 4, 6, 8, 10] };
    }

    let min = Math.min(...values);
    let max = Math.max(...values);
    const span = max - min || 1;
    min = Math.floor(min - span * 0.15);
    max = Math.ceil(max + span * 0.15);

    const step = Math.max(1, Math.round((max - min) / 5));
    const ticks = [];
    for (let v = min; v <= max; v += step) {
      ticks.push(v);
    }
    if (!ticks.includes(max)) ticks.push(max);

    return { yMin: min, yMax: max, yTicks: ticks };
  }, [chartRows, specs]);

  const getY = (val) => {
    if (yMax === yMin) return padding.top + innerHeight / 2;
    const ratio = (val - yMin) / (yMax - yMin);
    return padding.top + innerHeight - ratio * innerHeight;
  };

  const getX = (idx, total) => {
    if (total <= 1) return padding.left + innerWidth / 2;
    return padding.left + (idx / (total - 1)) * innerWidth;
  };

  // Build connecting curve
  const { linePath, areaPath, pointsData } = useMemo(() => {
    if (chartRows.length === 0) {
      return { linePath: '', areaPath: '', pointsData: [] };
    }

    const points = chartRows.map((r, idx) => ({
      x: getX(idx, chartRows.length),
      y: getY(Number(r.nhiet_do_do_dc) || 0),
      row: r,
      idx,
    }));

    if (points.length === 1) {
      const p = points[0];
      return {
        linePath: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y}`,
        areaPath: `M ${p.x - 20} ${padding.top + innerHeight} L ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y} L ${p.x + 20} ${padding.top + innerHeight} Z`,
        pointsData: points,
      };
    }

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      const midX = (p0.x + p1.x) / 2;
      d += ` C ${midX} ${p0.y}, ${midX} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = padding.top + innerHeight;
    const area = `${d} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;

    return { linePath: d, areaPath: area, pointsData: points };
  }, [chartRows, yMin, yMax]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="relative w-full min-h-[380px] overflow-hidden select-none">
        {chartRows.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-2 text-slate-400">
            <Thermometer className="h-12 w-12 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">
              Không có dữ liệu nhiệt độ cho thiết bị này trong tháng {resolvedMonth}
            </p>
          </div>
        ) : (
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yTicks.map((tickVal) => {
              const y = getY(tickVal);
              return (
                <g key={tickVal}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + innerWidth}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />
                  <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="11" fontWeight="600" fill="#64748b">
                    {tickVal}°C
                  </text>
                </g>
              );
            })}

            {/* Area fill */}
            {areaPath && <path d={areaPath} fill="url(#tempAreaGradient)" />}

            {/* Curve line */}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points */}
            {pointsData.map((p) => {
              const isPass = (p.row.ket_qua || '').toUpperCase() === 'ĐẠT';
              const isHovered = hoveredPoint?.idx === p.idx;

              return (
                <g
                  key={p.idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(p)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  {isHovered && (
                    <circle cx={p.x} cy={p.y} r="12" fill={isPass ? '#dbeafe' : '#fee2e2'} opacity="0.8" />
                  )}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? '6' : '4.5'}
                    fill={isPass ? '#2563eb' : '#ef4444'}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  {/* Date label */}
                  <g transform={`translate(${p.x}, ${padding.top + innerHeight + 16})`}>
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill={isHovered ? '#1e40af' : '#475569'}
                    >
                      {(p.row.ngay || '').split('/')[0] || p.idx + 1}
                    </text>
                    <text
                      x="0"
                      y="14"
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill={p.row.khung_h === 'Sáng' ? '#2563eb' : '#d97706'}
                    >
                      {p.row.khung_h ? p.row.khung_h.charAt(0) : ''}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        )}

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-20 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-xs text-xs animate-fade-in-up"
            style={{
              left: `${Math.min(chartWidth - 220, Math.max(20, (hoveredPoint.x / chartWidth) * 100))}%`,
              top: `${Math.max(10, Math.min(220, (hoveredPoint.y / chartHeight) * 100 - 30))}%`,
              minWidth: '200px',
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
              <span className="font-extrabold text-slate-800">
                {hoveredPoint.row.ngay_h || hoveredPoint.row.ngay}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  (hoveredPoint.row.ket_qua || '').toUpperCase() === 'ĐẠT'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {hoveredPoint.row.ket_qua || 'Chưa đánh giá'}
              </span>
            </div>

            <div className="space-y-1 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Khung giờ:</span>
                <span className="font-bold text-slate-800">{hoveredPoint.row.khung_h || '—'}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-400">Nhiệt độ đo:</span>
                <span className="text-sm font-black text-blue-600">{hoveredPoint.row.nhiet_do_do_dc}°C</span>
              </div>
              {hoveredPoint.row.do_am_do_dc && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Độ ẩm đo:</span>
                  <span className="font-semibold text-slate-700">{hoveredPoint.row.do_am_do_dc}%</span>
                </div>
              )}
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-slate-400 shrink-0">Nhân viên:</span>
                <span className="font-semibold text-slate-800 text-right truncate">
                  {getStaffDisplayName
                    ? getStaffDisplayName(hoveredPoint.row.id_nv)
                    : hoveredPoint.row.id_nv || '—'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
