import {
    Accessibility,
    BedDouble,
    Briefcase,
    Building2,
    Gem,
    Heart,
    Home,
    Users,
} from "lucide-react";

const ICONS = {
    standard: Home,
    deluxe: BedDouble,
    suite: Gem,
    family: Users,
    executive: Briefcase,
    studio: Building2,
    apartment: Building2,
    accessible: Accessibility,
    honeymoon: Heart,
};

const RoomTypeIcon = ({ typeName, className = "h-4 w-4" }) => {
    const Icon = ICONS[typeName?.toLowerCase()] ?? BedDouble;
    return <Icon className={className} aria-hidden="true" />;
};

export default RoomTypeIcon;
