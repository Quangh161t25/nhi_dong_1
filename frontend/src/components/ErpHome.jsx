import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  Layers,
  Database,
  Thermometer,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export default function ErpHome({ currentUser, onNavigate }) {
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Chào buổi sáng';
    if (hr < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const userName = currentUser?.name || 'Lê Minh Công';

  const cards = [
    {
      id: 'data',
      title: 'Dữ liệu nhiệt độ (DATA)',
      description: 'Quản lý, tìm kiếm và phân tích toàn bộ dữ liệu đo nhiệt độ tủ từ Google Sheets.',
      icon: Database,
      gradient: 'from-blue-600 to-indigo-700',
      highlight: true,
    },
    {
      id: 'form',
      title: 'Ghi nhận nhiệt độ tủ',
      description: 'Biểu mẫu nhập nhiệt độ, độ ẩm phòng, quét mã QR và ký tên xác nhận trực tiếp.',
      icon: Thermometer,
      gradient: 'from-teal-600 to-cyan-700',
      highlight: true,
    },
    {
      id: 'tong_quan',
      title: 'Tổng quan',
      description: 'Thống kê nhân sự hôm nay và màn hình Live TV giám sát nhiệt độ tự động.',
      icon: LayoutDashboard,
      gradient: 'from-sky-600 to-indigo-700',
    },
    {
      id: 'tai_chinh',
      title: 'Tài chính',
      description: 'Thu chi, công nợ và báo cáo tài chính bảo trì thiết bị y tế.',
      icon: Wallet,
      gradient: 'from-emerald-600 to-teal-700',
    },
    {
      id: 'he_thong',
      title: 'Hệ thống',
      description: 'Cấu hình danh mục tủ lưu trữ, phân quyền nhân viên và hồ sơ phòng ban.',
      icon: Layers,
      gradient: 'from-slate-600 to-slate-800',
    },
    {
      id: 'ban_quyen',
      title: 'Thông tin bản quyền',
      description: 'Quản lý sở hữu trí tuệ và thông tin nhà phát triển phần mềm.',
      icon: ShieldCheck,
      gradient: 'from-blue-600 to-blue-800',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl animate-fade-in-up">
      {/* Greeting Header matching Image 1 */}
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          {getGreeting()},{' '}
          <span className="text-blue-600 font-extrabold">{userName}</span> 👋
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Hệ thống theo dõi & điều hành Khoa Xét nghiệm Huyết Học — Bệnh viện Nhi Đồng 1
        </p>
      </div>

      <div className="mb-6 h-px w-full bg-slate-200" />

      {/* Cards Grid matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className={`group relative flex flex-col items-center text-center cursor-pointer rounded-2xl border bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                card.highlight
                  ? 'border-blue-200 ring-2 ring-blue-500/10 hover:border-blue-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Corner arrow button */}
              <div className="absolute top-3.5 right-3.5 rounded-full bg-slate-100 p-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-blue-600" />
              </div>

              {/* Icon Container */}
              <div
                className={`mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-md shadow-slate-900/10 transition-transform duration-200 group-hover:scale-110`}
              >
                <Icon className="h-7 w-7" />
              </div>

              {/* Title & Description */}
              <h2 className="mb-1.5 text-base font-bold text-slate-900 leading-tight">
                {card.title}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 min-h-[2.5rem]">
                {card.description}
              </p>

              {card.highlight && (
                <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 border border-blue-200">
                  Mở Module →
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
