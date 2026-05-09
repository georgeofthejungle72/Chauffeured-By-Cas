import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { MapPin, Calendar as CalendarIcon, Clock, Users, Luggage, CarFront, CheckCircle2 } from "lucide-react";
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

function AutocompleteInput({ className, onPlaceSelected, ...props }: React.ComponentProps<typeof Input> & { onPlaceSelected?: (place: google.maps.places.PlaceResult | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;
    
    // Use the classic Autocomplete which easily attaches to existing inputs
    const autocomplete = new placesLib.Autocomplete(inputRef.current, {
      fields: ['formatted_address', 'geometry', 'name'],
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

function AppContent() {
  const [date, setDate] = useState<Date>();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [pickupPlace, setPickupPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const routesLib = useMapsLibrary('routes');

  useEffect(() => {
    if (!routesLib || !pickupPlace?.geometry?.location || !dropoffPlace?.geometry?.location) {
      setEstimatedPrice(null);
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
        const distanceMiles = distanceMeters * 0.001051371;
        setEstimatedPrice(Math.round(distanceMiles * 3));
      } else {
        setEstimatedPrice(null);
      }
    }).catch((err: any) => {
      console.error("Failed to compute route", err);
      setEstimatedPrice(null);
    });

  }, [pickupPlace, dropoffPlace, routesLib]);

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        pickup: formData.get("pickup"),
        dropoff: formData.get("dropoff"),
        date: date ? format(date, "PPP") : null,
        time: formData.get("time"),
        vehicleOptions: formData.get("vehicle") || "Not selected",
        phone: formData.get("phone"),
        email: formData.get("email")
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
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-dark-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-white/20 flex items-center justify-center rotate-45">
              <span className="-rotate-45 text-xs font-serif tracking-widest text-white">MTS</span>
            </div>
            <span className="text-lg font-serif tracking-[0.2em] uppercase text-white hidden sm:block">Chauffeur</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-widest text-white/60">
            <a href="#services" className="hover:text-white transition-opacity duration-300">Services</a>
            <a href="#fleet" className="hover:text-white transition-opacity duration-300">Our Fleet</a>
            <a href="#contact" className="hover:text-white transition-opacity duration-300">Contact</a>
          </nav>
          
          <Button variant="outline" className="border-gold text-gold hover:bg-gold hover:text-black rounded-sm uppercase tracking-widest text-[10px] px-6">
            Client Login
          </Button>
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
            <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] font-light">
              Premium <br />
              <span className="italic">Chauffeur</span> <br />
              Services.
            </h1>
            <p className="text-sm text-white/40 max-w-md leading-relaxed">
              Experience the pinnacle of luxury, reliability, and comfort across the West Midlands and all major UK airports.
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
                <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 md:top-3 h-4 w-4 text-white/40" />
                    <AutocompleteInput onPlaceSelected={setPickupPlace} name="pickup" required placeholder="Pick-Up (e.g. Edgebaston Park Hotel, Birmingham, UK)" className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-gold focus-visible:border-gold rounded-sm text-sm md:text-xs h-12 md:h-10" />
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 md:top-3 h-4 w-4 text-white/40" />
                    <AutocompleteInput onPlaceSelected={setDropoffPlace} name="dropoff" required placeholder="Drop-Off (e.g. Birmingham Airport, BHX)" className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-gold focus-visible:border-gold rounded-sm text-sm md:text-xs h-12 md:h-10" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 md:space-y-0 space-y-4">
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
                      <Input name="time" type="time" required className="pl-9 bg-black/40 border-white/10 text-white focus-visible:ring-1 focus-visible:ring-gold rounded-sm h-12 md:h-10 text-sm md:text-xs [color-scheme:dark]" />
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
                      <SelectItem value="MERCEDES S-CLASS">MERCEDES S-CLASS (3 PASS, 2 LUGG)</SelectItem>
                      <SelectItem value="MERCEDES V-CLASS">MERCEDES V-CLASS (7 PASS, 7 LUGG)</SelectItem>
                      <SelectItem value="MERCEDES E-CLASS">MERCEDES E-CLASS (3 PASS, 2 LUGG)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 space-y-4 sm:space-y-0">
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest opacity-40 text-white">Phone *</Label>
                    <Input name="phone" type="tel" required placeholder="+44 123 456 7890" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-gold rounded-sm h-12 md:h-10 text-sm md:text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase tracking-widest opacity-40 text-white">Email *</Label>
                    <Input name="email" type="email" required placeholder="you@example.com" className="bg-black/40 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-gold rounded-sm h-12 md:h-10 text-sm md:text-xs" />
                  </div>
                </div>

                {estimatedPrice !== null && (
                  <div className="mt-4 p-4 bg-white/[0.03] border border-white/10 rounded-sm">
                    <p className="text-xs text-white/70 flex justify-between items-center">
                      <span className="uppercase tracking-widest text-[9px] opacity-60">Estimated Price</span>
                      <span className="font-bold text-lg text-gold mr-1">£{estimatedPrice}</span>
                    </p>
                    <p className="text-[10px] text-white/30 mt-1">Based on an estimated distance at £3 per mile.</p>
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
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/cd/Mercedes-Benz_W223_S_400d_4MATIC_AMG_Line_Obsidian_Black_%281%29.jpg" alt="S-Class" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-xl font-medium mb-2">Mercedes S-Class</h3>
              <div className="flex items-center gap-6 text-sm text-white/50">
                <span className="flex items-center gap-2"><Users className="w-4 h-4"/> 3</span>
                <span className="flex items-center gap-2"><Luggage className="w-4 h-4"/> 2</span>
                <span className="flex items-center gap-2"><CarFront className="w-4 h-4"/> Executive</span>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-white/5 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Mercedes-Benz_W447_V_250d_AMG_Line_Black_%281%29.jpg" alt="V-Class" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-xl font-medium mb-2">Mercedes V-Class</h3>
              <div className="flex items-center gap-6 text-sm text-white/50">
                <span className="flex items-center gap-2"><Users className="w-4 h-4"/> 7</span>
                <span className="flex items-center gap-2"><Luggage className="w-4 h-4"/> 7</span>
                <span className="flex items-center gap-2"><CarFront className="w-4 h-4"/> Group/Family</span>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6 border border-white/5 relative">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c4/Mercedes-Benz_W214_E_450_4MATIC_EXCLUSIVE_Obsidian_Black_%282%29.jpg" alt="E-Class" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 shadow-xl" referrerPolicy="no-referrer" />
              </div>
              <h3 className="text-xl font-medium mb-2">Mercedes E-Class</h3>
              <div className="flex items-center gap-6 text-sm text-white/50">
                <span className="flex items-center gap-2"><Users className="w-4 h-4"/> 3</span>
                <span className="flex items-center gap-2"><Luggage className="w-4 h-4"/> 2</span>
                <span className="flex items-center gap-2"><CarFront className="w-4 h-4"/> Business</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="services" className="py-24 bg-dark-bg border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-gold mb-4">Why MTS</p>
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
      <footer id="contact" className="bg-dark-bg py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-sm text-white/50">
          <div className="col-span-2 md:col-span-1 border-white/10 pb-8 md:pb-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 border border-white/20 flex items-center justify-center rotate-45">
                <span className="-rotate-45 text-xs font-serif tracking-widest text-white">MTS</span>
              </div>
              <span className="text-lg font-serif tracking-[0.2em] uppercase text-white hidden sm:block">Chauffeur</span>
            </div>
            <p className="leading-relaxed text-xs">
              MTS provides premium chauffeur services and airport transfers across the West Midlands, combining luxury with absolute reliability.
            </p>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium uppercase tracking-widest text-xs mb-6">Company</h4>
            <div className="flex flex-col gap-3">
              <a href="#" className="hover:text-white transition-colors">About Us</a>
              <a href="#" className="hover:text-white transition-colors">Testimonials</a>
              <a href="#" className="hover:text-white transition-colors">Business Accounts</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium uppercase tracking-widest text-xs mb-6">Services</h4>
            <div className="flex flex-col gap-3">
              <a href="#" className="hover:text-white transition-colors">Airport Transfers</a>
              <a href="#" className="hover:text-white transition-colors">Corporate Travel</a>
              <a href="#" className="hover:text-white transition-colors">Event Chauffeurs</a>
              <a href="#" className="hover:text-white transition-colors">Wedding Cars</a>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-white font-medium uppercase tracking-widest text-xs mb-6">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <p>Birmingham, UK</p>
              <a href="tel:+447830963163" className="hover:text-white transition-colors">+44 (0) 7830 963 163</a>
              <a href="mailto:info@mehditravelservices.com" className="hover:text-white transition-colors">info@mehditravelservices.com</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>&copy; {new Date().getFullYear()} MTS Chauffeur Services. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
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
    <APIProvider apiKey={API_KEY} version="weekly">
      <AppContent />
    </APIProvider>
  );
}
