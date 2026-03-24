'use client';

import { Truck, Droplets, Warehouse, Recycle, Leaf, PackageOpen } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { siteContent } from '@/content/site';

type ServiceIcon = 'truck' | 'water' | 'warehouse' | 'recycle' | 'remediation' | 'special-waste';

const iconMap: Record<ServiceIcon, React.ElementType> = {
  truck:           Truck,
  water:           Droplets,
  warehouse:       Warehouse,
  recycle:         Recycle,
  remediation:     Leaf,
  'special-waste': PackageOpen,
};

const colors = ['emerald', 'primary'] as const;
type Color = typeof colors[number];

const colorMap: Record<Color, { icon: string; num: string; border: string }> = {
  emerald: {
    icon:   'bg-emerald-600 text-white',
    num:    'text-emerald-600/[0.06]',
    border: '#059669',
  },
  primary: {
    icon:   'bg-primary-700 text-white',
    num:    'text-primary-700/[0.06]',
    border: '#0B3C5D',
  },
};

export default function ServicesList() {
  const { items } = siteContent.services;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
      {items.map((service, i) => {
        const Icon  = iconMap[service.icon as ServiceIcon];
        const color = colors[i % 2];
        const c     = colorMap[color];
        return (
          <AnimateOnScroll key={service.id} delay={i * 60}>
            <div
              className="group relative bg-white rounded-2xl border-t-4 shadow-sm hover:-translate-y-1.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.09)] transition-all duration-[250ms] ease-out p-4 sm:p-5 h-full flex flex-col gap-3 overflow-hidden"
              style={{ borderTopColor: c.border }}
            >
              {/* Número de agua */}
              <span className={`absolute bottom-1 right-2 text-7xl font-black leading-none select-none pointer-events-none ${c.num}`}>
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Ícono */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 flex-shrink-0 ${c.icon}`}>
                <Icon className="w-5 h-5" strokeWidth={1.75} />
              </div>

              {/* Texto */}
              <div className="relative z-10 flex flex-col gap-1">
                <h3 className="font-bold text-slate-800 text-sm leading-snug">{service.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{service.description}</p>
              </div>
            </div>
          </AnimateOnScroll>
        );
      })}
    </div>
  );
}
