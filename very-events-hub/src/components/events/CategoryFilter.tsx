import { Button } from "@/components/ui/button";
import { Music, Briefcase, Palette, Gamepad2, Heart, GraduationCap, Sparkles } from "lucide-react";

const categories = [
  { id: "all", label: "All Events", icon: Sparkles },
  { id: "music", label: "Music", icon: Music },
  { id: "tech", label: "Tech", icon: Briefcase },
  { id: "art", label: "Art", icon: Palette },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "education", label: "Education", icon: GraduationCap },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selected === category.id;
        return (
          <Button
            key={category.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(category.id)}
            className={`gap-2 transition-all ${
              isSelected ? "" : "hover:bg-primary/10 hover:text-primary hover:border-primary"
            }`}
          >
            <Icon className="h-4 w-4" />
            {category.label}
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
