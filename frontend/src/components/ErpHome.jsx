import React from 'react';
import {
  Database,
  Thermometer,
  ArrowUpRight,
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
      description: 'Quản lý, tìm kiếm, lọc và phân tích toàn bộ dữ liệu đo nhiệt độ các tủ từ Google Sheets.',
      icon: Database,
      gradient: 'from-blue-600 to-indigo-700',
    },
    {
      id: 'form',
      title: 'Ghi nhận nhiệt độ tủ',
      description: 'Biểu mẫu nhập nhiệt độ, độ ẩm phòng, quét mã QR và ký tên xác nhận trực tiếp.',
      icon: Thermometer,
      gradient: 'from-teal-600 to-cyan-700',
    },
  ];

  return (
    <div className="mx-auto max-w-5xl animate-fade-in-up">
      {/* Greeting Header */}
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              onClick={() => onNavigate(card.id)}
              className="group relative flex flex-col items-center text-center cursor-pointer rounded-3xl border border-blue-200/80 bg-white p-8 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-blue-400 ring-2 ring-blue-500/10"
            >
              {/* Corner arrow button */}
              <div className="absolute top-4 right-4 rounded-full bg-slate-100 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-blue-600" />
              </div>

              {/* Icon Container */}
              <div
                className={`mb-5 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${card.gradient} text-white shadow-lg shadow-blue-900/15 transition-transform duration-200 group-hover:scale-110`}
              >
                <Icon className="h-8 w-8" />
              </div>

              {/* Title & Description */}
              <h2 className="mb-2 text-lg font-bold text-slate-900 leading-tight">
                {card.title}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mb-4">
                {card.description}
              </p>

              <div className="mt-auto inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-4 py-1 text-xs font-bold text-blue-600 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                Mở Module →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
