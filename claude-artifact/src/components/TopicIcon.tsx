import React from "react";
import { BarChart3, Box, CircleDot, Diff, Dices, Equal, Hash, LineChart, Package, PieChart, Percent, Ruler, Scale, Sigma, Sparkles, Square, Superscript, Triangle, Variable, Workflow } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>> = {
  Hash,
  PlusMinus: Diff,
  PieChart,
  Dot: CircleDot,
  Percent,
  Scale,
  Superscript,
  Sparkles,
  Workflow,
  Variable,
  Equal,
  LineChart,
  Ruler,
  Triangle,
  BarChart3,
  Box,
  Square,
  Package,
  Dices,
};

export const TopicIcon: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 26, className }) => {
  const Icon = ICONS[name] ?? Sigma;
  return <Icon size={size} className={className} strokeWidth={2.2} />;
};