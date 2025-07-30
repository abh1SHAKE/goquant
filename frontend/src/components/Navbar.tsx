// Navbar component

import Image from "next/image";
import VenueSelector, { Venue } from "./VenueSelector";

interface NavbarProps {
    venue: Venue;
    onVenueChange: (venue: Venue) => void;
}

export default function Navbar({ venue, onVenueChange }: NavbarProps) {
    return (
        <div className="flex flex-row items-center rounded-lg justify-between mb-10 md:mb-6 bg-dark p-2 md:p-4">
            <div>
                <Image src="https://framerusercontent.com/images/ewFR6Nz32hCcmhAQRVLStO6qHvw.png" alt="Go Quant Logo" width={100} height={100} />
            </div>

            <div>
                <VenueSelector selectedVenue={venue} onVenueChange={onVenueChange}/>
            </div>
        </div>
    );
}