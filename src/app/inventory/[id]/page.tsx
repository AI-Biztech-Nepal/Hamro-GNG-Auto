"use client"

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Gauge, Bike, ChevronLeft, Phone, MessageCircle, Share2, ShieldCheck, MapPin, Loader2 } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Vehicle } from '@/types/vehicle';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useEffect, useState } from 'react';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const db = useFirestore();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  
  const vehicleRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'vehicles', id as string);
  }, [db, id]);

  const { data: vehicle, isLoading } = useDoc<Vehicle>(vehicleRef);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-40 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xl font-medium text-muted-foreground">Fetching vehicle details...</p>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <h1 className="text-3xl font-bold">Vehicle Not Found</h1>
        <Button onClick={() => router.push('/inventory')}>Back to Inventory</Button>
      </div>
    );
  }

  const whatsappMessage = `Hello Hamro G&G Auto, I am interested in the ${vehicle.title} (${vehicle.year} model) priced at NPR ${vehicle.price.toLocaleString()}. Is it still available?`;
  const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
  const images = vehicle.image_urls || ['https://picsum.photos/seed/vehicle/800/600'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <span className="text-sm text-muted-foreground">Inventory / {vehicle.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Media */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-gray-100 rounded-3xl overflow-hidden shadow-sm relative group">
            <Carousel setApi={setApi} className="w-full">
              <CarouselContent>
                {images.map((url, index) => (
                  <CarouselItem key={index}>
                    <div className="relative flex items-center justify-center bg-gray-100 min-h-[400px] md:min-h-[600px] w-full">
                      <Image 
                        src={url} 
                        alt={`${vehicle.title} - Image ${index + 1}`} 
                        fill
                        priority={index === 0}
                        className="object-contain transition-transform duration-500"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm border-none shadow-lg h-12 w-12" />
                  <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm border-none shadow-lg h-12 w-12" />
                  
                  {/* Indicators / Dots */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                    {images.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          current === i + 1 ? 'w-8 bg-primary' : 'w-2 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </Carousel>
            
            {vehicle.status === 'sold' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                <span className="text-white font-black text-4xl md:text-7xl tracking-widest -rotate-12 border-8 border-white p-6 rounded-xl">SOLD</span>
              </div>
            )}
          </div>

          {/* Specs Grid */}
          <div className="bg-white p-8 rounded-3xl shadow-xl border grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Year</p>
              <div className="flex items-center gap-3 font-bold text-xl">
                <div className="bg-primary/10 p-2 rounded-lg"><Calendar className="w-5 h-5 text-primary" /></div>
                <span>{vehicle.year}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">KM Run</p>
              <div className="flex items-center gap-3 font-bold text-xl">
                <div className="bg-primary/10 p-2 rounded-lg"><Gauge className="w-5 h-5 text-primary" /></div>
                <span>{vehicle.km_run.toLocaleString()} KM</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Brand</p>
              <div className="flex items-center gap-3 font-bold text-xl">
                <div className="bg-primary/10 p-2 rounded-lg"><Bike className="w-5 h-5 text-primary" /></div>
                <span>{vehicle.brand}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Condition</p>
              <div className="flex items-center gap-3 font-bold text-xl">
                <div className="bg-primary/10 p-2 rounded-lg"><ShieldCheck className="w-5 h-5 text-primary" /></div>
                <span>{vehicle.condition}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border space-y-6">
            <h2 className="font-headline font-bold text-3xl">Owner's Description</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium">
              {vehicle.description}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing and CTA */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border-4 border-gray-50 space-y-8 sticky top-24">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h1 className="font-headline font-bold text-3xl md:text-4xl tracking-tight">{vehicle.title}</h1>
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 shrink-0"><Share2 className="w-5 h-5" /></Button>
              </div>
              <div className="flex items-baseline gap-2 text-primary font-black text-5xl">
                <span className="text-xl">NPR</span>
                <span>{vehicle.price.toLocaleString()}</span>
              </div>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-4 py-1.5 rounded-full font-bold text-xs">
                {vehicle.status.toUpperCase()}
              </Badge>
            </div>

            <div className="space-y-4 pt-4">
              <Button 
                className="w-full h-16 bg-primary hover:bg-primary/90 text-xl font-bold gap-3 rounded-2xl shadow-xl shadow-primary/20"
                asChild
              >
                <a href={`tel:${CONTACT_INFO.phone}`}>
                  <Phone className="w-6 h-6" /> Call Now
                </a>
              </Button>
              <Button 
                className="w-full h-16 bg-[#25D366] hover:bg-[#25D366]/90 text-white text-xl font-bold gap-3 border-none rounded-2xl shadow-xl shadow-green-500/20"
                asChild
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-6 h-6" /> WhatsApp
                </a>
              </Button>
            </div>

            <div className="pt-8 border-t space-y-6">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="bg-white p-2 rounded-xl shadow-sm"><MapPin className="w-6 h-6 text-primary" /></div>
                <div className="text-sm">
                  <p className="font-bold text-foreground">Showroom Location</p>
                  <a 
                    href={CONTACT_INFO.mapsLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    {CONTACT_INFO.address}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl text-primary text-sm font-bold border border-primary/10">
                <ShieldCheck className="w-6 h-6" />
                <span>Genuine Paperwork Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
