import { FEATURES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="flex flex-col gap-3 p-6 rounded-2xl bg-white border border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group h-full"
    >
      <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300 shrink-0">
        <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div>
        <h4 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export function Features() {
  const categories = Object.values(FEATURES);

  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
            Features
          </div>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 font-heading">
            Everything you need to run your business
          </h2>
          <p className="text-xl text-muted-foreground">
            From the office to the field, PestFlow connects every part of your operation in one seamless platform.
          </p>
        </div>

        <div className="space-y-24">
          {categories.map((category, catIndex) => (
            <div key={category.id} className="relative">
              {/* Category Header */}
              <div className="flex flex-col items-start mb-8 border-l-4 border-primary pl-6">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{category.title}</h3>
                <p className="text-lg text-muted-foreground">{category.description}</p>
              </div>
              
              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                {category.items.map((feature, idx) => (
                  <FeatureCard 
                    key={idx} 
                    {...feature} 
                    index={idx}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
