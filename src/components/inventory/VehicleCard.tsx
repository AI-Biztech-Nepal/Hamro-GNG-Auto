
"use client"

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Gauge, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
  isPriority?: boolean;
}

export function VehicleCard({ vehicle, isPriority = false }: VehicleCardProps) {
  const isSold = vehicle.status === 'sold';
  
  return (
    <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-500 border-none bg-white rounded-2xl md:rounded-3xl shadow-sm">
      <Link href={`/inventory/${vehicle.id}`} className="block relative">
        <div className="aspect-[4/3] overflow-hidden relative">
          <Image 
            src={vehicle.image_urls[0]} 
            alt={vehicle.title} 
            fill
            priority={isPriority}
            loading={isPriority ? "eager" : "lazy"}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {isSold && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <Badge variant="destructive" className="text-sm md:text-xl px-4 md:px-8 py-1 md:py-2 rounded-full font-bold">SOLD</Badge>
          </div>
        )}
        
        {!isSold && (
          <div className="absolute top-2 md:top-4 left-2 md:left-4">
            <Badge className="bg-white/90 backdrop-blur-md text-primary hover:bg-white border-none shadow-sm font-bold rounded-full px-2 md:px-4 text-[10px] md:text-xs">
              {vehicle.condition}
            </Badge>
          </div>
        )}

        <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hidden md:block">
          <div className="bg-primary text-white p-3 rounded-full shadow-xl">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </Link>

      <CardContent className="p-3 md:p-6 space-y-2 md:space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-headline font-bold text-sm md:text-xl line-clamp-1 hover:text-primary transition-colors cursor-pointer">
              {vehicle.title}
            </h3>
          </div>
          <p className="text-base md:text-2xl font-bold text-primary">NPR {vehicle.price.toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm text-muted-foreground bg-gray-50 p-1.5 md:p-2 rounded-lg md:rounded-xl">
            <Calendar className="w-3 h-3 md:w-4 md:h-4 text-primary/60" />
            <span className="font-medium text-foreground">{vehicle.year}</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm text-muted-foreground bg-gray-50 p-1.5 md:p-2 rounded-lg md:rounded-xl">
            <Gauge className="w-3 h-3 md:w-4 md:h-4 text-primary/60" />
            <span className="font-medium text-foreground">{vehicle.km_run.toLocaleString()} KM</span>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2 text-[8px] md:text-xs text-green-600 font-bold bg-green-50/50 p-1.5 md:p-2 rounded-md md:rounded-lg border border-green-100/50">
          <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4" />
          <span>INSPECTED</span>
        </div>
      </CardContent>
    </Card>
  );
}
