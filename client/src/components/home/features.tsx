import { FEATURES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-secondary/50 transition-colors duration-200 group">
      <div className="mt-1 flex-shrink-0">
        <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-200" />
      </div>
      <div>
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Everything you need to run your pest control business
          </h2>
          <p className="text-lg text-muted-foreground">
            From the office to the field, PestFlow connects every part of your operation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Business Owners Column */}
          <div className="space-y-6">
            <div className="space-y-2 mb-6">
              <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", FEATURES.business.color)}>
                {FEATURES.business.title}
              </span>
              <p className="text-sm text-muted-foreground font-medium">
                {FEATURES.business.description}
              </p>
            </div>
            <div className="space-y-2 border-l-2 border-purple-100 pl-2">
              {FEATURES.business.items.map((feature, idx) => (
                <FeatureCard key={idx} {...feature} />
              ))}
            </div>
          </div>

          {/* Admins Column */}
          <div className="space-y-6">
            <div className="space-y-2 mb-6">
              <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", FEATURES.admins.color)}>
                {FEATURES.admins.title}
              </span>
              <p className="text-sm text-muted-foreground font-medium">
                {FEATURES.admins.description}
              </p>
            </div>
            <div className="space-y-2 border-l-2 border-cyan-100 pl-2">
              {FEATURES.admins.items.map((feature, idx) => (
                <FeatureCard key={idx} {...feature} />
              ))}
            </div>
          </div>

          {/* Technicians Column */}
          <div className="space-y-6">
            <div className="space-y-2 mb-6">
              <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", FEATURES.technicians.color)}>
                {FEATURES.technicians.title}
              </span>
              <p className="text-sm text-muted-foreground font-medium">
                {FEATURES.technicians.description}
              </p>
            </div>
            <div className="space-y-2 border-l-2 border-orange-100 pl-2">
              {FEATURES.technicians.items.map((feature, idx) => (
                <FeatureCard key={idx} {...feature} />
              ))}
            </div>
          </div>

          {/* Sales Column */}
          <div className="space-y-6">
            <div className="space-y-2 mb-6">
              <span className={cn("inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", FEATURES.sales.color)}>
                {FEATURES.sales.title}
              </span>
              <p className="text-sm text-muted-foreground font-medium">
                {FEATURES.sales.description}
              </p>
            </div>
            <div className="space-y-2 border-l-2 border-pink-100 pl-2">
              {FEATURES.sales.items.map((feature, idx) => (
                <FeatureCard key={idx} {...feature} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
