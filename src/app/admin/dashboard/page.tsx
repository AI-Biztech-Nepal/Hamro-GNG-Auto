
"use client"

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, CheckCircle, ExternalLink, MessageSquare, Loader2, LayoutDashboard, Bike, Star } from 'lucide-react';
import Link from 'next/link';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Vehicle } from '@/types/vehicle';

export default function AdminDashboard() {
  const db = useFirestore();
  
  const vehiclesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'vehicles');
  }, [db]);

  const { data: vehicles, isLoading } = useCollection<Vehicle>(vehiclesQuery);

  const toggleStatus = (id: string, currentStatus: string) => {
    if (!db) return;
    const docRef = doc(db, 'vehicles', id);
    const newStatus = currentStatus === 'available' ? 'sold' : 'available';
    updateDocumentNonBlocking(docRef, { status: newStatus });
  };

  const toggleFeatured = (id: string, currentFeatured: boolean) => {
    if (!db) return;
    const docRef = doc(db, 'vehicles', id);
    updateDocumentNonBlocking(docRef, { featured: !currentFeatured });
  };

  const deleteVehicle = (id: string) => {
    if (!db || !confirm('Are you sure you want to delete this vehicle?')) return;
    const docRef = doc(db, 'vehicles', id);
    deleteDocumentNonBlocking(docRef);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
            <LayoutDashboard className="w-4 h-4" /> ADMIN CONTROL PANEL
          </div>
          <h1 className="text-4xl font-bold font-headline">Vehicle Inventory</h1>
          <p className="text-muted-foreground">Manage your showroom's live collection</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-full px-6" asChild>
            <Link href="/admin/inquiries"><MessageSquare className="w-4 h-4 mr-2" /> View Leads</Link>
          </Button>
          <Button className="bg-primary rounded-full px-6 shadow-lg shadow-primary/20" asChild>
            <Link href="/admin/vehicles/new"><Plus className="w-4 h-4 mr-2" /> Add New Vehicle</Link>
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-xl font-medium text-muted-foreground">Syncing inventory...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="py-5">Vehicle</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead>Price (NPR)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles?.map((v) => (
                <TableRow key={v.id} className="hover:bg-gray-50/30 transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-xl overflow-hidden border bg-gray-100 shrink-0">
                        <img 
                          src={v.image_urls?.[0] || 'https://picsum.photos/seed/placeholder/100/100'} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <span className="font-bold text-lg">{v.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{v.brand} {v.model}</div>
                      <div className="font-medium text-xs">{v.year} • {v.km_run.toLocaleString()} KM</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-black text-primary">{v.price.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      onClick={() => toggleStatus(v.id, v.status)}
                      className={`rounded-full px-3 py-0.5 cursor-pointer text-[10px] ${
                      v.status === 'available' 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                    }`}>
                      {v.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className={`rounded-full ${v.featured ? 'text-yellow-500' : 'text-gray-300'}`}
                      onClick={() => toggleFeatured(v.id, !!v.featured)}
                    >
                      <Star className={`w-5 h-5 ${v.featured ? 'fill-yellow-500' : ''}`} />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right px-8 space-x-1">
                    <Button size="icon" variant="ghost" className="rounded-full" asChild title="View on Site">
                      <Link href={`/inventory/${v.id}`} target="_blank"><ExternalLink className="w-4 h-4" /></Link>
                    </Button>
                    <Button size="icon" variant="ghost" className="rounded-full text-blue-600 hover:bg-blue-50" asChild title="Edit Vehicle">
                      <Link href={`/admin/vehicles/edit/${v.id}`}><Pencil className="w-4 h-4" /></Link>
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 rounded-full" onClick={() => deleteVehicle(v.id)} title="Delete Vehicle">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {vehicles?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
                      <Bike className="w-12 h-12 opacity-20" />
                      <p className="text-lg">No vehicles in inventory.</p>
                      <Button className="bg-primary rounded-full px-8" asChild>
                        <Link href="/admin/vehicles/new">Add Your First Vehicle</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
