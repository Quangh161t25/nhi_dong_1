import React, { useState, useMemo } from 'react';
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
  Sparkles,
  Clock,
  User,
  Info,
} from 'lucide-react';

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

  // Reference row to get cabinet metadata (min, max thresholds, location)
  const cabinetMeta = useMemo(() => {
    if (!resolvedCabinet) return null;
    const target = cleanStr(resolvedCabinet);
    const row = dataRows.find(
      (r) => cleanStr(r.ten) === target || cleanStr(r.id_tu) === target
    );
    if (!row) return null;
    return {
      ten: row.ten || resolvedCabinet,
      id_tu: row.id_tu || '',
      vi_tri: row.vi_tri || '',
      nhiet_do_min:
        row.nhiet_do_min !== '' && !isNaN(Number(row.nhiet_do_min))
          ? Number(row.nhiet_do_min)
          : null,
      nhiet_do_max:
        row.nhiet_do_max !== '' && !isNaN(Number(row.nhiet_do_max))
          ? Number(row.nhiet_do_max)
          : null,
      do_am_min: row.do_am_min || '',
      do_am_max: row.do_am_max || '',
    };
  }, [dataRows, resolvedCabinet]);

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

  // Calculated metrics
  const stats = useMemo(() => {
    const total = chartRows.length;
    let datCount = 0;
    let warningCount = 0;
    const temps = [];

    chartRows.forEach((r) => {
      const kq = (r.ket_qua || '').toUpperCase();
      if (kq === 'ĐẠT') datCount++;
      else warningCount++;

      const t = Number(r.nhiet_do_do_dc);
      if (!isNaN(t)) temps.push(t);
    });

    const datRate = total > 0 ? ((datCount / total) * 100).toFixed(1) : 0;
    const minTemp = temps.length > 0 ? Math.min(...temps) : null;
    const maxTemp = temps.length > 0 ? Math.max(...temps) : null;
    const avgTemp =
      temps.length > 0
        ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
        : null;

    return { total, datCount, warningCount, datRate, minTemp, maxTemp, avgTemp };
  }, [chartRows]);

  // SVG Chart Dimensions & Coordinates
  const chartWidth = 980;
  const chartHeight = 380;
  const padding = { top: 45, right: 65, bottom: 65, left: 65 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Calculate Y min and max
  const { yMin, yMax, yTicks } = useMemo(() => {
    const values = [];
    chartRows.forEach((r) => {
      const t = Number(r.nhiet_do_do_dc);
      if (!isNaN(t)) values.push(t);
    });

    if (cabinetMeta?.nhiet_do_min !== null && cabinetMeta?.nhiet_do_min !== undefined) {
      values.push(cabinetMeta.nhiet_do_min);
    }
    if (cabinetMeta?.nhiet_do_max !== null && cabinetMeta?.nhiet_do_max !== undefined) {
      values.push(cabinetMeta.nhiet_do_max);
    }

    if (values.length === 0) {
      return { yMin: 0, yMax: 10, yTicks: [0, 2, 4, 6, 8, 10] };
    }

    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const span = maxV - minV;
    const buffer = Math.max(1, Math.ceil(span * 0.2));

    const computedMin = Math.floor(minV - buffer);
    const computedMax = Math.ceil(maxV + buffer);

    // Generate 5 ticks
    const step = (computedMax - computedMin) / 4;
    const ticks = [];
    for (let i = 0; i <= 4; i++) {
      ticks.push(Number((computedMin + step * i).toFixed(1)));
    }

    return { yMin: computedMin, yMax: computedMax, yTicks: ticks };
  }, [chartRows, cabinetMeta]);

  // Coordinate converters
  const getY = (val) => {
    if (yMax === yMin) return padding.top + innerHeight / 2;
    const ratio = (val - yMin) / (yMax - yMin);
    return padding.top + innerHeight - ratio * innerHeight;
  };

  const getX = (index, total) => {
    if (total <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (total - 1)) * innerWidth;
  };

  // Generate SVG path for line and area
  const { linePath, areaPath, pointsData } = useMemo(() => {
    if (chartRows.length === 0) {
      return { linePath: '', areaPath: '', pointsData: [] };
    }

    const points = chartRows.map((r, idx) => {
      const tempVal = Number(r.nhiet_do_do_dc);
      const x = getX(idx, chartRows.length);
      const y = isNaN(tempVal) ? getY(0) : getY(tempVal);
      return { x, y, val: tempVal, row: r, idx };
    });

    if (points.length === 1) {
      const p = points[0];
      return {
        linePath: `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y}`,
        areaPath: `M ${p.x - 20} ${padding.top + innerHeight} L ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y} L ${p.x + 20} ${padding.top + innerHeight} Z`,
        pointsData: points,
      };
    }

    // Build smooth curve or straight lines
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];
      // Catmull-Rom or cubic Bezier
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
    <div className="flex flex-1 flex-col overflow-auto bg-slate-50/60 p-4 space-y-4">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Title & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Biểu Đồ Theo Dõi Nhiệt Độ Theo Tháng
                </h2>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                  Khoa Xét Nghiệm Huyết Học
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Dữ liệu giám sát nhiệt độ tự động đồng bộ theo từng tủ và từng tháng
              </p>
            </div>
          </div>

          {/* Right: Selectors for Cabinet & Month */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Cabinet selector */}
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs">
              <Thermometer className="h-4 w-4 text-blue-600" />
              <span className="font-semibold text-slate-600">Tủ:</span>
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

            {/* Print button */}
            <button
              type="button"
              onClick={() => window.print()}
              title="In biểu đồ này"
              className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              <span className="hidden sm:inline">In biểu đồ</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Ngưỡng an toàn */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 truncate">
            Ngưỡng quy định
          </p>
          <p className="mt-1 text-base font-extrabold text-blue-600 truncate">
            {cabinetMeta?.nhiet_do_min !== null && cabinetMeta?.nhiet_do_max !== null
              ? `${cabinetMeta.nhiet_do_min}°C ~ ${cabinetMeta.nhiet_do_max}°C`
              : 'Chưa cài đặt'}
          </p>
          <p className="text-[10px] text-slate-400 truncate">
            {cabinetMeta?.vi_tri ? `Vị trí: ${cabinetMeta.vi_tri}` : '—'}
          </p>
        </div>

        {/* Card 2: Tổng lượt đo */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 truncate">
            Lượt đo trong tháng
          </p>
          <p className="mt-1 text-base font-extrabold text-slate-900">
            {stats.total} <span className="text-xs font-medium text-slate-500">lượt</span>
          </p>
          <p className="text-[10px] text-slate-400">
            Tháng {resolvedMonth}
          </p>
        </div>

        {/* Card 3: Tỷ lệ đạt */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-800 truncate">
            Tỷ lệ đạt chuẩn
          </p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-base font-extrabold text-emerald-700">
              {stats.datRate}%
            </span>
            <span className="text-[10px] font-bold text-emerald-600">
              ({stats.datCount}/{stats.total})
            </span>
          </div>
          <p className="text-[10px] text-emerald-600/80">
            {stats.warningCount > 0 ? `${stats.warningCount} lần cảnh báo` : 'Đạt 100% tiêu chuẩn'}
          </p>
        </div>

        {/* Card 4: Nhiệt độ thấp nhất */}
        <div className="rounded-2xl border border-cyan-200 bg-cyan-50/50 p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-cyan-800 truncate">
            Nhiệt độ đo Min
          </p>
          <p className="mt-1 text-base font-extrabold text-cyan-700">
            {stats.minTemp !== null ? `${stats.minTemp}°C` : '—'}
          </p>
          <p className="text-[10px] text-cyan-600/80">
            Thấp nhất ghi nhận
          </p>
        </div>

        {/* Card 5: Nhiệt độ cao nhất */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-rose-800 truncate">
            Nhiệt độ đo Max
          </p>
          <p className="mt-1 text-base font-extrabold text-rose-700">
            {stats.maxTemp !== null ? `${stats.maxTemp}°C` : '—'}
          </p>
          <p className="text-[10px] text-rose-600/80">
            Cao nhất ghi nhận
          </p>
        </div>

        {/* Card 6: Nhiệt độ trung bình */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-3.5 shadow-xs">
          <p className="text-[11px] font-semibold text-indigo-800 truncate">
            Nhiệt độ trung bình
          </p>
          <p className="mt-1 text-base font-extrabold text-indigo-700">
            {stats.avgTemp !== null ? `${stats.avgTemp}°C` : '—'}
          </p>
          <p className="text-[10px] text-indigo-600/80">
            Toàn bộ các lần đo
          </p>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col">
        {/* Chart Subtitle & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-800">
              Đường biểu diễn nhiệt độ theo thời gian
            </span>
            <span className="text-xs text-slate-400">
              ({chartRows.length} điểm đo trong tháng {resolvedMonth})
            </span>
          </div>

          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
            {/* Safe zone legend */}
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-5 rounded bg-emerald-100 border border-emerald-300" />
              <span>Vùng nhiệt độ an toàn</span>
            </div>

            {/* Measured curve legend */}
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 bg-blue-600" />
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
              <span>Nhiệt độ đo (°C)</span>
            </div>

            {/* Threshold line legend */}
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-red-500" />
              <span>Ngưỡng Max</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-blue-500" />
              <span>Ngưỡng Min</span>
            </div>
          </div>
        </div>

        {/* SVG Canvas Container */}
        {chartRows.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center gap-2 text-slate-400">
            <Thermometer className="h-12 w-12 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">
              Không có dữ liệu nhiệt độ cho tủ này trong tháng {resolvedMonth}
            </p>
            <p className="text-xs">
              Vui lòng chọn thiết bị khác hoặc tháng khác để xem biểu đồ.
            </p>
          </div>
        ) : (
          <div className="relative flex-1 w-full min-h-[360px] overflow-hidden select-none">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Area Gradient under curve */}
                <linearGradient id="tempAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>

                {/* Safe Zone Gradient */}
                <linearGradient id="safeZoneGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.06" />
                </linearGradient>

                {/* Glow Filter for Points */}
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Horizontal Grid lines and Y labels */}
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
                    <text
                      x={padding.left - 10}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fontWeight="600"
                      fill="#64748b"
                    >
                      {tickVal}°C
                    </text>
                  </g>
                );
              })}

              {/* Safe Zone Rectangle */}
              {cabinetMeta?.nhiet_do_min !== null &&
                cabinetMeta?.nhiet_do_max !== null && (
                  <g>
                    <rect
                      x={padding.left}
                      y={getY(cabinetMeta.nhiet_do_max)}
                      width={innerWidth}
                      height={Math.max(
                        4,
                        getY(cabinetMeta.nhiet_do_min) -
                          getY(cabinetMeta.nhiet_do_max)
                      )}
                      fill="url(#safeZoneGradient)"
                      rx="4"
                    />
                    <text
                      x={padding.left + 10}
                      y={
                        getY(cabinetMeta.nhiet_do_max) +
                        Math.max(
                          16,
                          (getY(cabinetMeta.nhiet_do_min) -
                            getY(cabinetMeta.nhiet_do_max)) /
                            2 +
                            4
                        )
                      }
                      fill="#059669"
                      fontSize="10"
                      fontWeight="bold"
                      opacity="0.75"
                    >
                      VÙNG TIÊU CHUẨN ({cabinetMeta.nhiet_do_min}°C ~ {cabinetMeta.nhiet_do_max}°C)
                    </text>
                  </g>
                )}

              {/* Threshold Upper Line (Max) */}
              {cabinetMeta?.nhiet_do_max !== null && (
                <g>
                  <line
                    x1={padding.left}
                    y1={getY(cabinetMeta.nhiet_do_max)}
                    x2={padding.left + innerWidth}
                    y2={getY(cabinetMeta.nhiet_do_max)}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <rect
                    x={padding.left + innerWidth - 85}
                    y={getY(cabinetMeta.nhiet_do_max) - 18}
                    width="85"
                    height="16"
                    rx="4"
                    fill="#fee2e2"
                  />
                  <text
                    x={padding.left + innerWidth - 42}
                    y={getY(cabinetMeta.nhiet_do_max) - 6}
                    textAnchor="middle"
                    fill="#dc2626"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    Max: {cabinetMeta.nhiet_do_max}°C
                  </text>
                </g>
              )}

              {/* Threshold Lower Line (Min) */}
              {cabinetMeta?.nhiet_do_min !== null && (
                <g>
                  <line
                    x1={padding.left}
                    y1={getY(cabinetMeta.nhiet_do_min)}
                    x2={padding.left + innerWidth}
                    y2={getY(cabinetMeta.nhiet_do_min)}
                    stroke="#2563eb"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                  />
                  <rect
                    x={padding.left + innerWidth - 85}
                    y={getY(cabinetMeta.nhiet_do_min) + 3}
                    width="85"
                    height="16"
                    rx="4"
                    fill="#dbeafe"
                  />
                  <text
                    x={padding.left + innerWidth - 42}
                    y={getY(cabinetMeta.nhiet_do_min) + 15}
                    textAnchor="middle"
                    fill="#1d4ed8"
                    fontSize="10"
                    fontWeight="bold"
                  >
                    Min: {cabinetMeta.nhiet_do_min}°C
                  </text>
                </g>
              )}

              {/* Area fill under curve */}
              {areaPath && (
                <path d={areaPath} fill="url(#tempAreaGradient)" />
              )}

              {/* Main Connecting Curve */}
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

              {/* Points on Curve */}
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
                    {/* Pulsing ring for warning points */}
                    {!isPass && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="11"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.5"
                        opacity="0.75"
                        className="animate-ping"
                      />
                    )}

                    {/* Outer hover highlight */}
                    {isHovered && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="12"
                        fill={isPass ? '#dbeafe' : '#fee2e2'}
                        opacity="0.8"
                      />
                    )}

                    {/* Main Circle */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? '6' : '4.5'}
                      fill={isPass ? '#2563eb' : '#ef4444'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />

                    {/* Shift & Day label on X axis */}
                    <g transform={`translate(${p.x}, ${padding.top + innerHeight + 16})`}>
                      {/* Date label (e.g. 01/05) */}
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
                      {/* Shift badge */}
                      <text
                        x="0"
                        y="14"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill={
                          p.row.khung_h === 'Sáng'
                            ? '#2563eb'
                            : p.row.khung_h === 'Chiều'
                            ? '#d97706'
                            : '#64748b'
                        }
                      >
                        {p.row.khung_h ? p.row.khung_h.charAt(0) : ''}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Hover indicator vertical line */}
              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={padding.top}
                  x2={hoveredPoint.x}
                  y2={padding.top + innerHeight}
                  stroke="#94a3b8"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
              )}
            </svg>

            {/* Floating Interactive Tooltip */}
            {hoveredPoint && (
              <div
                className="pointer-events-none absolute z-20 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-xs text-xs animate-fade-in-up"
                style={{
                  left: `${Math.min(
                    chartWidth - 220,
                    Math.max(20, (hoveredPoint.x / chartWidth) * 100)
                  )}%`,
                  top: `${Math.max(
                    10,
                    Math.min(220, (hoveredPoint.y / chartHeight) * 100 - 30)
                  )}%`,
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
                    <span className="font-bold text-slate-800">
                      {hoveredPoint.row.khung_h || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-400">Nhiệt độ đo:</span>
                    <span className="text-sm font-black text-blue-600">
                      {hoveredPoint.row.nhiet_do_do_dc}°C
                    </span>
                  </div>
                  {hoveredPoint.row.do_am_do_dc && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Độ ẩm đo:</span>
                      <span className="font-semibold text-slate-700">
                        {hoveredPoint.row.do_am_do_dc}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngưỡng chuẩn:</span>
                    <span className="font-medium text-slate-700">
                      {hoveredPoint.row.nhiet_do_min && hoveredPoint.row.nhiet_do_max
                        ? `${hoveredPoint.row.nhiet_do_min}°C ~ ${hoveredPoint.row.nhiet_do_max}°C`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-slate-400 shrink-0">Nhân viên:</span>
                    <span className="font-semibold text-slate-800 text-right truncate">
                      {getStaffDisplayName
                        ? getStaffDisplayName(hoveredPoint.row.id_nv)
                        : hoveredPoint.row.id_nv || '—'}
                    </span>
                  </div>
                  {hoveredPoint.row.ghi_chu && (
                    <div className="pt-1 text-[11px] text-amber-600 italic">
                      Ghi chú: {hoveredPoint.row.ghi_chu}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Legend Explanation */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <strong>Ký hiệu trục X:</strong> Số ngày trong tháng (1, 2, ..., 31)
            </span>
            <span>
              <strong className="text-blue-600">S:</strong> Ca Sáng &bull;{' '}
              <strong className="text-amber-600">C:</strong> Ca Chiều
            </span>
          </div>
          <div>
            * Biểu đồ tự động cập nhật khi đổi bộ lọc tủ hoặc tháng từ thanh công cụ.
          </div>
        </div>
      </div>
    </div>
  );
}
