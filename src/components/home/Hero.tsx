
"use client"

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, BadgeCheck, Clock, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { CONTACT_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Hero() {
  const [isSliding, setIsSliding] = useState(false);
  const db = useFirestore();
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'general');
  }, [db]);
  const { data: settings } = useDoc(settingsRef);

  const heroImage = settings?.hero_image_url || CONTACT_INFO.heroUrl;

  const handleBadgeClick = () => {
    setIsSliding(true);
    setTimeout(() => setIsSliding(false), 1200);
  };

  return (
    <div className="relative min-h-[60vh] lg:min-h-[85vh] flex items-center overflow-hidden bg-white">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 transform origin-top-right hidden lg:block" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-center lg:text-left space-y-10">
            <div className="space-y-6">
              {/* Premium Badge: Desktop Only with Smooth Slide Interaction */}
              <div 
                onClick={handleBadgeClick}
                className={cn(
                  "hidden md:inline-flex items-center gap-2 bg-primary/10 px-5 py-2.5 rounded-full text-primary font-bold text-sm h-fit whitespace-nowrap shadow-sm border border-primary/10 cursor-pointer select-none transition-all hover:bg-primary/20",
                  isSliding ? "animate-out slide-out-to-right duration-1000 fill-mode-forwards" : "animate-in fade-in slide-in-from-left duration-1000"
                )}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                KATHMANDU'S #1 SECOND-HAND HUB
              </div>

              <h1 className="font-headline font-bold text-4xl md:text-7xl text-foreground leading-[1.1] tracking-tight text-balance">
                Ride Your <br />
                <span className="text-primary">Dream</span> With <br className="hidden md:block" />
                Confidence
              </h1>
              
              <p className="text-base md:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                Find reliable, inspected, and fairly priced second-hand bikes and scooters. Your journey to a perfect ride starts here.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Button size="lg" className="h-14 px-8 bg-primary hover:bg-primary/90 text-lg font-bold rounded-full shadow-2xl shadow-primary/30 group" asChild>
                <Link href="/inventory">
                  Explore Inventory <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-primary/20 hover:border-primary hover:bg-transparent text-primary text-lg font-bold rounded-full group" asChild>
                <Link href="/sell" className="flex items-center">
                  <Play className="mr-2 w-4 h-4 fill-primary" /> How it Works
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 md:gap-10 pt-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-green-100 rounded-xl shadow-sm">
                  <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg leading-none">Certified</p>
                  <p className="text-xs text-muted-foreground font-medium text-nowrap">Quality Check</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-blue-100 rounded-xl shadow-sm">
                  <BadgeCheck className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg leading-none">Transparent</p>
                  <p className="text-xs text-muted-foreground font-medium text-nowrap">Fair Pricing</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-orange-100 rounded-xl shadow-sm">
                  <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-lg leading-none">Instant</p>
                  <p className="text-xs text-muted-foreground font-medium text-nowrap">Exchange</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative group hidden lg:block max-w-lg mx-auto w-full px-4 lg:px-0">
            <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-2xl group-hover:bg-primary/30 transition-all duration-500" />
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-500 transform group-hover:scale-[1.01] aspect-[4/5] lg:min-h-[600px] border-4 border-white/50 bg-gray-50">
              <img 
                src={heroImage} 
                alt="Premium Showroom Bike" 
                className="w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                data-ai-hint="sports motorcycle"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 text-white space-y-2">
                <div className="bg-primary px-3 py-1 rounded-full text-xs font-bold inline-block">TRENDING NOW</div>
                <p className="text-3xl font-bold font-headline leading-tight">Featured <br /> Collection 2025</p>
              </div>
            </div>
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-10 -right-2 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 hidden sm:block">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-xl">
                  <span className="text-2xl font-bold text-primary">2000+</span>
                </div>
                <div>
                  <p className="font-bold text-sm">Happy Riders</p>
                  <p className="text-xs text-muted-foreground text-nowrap">Join our community</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
