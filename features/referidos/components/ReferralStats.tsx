import { Users, CheckCircle2, Clock, Star } from "lucide-react";
import { ReferidoStats } from "../types/referido.types";
import { motion } from "framer-motion";

interface ReferralStatsProps {
  stats: ReferidoStats;
}

export function ReferralStats({ stats }: ReferralStatsProps) {
  const cards = [
    {
      label: "Total Referidos",
      value: stats.total_referidos,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Completados",
      value: stats.completados,
      icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Pendientes",
      value: stats.pendientes,
      icon: Clock,
      color: "text-yellow-500",
      bg: "bg-yellow-50",
    },
    {
      label: "Puntos Ganados",
      value: stats.puntos_ganados,
      icon: Star,
      color: "text-kc-gold",
      bg: "bg-kc-gold/10",
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white border border-kc-sand rounded-xl p-4 sm:p-5 flex flex-col items-center text-center shadow-sm"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${card.bg}`}>
            <card.icon className={`w-5 h-5 ${card.color}`} />
          </div>
          <span className="text-2xl font-bold text-kc-charcoal leading-none mb-1">
            {card.value}
          </span>
          <span className="text-xs sm:text-sm text-kc-mocha font-medium">
            {card.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
