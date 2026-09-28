import React, { useState } from 'react';

export default function LoginScreen({ onLogin, isLoadingUsers, usersList }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const uid = username.trim();
    const pwd = password.trim();

    if (!uid || !pwd) {
      setErrorMsg('Vui lòng nhập đầy đủ tài khoản và mật khẩu.');
      return;
    }

    if (!usersList || usersList.length === 0) {
      setErrorMsg('Đang tải danh sách nhân viên hoặc không thể kết nối Google Sheets.');
      return;
    }

    const foundUser = usersList.find(
      (u) =>
        String(u.id).trim().toLowerCase() === uid.toLowerCase() &&
        String(u.password || '').trim() === pwd
    );

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setErrorMsg('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-teal-50 via-teal-100 to-sky-100 p-4">
      <div className="login-card relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/80 p-8 shadow-2xl shadow-teal-900/10 md:p-10">
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-500" />

        <div className="mb-8 text-center">
          <div className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600">
            Nhi đồng 1
          </div>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Hệ thống Theo dõi Nhiệt độ Thiết bị
          </p>
        </div>

        {isLoadingUsers ? (
          <div className="py-6 text-center">
            <div className="custom-spinner mb-3" />
            <p className="text-sm font-medium text-slate-500">
              Đang đồng bộ dữ liệu nhân viên từ Google Sheets...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-semibold text-rose-600">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Tài khoản
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="Mã ID nhân viên"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-600 py-3.5 text-base font-bold text-white shadow-md transition-all hover:from-teal-700 hover:to-cyan-700 hover:shadow-lg active:scale-95"
              >
                Đăng nhập
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
