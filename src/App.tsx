import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { MapPin, Calendar as CalendarIcon, Clock, Users, Luggage, CarFront, CheckCircle2, Phone, Mail, ArrowLeft, User, ChevronLeft, ChevronRight, Star, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster, toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const TESTIMONIALS = [
  {
    initials: "MT",
    name: "Michael Triggs",
    time: "3 months ago",
    text: "Fantastic service from Cas, reasonably priced and able to accommodate a late same-day journey from Birmingham to...",
    color: "bg-slate-500 text-white" 
  },
  {
    initials: "M",
    name: "Marie Lewis",
    time: "5 months ago",
    text: "The service was exceptional. A lovely driver, helpful and arrived within great time - all I had to do was get in the car and...",
    color: "bg-[#0b8a92] text-white"
  },
  {
    initials: "MF",
    name: "Matt Franck",
    time: "5 months ago",
    text: "I needed to get from Litchfield to Bath and checked on the train schedule. It would have taken hours and several transfers. I found...",
    color: "bg-slate-800 text-white"
  },
  {
    initials: "E",
    name: "Eric Wild",
    time: "6 months ago",
    text: "I recently booked for multiple trips over a few days while in Birmingham, Cheltenham, and then back to Heathrow. Cas - the...",
    color: "bg-[#c04b24] text-white"
  },
  {
    initials: "JS",
    name: "James Smith",
    time: "8 months ago",
    text: "Outstanding service. The S-Class was immaculate and our journey was smooth. Professional and courteous. Will definitely use again.",
    color: "bg-[#185adb] text-white"
  }
];

type AirportFee = {
  [key: string]: { "5": number | null; "10": number | null; "15": number | null; "20": number | null; "30": number | null; };
};

const AIRPORT_FEES: AirportFee = {
  "aberdeen": { "5": 7.00, "10": 7.00, "15": 7.00, "20": 12.00, "30": 22.00 },
  "belfast city": { "5": 4.00, "10": 4.00, "15": 6.00, "20": 6.00, "30": 20.00 },
  "belfast int": { "5": 5.00, "10": 5.00, "15": 8.00, "20": 8.00, "30": 13.00 },
  "birmingham": { "5": 7.00, "10": 7.00, "15": 7.00, "20": 12.00, "30": 24.00 },
  "bournemouth": { "5": 6.00, "10": 6.00, "15": 6.00, "20": 6.00, "30": 6.00 },
  "bristol": { "5": 8.50, "10": 8.50, "15": 10.50, "20": 10.50, "30": 13.00 },
  "cardiff": { "5": 3.00, "10": 3.00, "15": 6.00, "20": 6.00, "30": 9.00 },
  "city of derry": { "5": 1.00, "10": 1.00, "15": 1.00, "20": 2.50, "30": 2.50 },
  "cornwall newquay": { "5": 0.00, "10": 0.00, "15": 3.00, "20": 3.00, "30": 3.00 },
  "east midlands": { "5": 5.00, "10": 5.00, "15": 5.00, "20": 10.00, "30": 20.00 },
  "edinburgh": { "5": 8.50, "10": 8.50, "15": 13.50, "20": 18.50, "30": 28.50 },
  "exeter": { "5": 6.00, "10": 6.00, "15": 6.00, "20": 7.50, "30": 7.50 },
  "glasgow": { "5": 7.00, "10": 7.00, "15": 7.00, "20": 12.00, "30": 22.00 },
  "glasgow prestwick": { "5": 4.50, "10": 4.50, "15": 4.50, "20": 4.50, "30": 4.50 },
  "humberside": { "5": 0.00, "10": 0.00, "15": 0.00, "20": 5.00, "30": 5.00 },
  "guernsey": { "5": 0.00, "10": 0.00, "15": 0.00, "20": 0.00, "30": 0.00 },
  "inverness": { "5": 3.80, "10": 3.80, "15": 3.80, "20": 3.80, "30": 3.80 },
  "isle of man": { "5": 0.00, "10": 0.00, "15": 0.00, "20": 3.00, "30": 3.00 },
  "jersey": { "5": 0.00, "10": 0.00, "15": 0.00, "20": 0.00, "30": 1.00 },
  "leeds bradford": { "5": 8.00, "10": 8.00, "15": 10.00, "20": 10.00, "30": 13.50 },
  "liverpool": { "5": 6.00, "10": 6.00, "15": 10.00, "20": 10.00, "30": 25.00 },
  "london city": { "5": 8.00, "10": 13.00, "15": null, "20": null, "30": null },
  "london gatwick": { "5": 10.00, "10": 10.00, "15": 15.00, "20": 20.00, "30": 30.00 },
  "london heathrow": { "5": 7.00, "10": 7.00, "15": null, "20": null, "30": null },
  "london luton": { "5": 7.00, "10": 7.00, "15": 12.00, "20": 17.00, "30": 27.00 },
  "london southend": { "5": 8.00, "10": 8.00, "15": null, "20": null, "30": null },
  "london stansted": { "5": 10.00, "10": 10.00, "15": 10.00, "20": 28.00, "30": 28.00 },
  "manchester": { "5": 5.00, "10": 6.40, "15": 25.00, "20": 25.00, "30": 25.00 },
  "newcastle": { "5": 6.00, "10": 6.00, "15": 12.00, "20": 12.00, "30": 12.00 },
  "norwich": { "5": 6.00, "10": 6.00, "15": 6.00, "20": 6.00, "30": 6.00 },
  "sumburgh": { "5": 0.00, "10": 0.00, "15": 0.00, "20": 0.00, "30": 0.00 },
  "southampton": { "5": 7.00, "10": 7.00, "15": 7.00, "20": 7.00, "30": null },
  "teesside": { "5": 2.50, "10": 2.50, "15": 5.00, "20": 5.00, "30": 5.00 }
};

function AutocompleteInput({ className, onPlaceSelected, ...props }: React.ComponentProps<typeof Input> & { onPlaceSelected?: (place: google.maps.places.PlaceResult | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;
    
    // Use the classic Autocomplete which easily attaches to existing inputs
    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name', 'types'],
    });

    if (onPlaceSelected) {
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          onPlaceSelected(place);
        } else {
          onPlaceSelected(null);
        }
      });
    }

    // Optional: prevent form submission when pressing enter on the autocomplete dropdown
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    };
    inputRef.current.addEventListener('keydown', handleKeyDown);

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener('keydown', handleKeyDown);
      }
      // autocomplete instance doesn't have a destroy method, but Google Maps
      // handles cleanup when the input is removed from the DOM
    };
  }, [placesLib, onPlaceSelected]);

  return <Input ref={inputRef} className={className} {...props} />;
}

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-gold selection:text-black">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <a href="#" className="flex items-center">
            <img 
              src="/cbc-logo.jpeg" 
              alt="Company Logo" 
              className="h-14 sm:h-16 md:h-20 w-auto object-contain"
            />
          </a>
          
          <a href="#" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs sm:text-sm font-medium tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </header>

      <main className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto bg-white/[0.02] p-8 md:p-12 border border-white/10 rounded-sm">
          <h1 className="text-4xl font-serif mb-8 text-white">Privacy Policy</h1>
          <p className="text-white/60 mb-8 text-sm">Last updated: {format(new Date(), 'MMMM d, yyyy')}</p>

          <div className="space-y-8 text-white/70 text-sm leading-relaxed">
            <section>
              <h2 className="text-xl font-medium text-white mb-4">1. Introduction</h2>
              <p>
                Welcome to Chauffeured By Cas. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white mb-4">2. The Data We Collect About You</h2>
              <p className="mb-4">
                Personal data, or personal information, means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                <li><strong>Contact Data</strong> includes billing address, email address and telephone numbers.</li>
                <li><strong>Transaction Data</strong> includes details about payments to and from you and other details of services you have purchased from us (such as pickup/dropoff locations and times).</li>
                <li><strong>Technical Data</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white mb-4">3. How We Use Your Personal Data</h2>
              <p className="mb-4">
                We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., providing your requested chauffeur service).</li>
                <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                <li>Where we need to comply with a legal obligation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white mb-4">4. Data Security</h2>
              <p>
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white mb-4">5. Data Retention</h2>
              <p>
                We will only retain your personal data for as long as reasonably necessary to fulfil the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements. We may retain your personal data for a longer period in the event of a complaint or if we reasonably believe there is a prospect of litigation in respect to our relationship with you.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white mb-4">6. Your Legal Rights</h2>
              <p className="mb-4">
                Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request access to your personal data.</li>
                <li>Request correction of your personal data.</li>
                <li>Request erasure of your personal data.</li>
                <li>Object to processing of your personal data.</li>
                <li>Request restriction of processing your personal data.</li>
                <li>Request transfer of your personal data.</li>
                <li>Right to withdraw consent.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium text-white mb-4">7. Contact Us</h2>
              <p>
                If you have any questions about this privacy policy or our privacy practices, please contact us at: <br/>
                Email: <a href="mailto:enquiries@chauffeuredbycas.com" className="text-gold hover:underline">enquiries@chauffeuredbycas.com</a><br/>
                Phone: <a href="tel:+447312250272" className="text-gold hover:underline">+44 7312 250272</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-black py-8 border-t border-white/10 text-center text-white/50 text-xs">
        <p>&copy; {new Date().getFullYear()} Chauffeured By Cas. All rights reserved.</p>
      </footer>
    </div>
  );
}

function AppContent() {
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitDuration, setWaitDuration] = useState<string>("5");
  
  const [pickupPlace, setPickupPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [estimatedMiles, setEstimatedMiles] = useState<number | null>(null);
  const [isPeak, setIsPeak] = useState<boolean>(false);
  const routesLib = useMapsLibrary('routes');

  const identifyAirport = (place: google.maps.places.PlaceResult | null) => {
    if (!place || (!place.name && !place.formatted_address)) return null;
    const isAirportType = place.types?.includes('airport');
    const name = place.name?.toLowerCase() || '';
    const address = place.formatted_address?.toLowerCase() || '';
    
    if (isAirportType || name.includes('airport') || address.includes('airport')) {
      for (const airport of Object.keys(AIRPORT_FEES)) {
        if (name.includes(airport) || address.includes(airport)) return airport;
      }
      if (name.includes('heathrow')) return 'london heathrow';
      if (name.includes('gatwick')) return 'london gatwick';
      if (name.includes('stansted')) return 'london stansted';
      if (name.includes('luton')) return 'london luton';
      if (name.includes('southend')) return 'london southend';
      if (name.includes('city') && name.includes('london')) return 'london city';
    }
    return null;
  };

  const pickupAirport = identifyAirport(pickupPlace);
  const dropoffAirport = identifyAirport(dropoffPlace);
  const airportName = pickupAirport || dropoffAirport;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  const [isHovered, setIsHovered] = useState(false);
  const [showBookButton, setShowBookButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const fleetSection = document.getElementById('fleet');
      if (fleetSection) {
        if (window.scrollY >= fleetSection.offsetTop - (window.innerHeight / 2)) {
          setShowBookButton(true);
        } else {
          setShowBookButton(false);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount to set initial state
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          // Reached the end, smoothly scroll back to start
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered]);

  useEffect(() => {
    if (!routesLib || !pickupPlace?.geometry?.location || !dropoffPlace?.geometry?.location) {
      setEstimatedPrice(null);
      setEstimatedMiles(null);
      return;
    }

    const directionsService = new routesLib.DirectionsService();

    directionsService.route({
      origin: pickupPlace.geometry.location,
      destination: dropoffPlace.geometry.location,
      travelMode: google.maps.TravelMode.DRIVING,
    }).then((response: google.maps.DirectionsResult) => {
      if (response && response.routes && response.routes.length > 0) {
        const route = response.routes[0];
        const distanceMeters = route.legs[0]?.distance?.value || 0;
        const distanceMiles = distanceMeters * 0.000621371;
        
        let pricePerMile = 2.0;
        let peak = false;
        if (date && time) {
          const [hours, minutes] = time.split(':').map(Number);
          const timeInMinutes = hours * 60 + minutes;
          const day = date.getDay();
          
          if (day >= 1 && day <= 5) {
            if ((timeInMinutes >= 480 && timeInMinutes <= 600) || (timeInMinutes >= 960 && timeInMinutes <= 1140)) {
              pricePerMile = 2.2;
              peak = true;
            }
          } else if (day === 6) {
            if (timeInMinutes >= 660 && timeInMinutes <= 780) {
              pricePerMile = 2.2;
              peak = true;
            }
          } else if (day === 0) {
            if (timeInMinutes >= 720 && timeInMinutes <= 1140) {
              pricePerMile = 2.2;
              peak = true;
            }
          }
        }
        
        setIsPeak(peak);
        
        let price = Math.max(5, Math.round(distanceMiles * pricePerMile));
        
        if (airportName && AIRPORT_FEES[airportName]) {
          const fee = AIRPORT_FEES[airportName][waitDuration as keyof typeof AIRPORT_FEES[string]];
          if (typeof fee === 'number') {
            price += fee;
          }
        }
        
        setEstimatedPrice(price);
        setEstimatedMiles(distanceMiles);
      } else {
        setEstimatedPrice(null);
        setEstimatedMiles(null);
        setIsPeak(false);
      }
    }).catch((err: any) => {
      console.error("Failed to compute route", err);
      setEstimatedPrice(null);
      setEstimatedMiles(null);
      setIsPeak(false);
    });
  }, [pickupPlace, dropoffPlace, routesLib, airportName, waitDuration, date, time]);

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        name: formData.get("name"),
        pickup: formData.get("pickup"),
        dropoff: formData.get("dropoff"),
        date: date ? format(date, "PPP") : null,
        time: formData.get("time"),
        vehicleOptions: formData.get("vehicle") || "Not selected",
        phone: formData.get("phone"),
        email: formData.get("email"),
        waitTime: airportName ? waitDuration : null
      };

      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to submit booking");
      }

      setBookingSuccess(true);
      toast.success("Booking confirmed! Your chauffeur has been reserved.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to confirm booking. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-gold selection:text-black">
      <Toaster theme="dark" position="top-center" />
      
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <a href="#" className="flex items-center">
            <img 
              src="/cbc-logo.jpeg" 
              alt="Company Logo" 
              className="h-14 sm:h-16 md:h-20 w-auto object-contain"
            />
          </a>
          
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-white/60">
            <a href="#fleet" className="hover:text-white transition-opacity duration-300">Our Fleet</a>
            <a href="#services" className="hover:text-white transition-opacity duration-300">Services</a>
            <a href="#why-us" className="hover:text-white transition-opacity duration-300">About Us</a>
            <a href="#contact" className="hover:text-white transition-opacity duration-300">Contact</a>
          </nav>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
              </span>
            </div>
            <Button 
              className="bg-gold text-black hover:bg-gold-hover border-none rounded-sm uppercase tracking-widest text-[10px] px-6"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=2000"
            alt="Luxury Mercedes"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/40 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full z-10 grid lg:grid-cols-2 gap-12 items-center mt-12">
          <div className="space-y-6">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold">Executive Travel Redefined</p>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif leading-[1.1] font-light">
              Premium <br />
              <span className="italic">Chauffeur</span> <br />
              Services.
            </h1>
            <p className="text-sm text-white/40 max-w-md leading-relaxed">
              <span className="font-serif text-white italic">Chauffered By Cas</span> - Experience the pinnacle of luxury, reliability, and comfort across the West Midlands and all major UK airports.
            </p>
          </div>

          {/* Booking Widget */}
          <div className="w-full max-w-xl lg:ml-auto p-8 bg-white/[0.02]">
            <Card className="bg-white/[0.03] border-white/10 rounded-sm shadow-none p-4 sm:p-6 md:p-8">
              <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-2xl font-serif text-white">Book Your Journey</h3>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mt-2">Real-time requests</p>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-[9px] uppercase tracking-widest opacity-40 text-white">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-4 md:top-3 h-4 w-4 text-white/40" />
                    <Input name="name" required placeholder="John Doe" className="w-full pl-9 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-gold rounded-sm h-12 md:h-10 text-sm md:text-xs" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 md:top-3 h-4 w-4 text-white/40" />
                    <AutocompleteInput onPlaceSelected={setPickupPlace} name="pickup" required placeholder="Pick-Up (e.g. Edgebaston Park Hotel, Birmingham, UK)" className="w-full pl-9 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-gold focus-visible:border-gold rounded-sm text-sm md:text-xs h-12 md:h-10" />
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 md:top-3 h-4 w-4 text-white/40" />
                    <AutocompleteInput onPlaceSelected={setDropoffPlace} name="dropoff" required placeholder="Drop-Off (e.g. Birmingham Airport, BHX)" className="w-full pl-9 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-gold focus-visible:border-gold rounded-sm text-sm md:text-xs h-12 md:h-10" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest opacity-40 text-white">Date</Label>
                    <Popover>
                      <PopoverTrigger render={
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-black/40 border-white/10 text-white h-12 md:h-10 rounded-sm hover:bg-white/5 hover:text-white text-sm md:text-xs",
                            !date && "text-white/30"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </Button>
                      } />
                      <PopoverContent className="w-auto p-0 border-white/10 bg-black/95 backdrop-blur-xl" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          className="bg-transparent text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest opacity-40 text-white">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-4 md:top-3 h-4 w-4 text-white/40" />
                      <Input name="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required className="w-full pl-9 bg-black/40 border-white/10 text-white focus-visible:ring-1 focus-visible:ring-gold rounded-sm h-12 md:h-10 text-sm md:text-xs [color-scheme:dark]" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] uppercase tracking-widest opacity-40 text-white">Vehicle Category</Label>
                  <Select name="vehicle" required>
                    <SelectTrigger className="w-full bg-black/40 border-white/10 text-white hover:bg-white/5 rounded-sm h-12 md:h-10 text-sm md:text-xs">
                       <SelectValue placeholder="Select vehicle class" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-bg border-white/10 text-white text-xs">
                      <SelectItem value="MERCEDES E-CLASS">MERCEDES E-CLASS (3 PASS, 2 LUGG)</SelectItem>
                      
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest opacity-40 text-white">Phone *</Label>
                    <Input name="phone" type="tel" required placeholder="+44 123 456 7890" className="w-full bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-gold rounded-sm h-12 md:h-10 text-sm md:text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest opacity-40 text-white">Email *</Label>
                    <Input name="email" type="email" required placeholder="you@example.com" className="w-full bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-gold rounded-sm h-12 md:h-10 text-sm md:text-xs" />
                  </div>
                </div>

                {airportName && (
                  <div className="space-y-2 mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <Label className="text-[9px] uppercase tracking-widest opacity-40 text-white">Wait Time at Airport</Label>
                    <Select name="waitTime" value={waitDuration} onValueChange={setWaitDuration}>
                      <SelectTrigger className="w-full bg-black/40 border-white/10 text-white hover:bg-white/5 rounded-sm h-12 md:h-10 text-sm md:text-xs">
                         <SelectValue placeholder="Select wait duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-bg border-white/10 text-white text-xs">
                        {(() => {
                          const limits = ["30", "20", "15", "10", "5"];
                          const maxTime = limits.find(t => AIRPORT_FEES[airportName][t as keyof typeof AIRPORT_FEES[string]] !== null);
                          return (
                            <>
                              <SelectItem value="5">{maxTime === "5" ? "Up To 5 Minutes" : "5 Minutes"}</SelectItem>
                              <SelectItem value="10">{maxTime === "10" ? "Up To 10 Minutes" : "10 Minutes"}</SelectItem>
                              {AIRPORT_FEES[airportName]["15"] !== null && <SelectItem value="15">{maxTime === "15" ? "Up To 15 Minutes" : "15 Minutes"}</SelectItem>}
                              {AIRPORT_FEES[airportName]["20"] !== null && <SelectItem value="20">{maxTime === "20" ? "Up To 20 Minutes" : "20 Minutes"}</SelectItem>}
                              {AIRPORT_FEES[airportName]["30"] !== null && <SelectItem value="30">{maxTime === "30" ? "Up To 30 Minutes" : "30 Minutes"}</SelectItem>}
                            </>
                          );
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {estimatedPrice !== null && (
                  <div className="mt-4 p-4 bg-white/[0.03] border border-white/10 rounded-sm">
                    <p className="text-xs text-white/70 flex justify-between items-center mb-1">
                      <span className="uppercase tracking-widest text-[9px] opacity-60">Estimated Price</span>
                      <span className="font-bold text-lg text-gold mr-1">£{estimatedPrice}</span>
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">Based on an estimated distance of {estimatedMiles?.toFixed(1)} miles at £2.00 per mile (minimum £5 charge){isPeak ? ' + 20p/mile peak time surcharge' : ''}{airportName ? ' + airport wait fee' : ''}.</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isSubmitting || !date}
                  className="w-full py-6 mt-4 bg-gold text-black hover:bg-gold-hover rounded-sm uppercase tracking-[0.2em] text-[11px] font-bold transition-colors h-auto"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">Processing <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin"/></span>
                  ) : (
                    <span className="flex items-center gap-2">Reserve My Journey</span>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section id="fleet" className="py-24 bg-dark-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold mb-4">Our Fleet</p>
              <h2 className="text-4xl md:text-5xl font-serif font-light text-white">Luxury & Comfort.</h2>
            </div>
            <p className="text-white/50 max-w-sm text-sm leading-relaxed">
              Meticulously maintained vehicles for corporate travel, airport transfers, and special events.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group cursor-pointer">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-white/5 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img src="/Merc_e-class_1.jpeg" alt="E-Class" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 shadow-xl" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-xl font-medium mb-2">Mercedes E-Class</h3>
              <div className="flex items-center gap-6 text-sm text-white/50">
                <span className="flex items-center gap-2"><Users className="w-4 h-4"/> 3</span>
                <span className="flex items-center gap-2"><Luggage className="w-4 h-4"/> 2</span>
                <span className="flex items-center gap-2"><CarFront className="w-4 h-4"/> Business</span>
              </div>
            </div>

            <div className="group cursor-default opacity-80">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-white/5 relative bg-white/5">
                <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center backdrop-grayscale">
                  <span className="uppercase tracking-widest text-white/90 text-xs font-medium px-4 py-2 border border-white/20 rounded-full bg-black/40 backdrop-blur-sm">Coming Soon</span>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Mercedes-Benz_W447_V_250d_AMG_Line_Black_%281%29.jpg" alt="V-Class" className="w-full h-full object-cover grayscale opacity-50" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-white/60">Mercedes V-Class</h3>
              <div className="flex items-center gap-6 text-sm text-white/30">
                <span className="flex items-center gap-2"><Users className="w-4 h-4"/> 7</span>
                <span className="flex items-center gap-2"><Luggage className="w-4 h-4"/> 7</span>
                <span className="flex items-center gap-2"><CarFront className="w-4 h-4"/> Group/Family</span>
              </div>
            </div>

            <div className="group cursor-default opacity-80">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-white/5 relative bg-white/5">
                <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center backdrop-grayscale">
                  <span className="uppercase tracking-widest text-white/90 text-xs font-medium px-4 py-2 border border-white/20 rounded-full bg-black/40 backdrop-blur-sm">Coming Soon</span>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Mercedes-Benz_W223_S_400d_4MATIC_AMG_Line_Obsidian_Black_%281%29.jpg" alt="S-Class" className="w-full h-full object-cover grayscale opacity-50" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-xl font-medium mb-2 text-white/60">Mercedes S-Class</h3>
              <div className="flex items-center gap-6 text-sm text-white/30">
                <span className="flex items-center gap-2"><Users className="w-4 h-4"/> 3</span>
                <span className="flex items-center gap-2"><Luggage className="w-4 h-4"/> 2</span>
                <span className="flex items-center gap-2"><CarFront className="w-4 h-4"/> Executive</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-dark-bg border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold mb-4">Our Services</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light text-white">Travel with Luxury.</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="relative p-8 rounded-2xl overflow-hidden border border-white/5 group min-h-[300px] flex flex-col justify-end">
              <div className="absolute inset-0 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800" alt="Airport Transfers" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10"></div>
              
              <div className="relative z-20 bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 group-hover:bg-black/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-white mb-2 drop-shadow-md">Airport Transfers</h3>
                <p className="text-sm text-white/90 leading-relaxed font-normal drop-shadow-sm mb-4">Relax before and after your flight with our punctual airport transfer services across all major UK airports.</p>
                <a href="#airport-fees" className="inline-flex items-center justify-center bg-gold text-black hover:bg-gold-hover text-[11px] font-bold uppercase tracking-widest py-3 px-6 rounded-sm transition-colors mt-2">See Airport Fees</a>
              </div>
            </div>
            
            <div className="relative p-8 rounded-2xl overflow-hidden border border-white/5 group min-h-[300px] flex flex-col justify-end">
              <div className="absolute inset-0 overflow-hidden">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c4/Mercedes-Benz_W214_E_450_4MATIC_EXCLUSIVE_Obsidian_Black_%282%29.jpg" alt="Day-To-Day Luxury Travel" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10"></div>

              <div className="relative z-20 bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 group-hover:bg-black/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-white mb-2 drop-shadow-md">Day-To-Day Luxury Travel</h3>
                <p className="text-sm text-white/90 leading-relaxed font-normal drop-shadow-sm">Experience ultimate comfort in your everyday journeys, whether shopping, dining, or simply exploring the city.</p>
              </div>
            </div>
            
            <div className="relative p-8 rounded-2xl overflow-hidden border border-white/5 group min-h-[300px] flex flex-col justify-end">
              <div className="absolute inset-0 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800" alt="Corporate Travel" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10"></div>

              <div className="relative z-20 bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 group-hover:bg-black/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-white mb-2 drop-shadow-md">Corporate Travel</h3>
                <p className="text-sm text-white/90 leading-relaxed font-normal drop-shadow-sm">Impress your clients and ensure your executives travel in style, prioritizing privacy and professionalism.</p>
              </div>
            </div>
            
            <div className="relative p-8 rounded-2xl overflow-hidden border border-white/5 group min-h-[300px] flex flex-col justify-end">
              <div className="absolute inset-0 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=800" alt="Event Chauffeurs" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10"></div>

              <div className="relative z-20 bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 group-hover:bg-black/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-white mb-2 drop-shadow-md">Event Chauffeurs</h3>
                <p className="text-sm text-white/90 leading-relaxed font-normal drop-shadow-sm">Arrive making a statement at any special occasion, gala, or sporting event with a dedicated chauffeur.</p>
              </div>
            </div>
            
            <div className="relative p-8 rounded-2xl overflow-hidden border border-white/5 group min-h-[300px] flex flex-col justify-end">
              <div className="absolute inset-0 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=800" alt="Wedding Cars" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              </div>
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors z-10"></div>

              <div className="relative z-20 bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 group-hover:bg-black/50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <svg className="w-6 h-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-normal text-white mb-2 drop-shadow-md">Wedding Cars</h3>
                <p className="text-sm text-white/90 leading-relaxed font-normal drop-shadow-sm">Add a touch of elegance to your special day with our immaculate luxury vehicles and suited chauffeurs.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-us" className="py-24 bg-dark-bg border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold mb-4">Why Chauffeured By Cas</p>
                <h2 className="text-4xl md:text-5xl font-serif font-light text-white leading-tight">
                  More than just a <br /> journey.
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                    <Clock className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Punctuality Guaranteed</h4>
                    <p className="text-white/50 text-sm leading-relaxed">Our chauffeurs arrive 15 minutes prior to your booking. Flight tracking ensures we're there even if your flight is delayed.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                    <Users className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Professional Chauffeurs</h4>
                    <p className="text-white/50 text-sm leading-relaxed">Fully licensed, experienced, and discreet professionals dedicated to providing a premium service tailored to your needs.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
                    <CarFront className="w-5 h-5 text-white/80" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Immaculate Vehicles</h4>
                    <p className="text-white/50 text-sm leading-relaxed">Our top-of-the-range Mercedes-Benz fleet is meticulously maintained, featuring complimentary Wi-Fi and refreshments.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative z-10">
                <img src="/chauffeur.png" alt="Professional chauffeur welcoming you" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 h-48 bg-gold/10 rounded-3xl -z-10 blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section (hidden for now) */}
      <section id="testimonials" className="hidden py-24 bg-dark-bg border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-serif font-light text-white text-center mb-16">Rated Excellent By Our Passengers</h2>
          
          <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch">
            {/* Summary Box */}
            <div className="w-full lg:w-64 shrink-0 flex flex-col items-center justify-center p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
              <h3 className="font-bold text-xl tracking-widest text-white mb-4">EXCELLENT</h3>
              <div className="flex gap-1 mb-2">
                 {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-gold text-gold" />)}
              </div>
              <p className="text-white/60 text-sm mb-4">Based on <strong>224 reviews</strong></p>
              <div className="mt-2 flex justify-center">
                <img src="/google-logo.png" alt="Google" className="h-8 object-contain" />
              </div>
            </div>

            {/* Cards Container */}
            <div 
              className="flex-1 relative w-full group"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onTouchStart={() => setIsHovered(true)}
              onTouchEnd={() => setIsHovered(false)}
            >
              <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-10 h-10 rounded-full bg-black border border-white/20 items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg opacity-0 group-hover:opacity-100 hidden md:flex">
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-10 h-10 rounded-full bg-black border border-white/20 items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg opacity-0 group-hover:opacity-100 hidden md:flex">
                <ChevronRight className="w-5 h-5" />
              </button>

              <div 
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 px-2 no-scrollbar"
              >
                {TESTIMONIALS.map((t, i) => (
                   <div key={i} className="w-[300px] shrink-0 snap-start bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col hover:bg-white/[0.04] transition-colors relative">
                      {/* Google Logo small */}
                      <div className="absolute top-6 right-6">
                        <img src="/google-small.png" alt="Google" className="w-5 h-5 object-contain" />
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", t.color)}>
                          {t.initials}
                        </div>
                        <div>
                          <h4 className="font-medium text-white text-sm">{t.name}</h4>
                          <span className="text-white/40 text-[11px]">{t.time}</span>
                        </div>
                      </div>

                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, j) => <Star key={j} className="w-3 h-3 fill-gold text-gold" />)}
                        <CheckCircle2 className="w-3 h-3 text-blue-500 fill-white ml-1" />
                      </div>

                      <p className="text-white/70 text-sm leading-relaxed mb-3 flex-1 line-clamp-4">
                        {t.text}
                      </p>

                      <button className="text-white/40 hover:text-white text-xs text-left transition-colors w-max">
                        Read more
                      </button>
                   </div>
                ))}
              </div>
              
              {/* faded edges */}
              <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-dark-bg to-transparent pointer-events-none z-10 md:block hidden"></div>
              <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-dark-bg to-transparent pointer-events-none z-10 md:block hidden"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-dark-bg border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gold/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold mb-4">Contact Us</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light text-white mb-6">
              Get in Touch
            </h2>
            <p className="text-white/50 text-sm leading-relaxed">
              Based in the West Midlands, we provide premium executive travel and chauffeur services across the UK. Contact our team to discuss your bespoke requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Contact Details */}
            <div className="space-y-10">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 shrink-0">
                  <Phone className="w-5 h-5 text-gold" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-medium mb-1">Telephone</h4>
                  <p className="text-white/50 text-sm mb-3">Available 24/7 for bookings and inquiries.</p>
                  <a href="tel:+447312250272" className="text-xl font-light text-white hover:text-gold transition-colors block">
                    +44 7312 250272
                  </a>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 shrink-0">
                  <Mail className="w-5 h-5 text-gold" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-medium mb-1">Email</h4>
                  <p className="text-white/50 text-sm mb-3">We aim to respond to all emails within 1 hour.</p>
                  <a href="mailto:enquiries@chauffeuredbycas.com" className="text-base sm:text-xl font-light text-white hover:text-gold transition-colors block break-all sm:break-normal">
                    enquiries@chauffeuredbycas.com
                  </a>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 shrink-0">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-medium mb-1">Location</h4>
                  <p className="text-white/50 text-sm leading-relaxed">
                    West Midlands, United Kingdom<br />
                    Serving London, Birmingham, and all major UK airports.
                  </p>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-square md:aspect-[4/3] bg-white/5 group">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 pointer-events-none z-10"></div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d155455.51737750796!2d-2.0232532431713337!3d52.47752150965313!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4870942d1b417173%3A0xca81fef0aeee7998!2sBirmingham!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Success Dialog */}
      <Dialog open={bookingSuccess} onOpenChange={setBookingSuccess}>
        <DialogContent className="bg-dark-bg border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-center text-xl font-light">Booking Confirmed</DialogTitle>
            <DialogDescription className="text-center text-white/60">
              Your reservation has been received. A member of our concierge team will contact you shortly to confirm the details.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-center">
            <Button className="bg-gold text-black hover:bg-gold-hover uppercase tracking-widest text-[11px] px-8 rounded-sm" onClick={() => setBookingSuccess(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-black py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-sm text-white/50">
          <div className="col-span-2 md:col-span-1 border-white/10 pb-8 md:pb-0">
            <div className="flex items-center mb-6">
              <img 
                src="/cbc-logo.jpeg" 
                alt="Company Logo" 
                className="h-20 sm:h-24 md:h-28 w-auto object-contain"
              />
            </div>
            <p className="leading-relaxed text-xs">
              Chauffeured By Cas provides premium chauffeur services and airport transfers across the West Midlands, combining luxury with absolute reliability.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium uppercase tracking-widest text-xs mb-6">Company</h4>
            <div className="flex flex-col gap-3">
              <a href="#why-us" className="hover:text-white transition-colors">About Us</a>
              {/* <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a> */}
              <a href="#" className="hover:text-white transition-colors">Book A Chauffeur</a>
              <a href="#contact" className="hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium uppercase tracking-widest text-xs mb-6">Services</h4>
            <div className="flex flex-col gap-3">
              <a href="#services" className="hover:text-white transition-colors">Airport Transfers</a>
              <a href="#services" className="hover:text-white transition-colors">Corporate Travel</a>
              <a href="#services" className="hover:text-white transition-colors">Event Chauffeurs</a>
              <a href="#services" className="hover:text-white transition-colors">Wedding Cars</a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium uppercase tracking-widest text-xs mb-6">Contact Us</h4>
            <div className="flex flex-col gap-3 min-w-0">
              <p>Birmingham, UK</p>
              <a href="tel:+447312250272" className="hover:text-white transition-colors">+44 7312 250272</a>
              <a href="mailto:enquiries@chauffeuredbycas.com" className="hover:text-white transition-colors break-all sm:break-normal">enquiries@chauffeuredbycas.com</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>&copy; {new Date().getFullYear()} Chauffeured By Cas. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-white transition-colors">Book A Chauffeur</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>
      
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={cn(
          "fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-gold hover:bg-gold/90 text-black py-3 px-5 md:py-3 md:px-6 rounded-full shadow-[0_4px_20px_rgba(197,160,89,0.3)] transition-all duration-700 z-50 group flex items-center justify-center gap-2",
          showBookButton ? "opacity-100 translate-y-0 hover:scale-105" : "opacity-0 translate-y-8 pointer-events-none"
        )}
        aria-label="Book Chauffeur"
      >
        <span className="text-xs font-semibold uppercase tracking-widest">Book Chauffeur</span>
        <ArrowUp className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-y-1 transition-transform" />
      </button>
    </div>
  );
}

function AirportFeesPage() {
  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-gold selection:text-black">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <a href="#" className="flex items-center">
            <img 
              src="/cbc-logo.jpeg" 
              alt="Company Logo" 
              className="h-14 sm:h-16 md:h-20 w-auto object-contain"
            />
          </a>
          
          <a href="#" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs sm:text-sm font-medium tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </a>
        </div>
      </header>

      <main className="pt-40 pb-24 px-6 md:px-0">
        <div className="max-w-5xl mx-auto bg-white/[0.02] p-8 md:p-12 border border-white/10 rounded-sm">
          <h1 className="text-4xl font-serif mb-8 text-white">Airport Drop-off Charges</h1>
          <p className="text-white/60 mb-8 text-sm">Below are the estimated wait times and corresponding drop-off charges for UK airports.</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 border-b border-white/10 text-gold">
                <tr>
                  <th className="p-4 font-medium">Airport</th>
                  <th className="p-4 font-medium">5 mins</th>
                  <th className="p-4 font-medium">10 mins</th>
                  <th className="p-4 font-medium">15 mins</th>
                  <th className="p-4 font-medium">20 mins</th>
                  <th className="p-4 font-medium">Up to 30 mins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/70">
                {Object.entries(AIRPORT_FEES).map(([airport, fees]) => (
                  <tr key={airport} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 capitalize">{airport}</td>
                    <td className="p-4">{fees["5"] === null ? "FINE" : fees["5"] === 0 ? "FREE" : `£${fees["5"].toFixed(2)}`}</td>
                    <td className="p-4">{fees["10"] === null ? "FINE" : fees["10"] === 0 ? "FREE" : `£${fees["10"].toFixed(2)}`}</td>
                    <td className="p-4">{fees["15"] === null ? "FINE" : fees["15"] === 0 ? "FREE" : `£${fees["15"].toFixed(2)}`}</td>
                    <td className="p-4">{fees["20"] === null ? "FINE" : fees["20"] === 0 ? "FREE" : `£${fees["20"].toFixed(2)}`}</td>
                    <td className="p-4">{fees["30"] === null ? "FINE" : fees["30"] === 0 ? "FREE" : `£${fees["30"].toFixed(2)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="bg-black py-8 border-t border-white/10 text-center text-white/50 text-xs">
        <p>&copy; {new Date().getFullYear()} Chauffeured By Cas. All rights reserved.</p>
      </footer>
    </div>
  );
}

function AppRouter() {
  const getInitialPath = () => {
    const hash = window.location.hash;
    if (hash === '#privacy' || hash === '#airport-fees') return hash;
    return '#';
  };

  const [currentPath, setCurrentPath] = useState(getInitialPath());

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#privacy' || hash === '#airport-fees') {
        setCurrentPath(hash);
        window.scrollTo(0, 0);
      } else if (currentPath === '#privacy' || currentPath === '#airport-fees') {
        setCurrentPath('#');
        if (hash === '#' || !hash) {
          window.scrollTo(0, 0);
        } else {
          setTimeout(() => {
            document.querySelector(hash)?.scrollIntoView();
          }, 0);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentPath]);

  if (currentPath === '#privacy') {
    return <PrivacyPolicyPage />;
  }
  
  if (currentPath === '#airport-fees') {
    return <AirportFeesPage />;
  }

  return <AppContent />;
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!hasValidKey) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',backgroundColor:'#050505',color:'white',fontFamily:'sans-serif'}}>
        <div style={{textAlign:'center',maxWidth:520}}>
          <h2 style={{color: '#C5A059', marginBottom: '1rem'}}>Google Maps API Key Required</h2>
          <p>Please enter your API Key to use Address Autocomplete.</p>
          <p><strong>Step 1:</strong> <a href="https://console.cloud.google.com/google/maps-apis/start" target="_blank" rel="noopener" style={{color: '#fff', textDecoration: 'underline'}}>Get an API Key</a></p>
          <p><strong>Step 2:</strong> Add your key as a secret:</p>
          <ul style={{textAlign:'left',lineHeight:'1.8', margin: '20px 0'}}>
            <li>Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
            <li>Select <strong>Secrets</strong></li>
            <li>Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
            <li>Paste your API key as the value, press <strong>Enter</strong></li>
          </ul>
          <p style={{fontSize: '0.875rem', opacity: 0.7}}>The app will rebuild automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          >
            <img src="/cbc-logo.jpeg" alt="Company Logo" className="w-[80vw] sm:w-[60vw] md:w-auto h-auto md:h-72 lg:h-96 max-w-[90vw] object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
      <APIProvider apiKey={API_KEY} version="weekly">
        <AppRouter />
      </APIProvider>
    </>
  );
}
