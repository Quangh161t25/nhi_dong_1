import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  House,
  LayoutDashboard,
  Wallet,
  Layers,
  Copyright,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Clock,
  Bell,
  ChevronDown,
  Database,
  Thermometer,
  LogOut,
  User,
} from 'lucide-react';

export default function ErpLayout({
  activeRoute,
  onRouteChange,
  currentUser,
  onLogout,
  children,
  breadcrumbs = [],
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Live timer matching UI clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatVietnameseDate = (d) => {
    const days = [
      'Chủ nhật',
      'Thứ 2',
      'Thứ 3',
      'Thứ 4',
      'Thứ 5',
      'Thứ 6',
      'Thứ 7',
    ];
    const pad = (n) => (n < 10 ? '0' + n : n);
    return `${days[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  };

  const pad0 = (n) => (n < 10 ? '0' + n : n);
  const hoursStr = pad0(currentTime.getHours());
  const minutesStr = pad0(currentTime.getMinutes());
  const secondsStr = pad0(currentTime.getSeconds());

  const navItems = [
    { id: 'trang_chu', label: 'Trang chủ', icon: House },
    { id: 'data', label: 'Dữ liệu nhiệt độ (DATA)', icon: Database },
    { id: 'form', label: 'Ghi nhận nhiệt độ', icon: Thermometer },
    { id: 'tong_quan', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'tai_chinh', label: 'Tài chính', icon: Wallet },
    { id: 'he_thong', label: 'Hệ thống', icon: Layers },
    { id: 'ban_quyen', label: 'Thông tin bản quyền', icon: Copyright },
  ];

  const userName = currentUser?.name || 'Lê Minh Công';
  const userRole = currentUser?.role || 'Tổng Giám Đốc';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside
        className={`relative z-40 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
          isSidebarCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {/* Brand / Logo */}
        <div className="flex h-14 items-center border-b border-slate-100 px-3.5">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-500/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <h2 className="text-sm font-black leading-tight text-slate-900 tracking-tight">
                  ERP
                </h2>
                <p className="truncate text-[11px] font-medium text-slate-400">
                  Quản lý Bệnh viện Nhi Đồng 1
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onRouteChange(item.id)}
                  title={item.label}
                  className={`group relative flex h-11 w-full items-center gap-3 rounded-xl px-2.5 transition-all ${
                    isActive
                      ? 'bg-blue-50/80 font-bold text-blue-600 shadow-xs'
                      : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-blue-600" />
                  )}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                        : 'text-slate-500 group-hover:bg-white group-hover:text-blue-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="truncate text-sm">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom item */}
        <div className="border-t border-slate-100 p-2">
          <button
            type="button"
            className="flex h-11 w-full items-center gap-3 rounded-xl px-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500">
              <Settings className="h-4 w-4" />
            </div>
            {!isSidebarCollapsed && (
              <span className="text-sm font-medium">Cài đặt</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-blue-600 active:scale-95 transition"
              title="Thu gọn sidebar"
            >
              {isSidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>

            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => onRouteChange('trang_chu')}
                className="flex items-center gap-1 text-slate-500 hover:text-blue-600"
              >
                <House className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Trang chủ</span>
              </button>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={idx}>
                  <span className="text-slate-300">/</span>
                  <span
                    className={`font-semibold ${
                      idx === breadcrumbs.length - 1
                        ? 'rounded-md bg-blue-600 px-2 py-0.5 text-white'
                        : 'text-slate-600'
                    }`}
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Clock Widget */}
            <div className="hidden lg:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs select-none">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>{formatVietnameseDate(currentTime)}</span>
              </div>
              <span className="rounded bg-blue-100/70 px-1.5 py-0.5 font-bold tabular-nums text-blue-700">
                {hoursStr}:{minutesStr}:{secondsStr}
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 active:scale-95 transition"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                  3
                </span>
              </button>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 rounded-xl p-1 pl-1.5 hover:bg-slate-100 active:scale-95 transition"
              >
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white shadow-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-xs font-bold leading-tight text-slate-800 truncate max-w-[130px]">
                    {userName}
                  </p>
                  <p className="text-[10px] font-medium text-slate-400 capitalize">
                    {userRole}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 animate-fade-in-up">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {userName}
                    </p>
                    <p className="text-[11px] text-slate-400">{userRole}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onRouteChange('trang_chu');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Trang chủ ERP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onRouteChange('data');
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    <Database className="h-3.5 w-3.5 text-slate-400" />
                    Module DATA
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-3.5 w-3.5 text-rose-500" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
