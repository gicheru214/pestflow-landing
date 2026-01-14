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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true, margin: "-50px" }}
      className="flex flex-col gap-4 p-6 rounded-2xl bg-white border border-slate-100 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group h-full hover:-translate-y-1"
    >
      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0 shadow-sm">
        <Icon className="h-7 w-7 text-primary group-hover:text-emerald-600 transition-colors duration-300" />
      </div>
      <div>
        <h4 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-600">{description}</p>
      </div>
    </motion.div>
  );
}

export function Features() {
  const categories = Object.values(FEATURES);

  return (
    <section id="features" className="py-24 bg-slate-50/50 relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-6"
          >
            Powerful Features
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-6 font-heading text-slate-900"
          >
            Everything you need to <span className="text-primary">run your business</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600"
          >
            From the office to the field, PestFlow connects every part of your operation in one seamless platform.
          </motion.p>
        </div>

        <div className="space-y-32">
          {categories.map((category, catIndex) => (
            <motion.div 
              key={category.id} 
              className="relative"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              {/* Category Header */}
              <div className="flex flex-col items-start mb-10 border-l-8 border-primary pl-8">
                <h3 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">{category.title}</h3>
                <p className="text-xl text-slate-600 max-w-2xl">{category.description}</p>
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
