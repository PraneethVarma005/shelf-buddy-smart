
import { Snowflake, Refrigerator, Home } from "lucide-react";

interface StorageToggleProps {
  value: string;
  onChange: (value: string) => void;
}

const storageOptions = [
  {
    id: "room",
    label: "Room",
    icon: Home,
    description: "Room temperature"
  },
  {
    id: "refrigerated", 
    label: "Refrigerated",
    icon: Refrigerator,
    description: "0-4°C"
  },
  {
    id: "frozen",
    label: "Frozen", 
    icon: Snowflake,
    description: "Below -18°C"
  }
];

export const StorageToggle = ({ value, onChange }: StorageToggleProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {storageOptions.map((option) => {
        const Icon = option.icon;
        const isActive = value === option.id;
        
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`storage-toggle ${isActive ? 'active' : ''}`}
          >
            <div className="flex flex-col items-center space-y-2">
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
              <div>
                <div className={`font-medium text-sm ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {option.label}
                </div>
                <div className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                  {option.description}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
