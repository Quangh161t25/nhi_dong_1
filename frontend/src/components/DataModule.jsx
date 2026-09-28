import React, { useState, useEffect, useMemo } from 'react';
import {
  List,
  BarChart3,
  ArrowLeft,
  Search,
  Building2,
  Clock,
  Tag,
  Printer,
  Download,
  RotateCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  X,
  ExternalLink,
} from 'lucide-react';
import { fetchDataRows } from '../services/googleSheets';

export default function DataModule({ onBack, onOpenForm }) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'stats'
  const [dataRows, setDataRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterViTri, setFilterViTri] = useState('ALL');
  const [filterKhungH, setFilterKhungH] = useState('ALL');
  const [filterKetQua, setFilterKetQua] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [previewSignature, setPreviewSignature] = useState(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const rows = await fetchDataRows();
      setDataRows(rows);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải dữ liệu sheet DATA: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter locations
  const viTriList = useMemo(() => {
    const set = new Set();
    dataRows.forEach((r) => {
      if (r.vi_tri) set.add(r.vi_tri.trim());
    });
    return Array.from(set);
  }, [dataRows]);

  // Filter shifts
  const khungHList = useMemo(() => {
    const set = new Set();
    dataRows.forEach((r) => {
      if (r.khung_h) set.add(r.khung_h.trim());
    });
    return Array.from(set);
  }, [dataRows]);

  // Filtered Rows
  const filteredRows = useMemo(() => {
    return dataRows.filter((r) => {
      // Search
      const search = searchTerm.trim().toLowerCase();
      if (search) {
        const matchesTen = r.ten.toLowerCase().includes(search);
        const matchesId = r.id_tu.toLowerCase().includes(search);
        const matchesViTri = r.vi_tri.toLowerCase().includes(search);
        const matchesNv = r.id_nv.toLowerCase().includes(search);
        if (!matchesTen && !matchesId && !matchesViTri && !matchesNv) {
          return false;
        }
      }

      // Filter Vi Tri
      if (filterViTri !== 'ALL' && r.vi_tri.trim() !== filterViTri) {
        return false;
      }

      // Filter Khung H
      if (filterKhungH !== 'ALL' && r.khung_h.trim() !== filterKhungH) {
        return false;
      }

      // Filter Ket Qua
      if (filterKetQua !== 'ALL') {
        const kq = (r.ket_qua || '').trim().toUpperCase();
        if (kq !== filterKetQua) return false;
      }

      return true;
    });
  }, [dataRows, searchTerm, filterViTri, filterKhungH, filterKetQua]);

  // Checkbox toggle
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredRows.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRows.map((r) => r.id || r.rowIndex)));
    }
  };

  const toggleSelectRow = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredRows.length) {
      alert('Không có dữ liệu để xuất.');
      return;
    }
    const headers = [
      'ID',
      'Ngày',
      'Ngày Giờ',
      'Khung Giờ',
      'Mã QR',
      'ID Tủ',
      'Tên Tủ',
      'Vị Trí',
      'Min (°C)',
      'Max (°C)',
      'Nhiệt Độ Đo (°C)',
      'Độ Ẩm Min (%)',
      'Độ Ẩm Max (%)',
      'Độ Ẩm Đo (%)',
      'Kết Quả',
      'Mã NV',
      'Ghi Chú',
    ];

    const rows = filteredRows.map((r) => [
      `"${r.id}"`,
      `"${r.ngay}"`,
      `"${r.ngay_h}"`,
      `"${r.khung_h}"`,
      `"${r.qr_code}"`,
      `"${r.id_tu}"`,
      `"${r.ten}"`,
      `"${r.vi_tri}"`,
      `"${r.nhiet_do_min}"`,
      `"${r.nhiet_do_max}"`,
      `"${r.nhiet_do_do_dc}"`,
      `"${r.do_am_min}"`,
      `"${r.do_am_max}"`,
      `"${r.do_am_do_dc}"`,
      `"${r.ket_qua}"`,
      `"${r.id_nv}"`,
      `"${(r.ghi_chu || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DATA_NHIET_DO_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistics calculation
  const stats = useMemo(() => {
    const total = dataRows.length;
    let datCount = 0;
    let thapCount = 0;
    let caoCount = 0;

    dataRows.forEach((r) => {
      const kq = (r.ket_qua || '').toUpperCase();
      if (kq === 'ĐẠT') datCount++;
      else if (kq === 'THẤP') thapCount++;
      else if (kq === 'CAO') caoCount++;
    });

    const datRate = total > 0 ? ((datCount / total) * 100).toFixed(1) : 0;

    return { total, datCount, thapCount, caoCount, datRate };
  }, [dataRows]);

  return (
    <div className="flex h-full flex-col space-y-3 animate-fade-in-up">
      {/* Top Tabs matching Image 2 */}
      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-xl border border-slate-200 bg-slate-100/80 p-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition-all ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            <span>Danh sách</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-bold transition-all ${
              activeTab === 'stats'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Thống kê</span>
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Tổng cộng:{' '}
          <span className="font-extrabold text-blue-600">
            {filteredRows.length}
          </span>{' '}
          / {dataRows.length} bản ghi
        </div>
      </div>

      {/* Main Container Card matching Image 2 */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {/* Toolbar matching Image 2 */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          {/* Left tools: Back button, Search, Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại</span>
            </button>

            {/* Search Input */}
            <div className="relative w-64 max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên tủ, vị trí, NV..."
                className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Filter Vị trí */}
            <div className="relative">
              <select
                value={filterViTri}
                onChange={(e) => setFilterViTri(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">Vị trí: Tất cả</option>
                {viTriList.map((vt) => (
                  <option key={vt} value={vt}>
                    {vt}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Khung Giờ */}
            <div className="relative">
              <select
                value={filterKhungH}
                onChange={(e) => setFilterKhungH(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">Khung giờ: Tất cả</option>
                {khungHList.map((kh) => (
                  <option key={kh} value={kh}>
                    {kh}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Trạng thái */}
            <div className="relative">
              <select
                value={filterKetQua}
                onChange={(e) => setFilterKetQua(e.target.value)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 focus:border-blue-500 focus:outline-none"
              >
                <option value="ALL">Trạng thái: Tất cả</option>
                <option value="ĐẠT">ĐẠT (Bình thường)</option>
                <option value="THẤP">THẤP (Cảnh báo)</option>
                <option value="CAO">CAO (Cảnh báo)</option>
              </select>
            </div>
          </div>

          {/* Right tools: Action buttons matching Image 2 */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => window.print()}
              title="In danh sách"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 active:scale-95 transition"
            >
              <Printer className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={loadData}
              title="Tải lại từ Google Sheets"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-blue-600 active:scale-95 transition"
            >
              <RotateCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={exportToCSV}
              title="Xuất file CSV / Excel"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 active:scale-95 transition"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Xuất file</span>
            </button>

            <button
              type="button"
              onClick={onOpenForm}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white shadow-xs hover:bg-blue-700 active:scale-95 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Ghi nhận mới</span>
            </button>
          </div>
        </div>

        {/* Tab 1: List Table */}
        {activeTab === 'list' && (
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3">
                <div className="custom-spinner" />
                <p className="text-xs font-semibold text-slate-400">
                  Đang tải dữ liệu từ Google Sheets (Sheet DATA)...
                </p>
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-400">
                <FileSpreadsheet className="h-10 w-10 text-slate-300" />
                <p className="text-sm font-semibold">
                  Không tìm thấy bản ghi nào phù hợp.
                </p>
                <p className="text-xs">
                  Thử thay đổi bộ lọc hoặc bấm nút "Ghi nhận mới" để tạo số liệu.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-100 text-slate-700 font-semibold select-none">
                  <tr>
                    <th className="w-10 px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.size === filteredRows.length &&
                          filteredRows.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-3 py-2.5">Tên tủ</th>
                    <th className="px-3 py-2.5">Thời gian đo</th>
                    <th className="px-3 py-2.5">Khung giờ</th>
                    <th className="px-3 py-2.5">Vị trí</th>
                    <th className="px-3 py-2.5 text-center">Ngưỡng (°C)</th>
                    <th className="px-3 py-2.5 text-center">Nhiệt độ (°C)</th>
                    <th className="px-3 py-2.5 text-center">Độ ẩm (%)</th>
                    <th className="px-3 py-2.5 text-center">Kết quả</th>
                    <th className="px-3 py-2.5">Nhân viên</th>
                    <th className="px-3 py-2.5">Chữ ký</th>
                    <th className="px-3 py-2.5">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.map((r, i) => {
                    const rowKey = r.id || r.rowIndex;
                    const isSelected = selectedIds.has(rowKey);

                    return (
                      <tr
                        key={rowKey}
                        className={`transition-colors hover:bg-blue-50/40 ${
                          isSelected
                            ? 'bg-blue-50/70'
                            : i % 2 === 1
                            ? 'bg-slate-50/40'
                            : 'bg-white'
                        }`}
                      >
                        <td className="w-10 px-3 py-2.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(rowKey)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>

                        {/* Tên tủ */}
                        <td className="px-3 py-2.5 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-700 text-[11px]">
                              {r.ten.charAt(0) || 'T'}
                            </div>
                            <div>
                              <div className="leading-tight">{r.ten}</div>
                              <div className="text-[10px] font-medium text-slate-400">
                                Mã: {r.id_tu || r.qr_code}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Ngày giờ */}
                        <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">
                          {r.ngay_h || r.ngay}
                        </td>

                        {/* Khung giờ */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                            {r.khung_h}
                          </span>
                        </td>

                        {/* Vị trí */}
                        <td className="px-3 py-2.5 text-slate-600">
                          {r.vi_tri || '—'}
                        </td>

                        {/* Ngưỡng min max */}
                        <td className="px-3 py-2.5 text-center text-slate-500 whitespace-nowrap font-medium">
                          {r.nhiet_do_min && r.nhiet_do_max
                            ? `${r.nhiet_do_min} ~ ${r.nhiet_do_max}`
                            : '—'}
                        </td>

                        {/* Nhiệt độ đo */}
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          <span className="font-extrabold text-sm text-slate-900">
                            {r.nhiet_do_do_dc !== '' ? r.nhiet_do_do_dc : '—'}
                          </span>
                        </td>

                        {/* Độ ẩm đo */}
                        <td className="px-3 py-2.5 text-center text-slate-600 whitespace-nowrap font-semibold">
                          {r.do_am_do_dc ? `${r.do_am_do_dc}%` : '—'}
                        </td>

                        {/* Kết quả badge matching Image 2 */}
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          {r.ket_qua === 'ĐẠT' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3" />
                              ĐẠT
                            </span>
                          ) : r.ket_qua === 'THẤP' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-300 bg-cyan-50 px-2.5 py-0.5 text-[11px] font-bold text-cyan-800">
                              <TrendingDown className="h-3 w-3" />
                              THẤP
                            </span>
                          ) : r.ket_qua === 'CAO' ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                              <TrendingUp className="h-3 w-3" />
                              CAO
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">—</span>
                          )}
                        </td>

                        {/* Nhân viên */}
                        <td className="px-3 py-2.5 font-medium text-slate-700 whitespace-nowrap">
                          {r.id_nv}
                        </td>

                        {/* Chữ ký */}
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          {r.chu_ky ? (
                            <button
                              type="button"
                              onClick={() => setPreviewSignature(r.chu_ky)}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 hover:bg-blue-50"
                            >
                              Xem chữ ký
                            </button>
                          ) : (
                            <span className="text-slate-300 italic text-[11px]">
                              Chưa ký
                            </span>
                          )}
                        </td>

                        {/* Ghi chú */}
                        <td className="px-3 py-2.5 text-slate-500 max-w-xs truncate">
                          {r.ghi_chu || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Statistics */}
        {activeTab === 'stats' && (
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Tổng lượt đo đã ghi nhận
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900">
                  {stats.total}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <p className="text-xs font-semibold text-emerald-800">
                  Lượt đạt tiêu chuẩn (ĐẠT)
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700">
                    {stats.datCount}
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    ({stats.datRate}%)
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50/60 p-4">
                <p className="text-xs font-semibold text-cyan-800">
                  Cảnh báo nhiệt độ THẤP
                </p>
                <p className="mt-1 text-2xl font-black text-cyan-700">
                  {stats.thapCount}
                </p>
              </div>

              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
                <p className="text-xs font-semibold text-rose-800">
                  Cảnh báo nhiệt độ CAO
                </p>
                <p className="mt-1 text-2xl font-black text-rose-700">
                  {stats.caoCount}
                </p>
              </div>
            </div>

            {/* List breakdown by cabinet */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-bold text-slate-800">
                Thống kê tần suất đo theo từng thiết bị
              </h3>
              <div className="divide-y divide-slate-100">
                {Object.entries(
                  dataRows.reduce((acc, r) => {
                    const name = r.ten || 'Chưa đặt tên';
                    acc[name] = (acc[name] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([name, count]) => (
                  <div
                    key={name}
                    className="flex items-center justify-between py-2 text-xs"
                  >
                    <span className="font-semibold text-slate-700">{name}</span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-slate-600">
                      {count} lượt
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signature Preview Modal */}
      {previewSignature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl animate-fade-in-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-sm font-bold text-slate-800">
                Chữ ký số xác nhận
              </span>
              <button
                type="button"
                onClick={() => setPreviewSignature(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="my-4 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2">
              <img
                src={previewSignature}
                alt="Chữ ký nhân viên"
                className="max-h-48 w-auto object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setPreviewSignature(null)}
              className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
