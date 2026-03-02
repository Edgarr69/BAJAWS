import ServiceCard from "@/components/ServiceCard";
import { siteContent } from "@/content/site";

export default function ServicesList() {
  const { items } = siteContent.services;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {items.map((service) => (
        <ServiceCard
          key={service.id}
          title={service.title}
          description={service.description}
          icon={service.icon}
        />
      ))}
    </div>
  );
}
