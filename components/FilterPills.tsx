"use client";

import { MapPin, Crown, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterPillsProps {
  selectedFilters: string[];
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: "nearby", label: "Nearby", icon: MapPin },
  { id: "premium", label: "Premium", icon: Crown },
  { id: "buffet", label: "Buffet", icon: Utensils },
];

export function FilterPills({ selectedFilters, onFilterChange }: FilterPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isSelected = selectedFilters.includes(filter.id);

        return (
          <Button
            key={filter.id}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.id)}
            className={
              isSelected
                ? "bg-[#6366F1] hover:bg-[#5558E3]"
                : "hover:border-[#6366F1] hover:text-[#6366F1]"
            }
          >
            <Icon className="h-4 w-4 mr-1.5" />
            {filter.label}
          </Button>
        );
      })}
    </div>
  );
}
