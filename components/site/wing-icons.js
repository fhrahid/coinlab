import {
  BrainCircuit,
  CircleArrowOutUpRight,
  ShieldCheck,
  Sparkles,
  Sprout,
} from "lucide-react";

const icons = {
  "ai-in-healthcare": BrainCircuit,
  "financial-technology": CircleArrowOutUpRight,
  "networking-and-security": ShieldCheck,
  "smart-agriculture": Sprout,
  "natural-language-processing": Sparkles,
};

export const wingIcon = (slug) => icons[slug] || BrainCircuit;
