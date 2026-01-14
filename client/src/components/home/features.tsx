import { FEATURES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      className="flex flex-col gap-3 p-6 rounded-2xl bg-white border border-border/50 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
    >
      <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
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
        <div className="text-center max-w-3xl mx-auto mb-16">
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

        <Tabs defaultValue={categories[0].id} className="w-full max-w-6xl mx-auto">
          <div className="flex justify-center mb-12 overflow-x-auto pb-4 scrollbar-hide">
            <TabsList className="h-14 p-1 bg-secondary/50 backdrop-blur-sm rounded-full border">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="rounded-full px-6 h-full text-base font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
                >
                  {category.shortTitle}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-0 focus-visible:outline-none">
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((feature, idx) => (
                    <FeatureCard 
                      key={idx} 
                      {...feature} 
                      index={idx}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
