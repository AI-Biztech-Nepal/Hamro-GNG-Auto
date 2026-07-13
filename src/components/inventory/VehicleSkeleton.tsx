
"use client"

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function VehicleSkeleton() {
  return (
    <Card className="overflow-hidden border-none bg-white rounded-2xl md:rounded-3xl shadow-sm">
      <div className="aspect-[4/3] w-full">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="p-3 md:p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-8 rounded-lg" />
          <Skeleton className="h-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}
