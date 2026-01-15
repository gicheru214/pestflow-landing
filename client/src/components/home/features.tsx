import { FEATURES } from "@/lib/constants";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index: number;
}

function FeatureCard({ icon: Icon, title, description, index }: FeatureCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="h-full border-slate-100 hover:border-emerald-500/20 hover:shadow-lg transition-all duration-300 group overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="pb-2">
          <div className="h-12 w-12 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 group-hover:bg-emerald-100">
            <Icon className="h-6 w-6 text-emerald-600" />
          </div>
          <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-slate-500 leading-relaxed text-sm">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function Features() {
  const categories = Object.values(FEATURES);

  return (
    <section id="features" className="py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-6"
          >
            Powerful Features
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6 font-heading text-slate-900"
          >
            Everything you need to <span className="text-emerald-600">run your business</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            From the office to the field, PestFlow connects every part of your operation in one seamless platform.
          </motion.p>
        </div>

        <Tabs defaultValue={categories[0].id} className="w-full max-w-6xl mx-auto">
          <div className="flex justify-center mb-10 overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
            <TabsList className="h-auto p-1 bg-white border border-slate-200 shadow-sm rounded-full">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="rounded-full px-6 py-3 text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all"
                >
                  {category.shortTitle}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="outline-none animate-in fade-in-50 zoom-in-95 duration-300">
              <div className="text-center mb-10">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{category.title}</h3>
                <p className="text-slate-600 max-w-2xl mx-auto">{category.description}</p>
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
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
