'use client';

import { Truck, Droplets, Warehouse, Recycle, Leaf, PackageOpen } from 'lucide-react';
import AnimateOnScroll from '@/components/AnimateOnScroll';
import { siteContent } from '@/content/site';

type ServiceIcon = 'truck' | 'water' | 'warehouse' | 'recycle' | 'remediation' | 'special-waste';

const iconMap: Record<ServiceIcon, { Icon: React.ElementType; animation: string }> = {
  truck:            { Icon: Truck,        animation: 'group-hover:translate-x-2' },
  water:            { Icon: Droplets,     animation: 'group-hover:scale-125' },
  warehouse:        { Icon: Warehouse,    animation: 'group-hover:-translate-y-1' },
  recycle:          { Icon: Recycle,      animation: 'group-hover:rotate-180' },
  remediation:      { Icon: Leaf,         animation: 'group-hover:rotate-12 group-hover:scale-110' },
  'special-waste':  { Icon: PackageOpen,  animation: 'group-hover:-translate-y-1.5 group-hover:scale-110' },
};

export default function ServicesList() {
  const { items } = siteContent.services;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((service, i) => {
        const { Icon, animation } = iconMap[service.icon as ServiceIcon];
        return (
          <AnimateOnScroll key={service.id} delay={i * 80}>
            <div className="group bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-md flex flex-col gap-4 h-full">
              <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 ${animation}`}>
                <Icon className="w-6 h-6 text-emerald-700" strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm leading-snug mb-2">{service.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed text-justify">{service.description}</p>
              </div>
            </div>
          </AnimateOnScroll>
        );
      })}
    </div>
  );
}
