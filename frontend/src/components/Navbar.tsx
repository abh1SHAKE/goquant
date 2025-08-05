// Navbar component
import VenueSelector, { Venue } from "./VenueSelector";

interface NavbarProps {
    venue: Venue;
    onVenueChange: (venue: Venue) => void;
}

export default function Navbar({ venue, onVenueChange }: NavbarProps) {
    return (
        <div className="flex flex-row items-center rounded-lg justify-between mb-10 md:mb-6 bg-dark p-2 md:p-4">
            <div className="font-gabarito text-2xl font-semibold text-[#ffffffcc]">
                Orderbook66
            </div>

            <div>
                <VenueSelector selectedVenue={venue} onVenueChange={onVenueChange}/>
            </div>
        </div>
    );
}