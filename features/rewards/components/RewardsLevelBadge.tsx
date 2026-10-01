import { RewardsNivel } from "../types/rewards.types";

interface RewardsLevelBadgeProps {
  nivel: RewardsNivel | null;
  size?: 'sm' | 'md' | 'lg';
}

export function RewardsLevelBadge({ nivel, size = 'md' }: RewardsLevelBadgeProps) {
  if (!nivel) return null;

  let colorClasses = "bg-kc-sand text-kc-mocha"; // fallback (semilla)
  
  const slug = nivel.slug?.toLowerCase() || '';
  if (slug.includes('flor')) {
    colorClasses = "bg-kc-blush/40 text-kc-rose-gold";
  } else if (slug.includes('torta')) {
    colorClasses = "bg-kc-rose-gold/20 text-kc-charcoal";
  } else if (slug.includes('corona')) {
    colorClasses = "bg-gradient-to-r from-kc-gold to-kc-rose-gold text-white";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base font-medium shadow-sm",
  };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full ${colorClasses} ${sizeClasses[size]}`}>
      <span className="leading-none">{nivel.emoji}</span>
      <span>{nivel.nombre}</span>
    </div>
  );
}
