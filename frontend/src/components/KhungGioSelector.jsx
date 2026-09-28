import React, { useEffect } from 'react';
import { CONFIG } from '../config/constants';

function normalizeScheduleName(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

export function isSpecialSchedule(tenTu, minVal, maxVal) {
  const normalizedName = normalizeScheduleName(tenTu);
  const isNormal = CONFIG.normalScheduleCabinets.some((s) =>
    normalizedName.includes(normalizeScheduleName(s))
  );
  const matchesSpecial = CONFIG.specialCabinets.some((s) =>
    normalizedName.includes(normalizeScheduleName(s))
  );
  const isSpecialName = matchesSpecial && !isNormal;

  const min = parseFloat(String(minVal).replace(',', '.'));
  const max = parseFloat(String(maxVal).replace(',', '.'));
  const isPlasmaRange = !isNaN(min) && !isNaN(max) && min >= -35 && max <= -25;

  return isSpecialName || isPlasmaRange;
}

export function getDefaultKhungGio(tenTu, minVal, maxVal) {
  const hr = new Date().getHours();
  const use6Slots = isSpecialSchedule(tenTu, minVal, maxVal);

  if (use6Slots) {
    if (hr >= 7 && hr < 11) return 'L1';
    if (hr >= 11 && hr < 15) return 'L2';
    if (hr >= 15 && hr < 19) return 'L3';
    if (hr >= 19 && hr < 23) return 'L4';
    if (hr >= 23 || hr < 3) return 'L5';
    return 'L6';
  } else {
    return hr >= 16 ? 'Chiều' : 'Sáng';
  }
}

export default function KhungGioSelector({
  tenTu,
  nhietDoMin,
  nhietDoMax,
  selectedSlot,
  onChangeSlot,
}) {
  const use6Slots = isSpecialSchedule(tenTu, nhietDoMin, nhietDoMax);

  const slots6 = [
    { id: 'L1', label: 'L1 7H' },
    { id: 'L2', label: 'L2 11H' },
    { id: 'L3', label: 'L3 15H' },
    { id: 'L4', label: 'L4 19H' },
    { id: 'L5', label: 'L5 23H' },
    { id: 'L6', label: 'L6 3H' },
  ];

  const slots2 = [
    { id: 'Sáng', label: 'Sáng' },
    { id: 'Chiều', label: 'Chiều' },
  ];

  const activeOptions = use6Slots ? slots6 : slots2;

  // When cabinet change switches between 2-slot and 6-slot, re-align if needed
  useEffect(() => {
    const validIds = activeOptions.map((o) => o.id);
    if (!validIds.includes(selectedSlot)) {
      const defaultSlot = getDefaultKhungGio(tenTu, nhietDoMin, nhietDoMax);
      onChangeSlot(defaultSlot);
    }
  }, [use6Slots, tenTu, nhietDoMin, nhietDoMax]);

  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        Khung giờ
      </label>
      <div className={`grid gap-2 ${use6Slots ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {activeOptions.map((opt) => {
          const isSelected = selectedSlot === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChangeSlot(opt.id)}
              className={`rounded-lg py-2.5 px-2 text-xs font-bold transition-all border ${
                isSelected
                  ? 'bg-teal-600 text-white border-teal-600 shadow-md scale-102'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:bg-teal-50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
