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
    num:    'text-emerald-600/[0.07]',
    border: '#059669',
  },
  primary: {
    icon:   'bg-primary-700 text-white',
    num:    'text-primary-700/[0.07]',
    border: '#0B3C5D',
  },
};

export default function ServicesList() {
  const { items } = siteContent.services;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {items.map((service, i) => {
        const Icon  = iconMap[service.icon as ServiceIcon];
        const color = colors[i % 2];
        const c     = colorMap[color];
        return (
          <AnimateOnScroll key={service.id} delay={i * 80}>
            <div
              className="group relative bg-white rounded-2xl border-t-4 shadow-sm hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)] transition-all duration-[250ms] ease-out p-5 h-full flex flex-col gap-3 overflow-hidden"
              style={{ borderTopColor: c.border }}
            >
              {/* Número de agua */}
              <span className={`absolute bottom-1 right-2 text-6xl font-black leading-none select-none pointer-events-none ${c.num}`}>
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Ícono */}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 ${c.icon}`}>
                <Icon className="w-4 h-4" strokeWidth={1.75} />
              </div>

              {/* Texto */}
              <div className="relative z-10">
                <h3 className="font-bold text-slate-800 text-xs leading-snug mb-1">{service.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed text-justify">{service.description}</p>
              </div>
            </div>
          </AnimateOnScroll>
        );
      })}
    </div>
  );
}
