type IconKey = "truck" | "water" | "warehouse";

const icons: Record<IconKey, React.ReactNode> = {
  truck: (
    <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  water: (
    <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M12 2C8.686 2 6 7.373 6 11a6 6 0 0012 0c0-3.627-2.686-9-6-9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M9 13a3 3 0 006 0" />
    </svg>
  ),
  warehouse: (
    <svg className="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
    </svg>
  ),
};

interface ServiceCardProps {
  title:       string;
  description: string;
  icon:        IconKey;
}

export default function ServiceCard({ title, description, icon }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-7 hover:shadow-xl transition-shadow duration-300 flex flex-col gap-4">
      <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center">
        {icons[icon]}
      </div>
      <h3 className="font-bold text-gray-900 text-base tracking-wide">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed flex-1">{description}</p>
    </div>
  );
}
