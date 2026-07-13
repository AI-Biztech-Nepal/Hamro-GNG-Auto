
"use client"

import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, User, Calendar, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Inquiry } from '@/types/vehicle';

export default function InquiriesPage() {
  const db = useFirestore();
  
  const inquiriesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'inquiries');
  }, [db]);

  const { data: inquiries, isLoading } = useCollection<Inquiry>(inquiriesQuery);

  const updateStatus = (id: string, newStatus: string) => {
    if (!db) return;
    const docRef = doc(db, 'inquiries', id);
    updateDocumentNonBlocking(docRef, { status: newStatus });
  };

  const deleteInquiry = (id: string) => {
    if (!db || !confirm('Delete this inquiry?')) return;
    const docRef = doc(db, 'inquiries', id);
    deleteDocumentNonBlocking(docRef);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Customer Leads</h1>
        <p className="text-muted-foreground">Manage inquiries from potential buyers and sellers</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading inquiries...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message / Detail</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries?.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm"><User className="w-3 h-3" /> {lead.name}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="w-3 h-3" /> {lead.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 uppercase text-[10px]">{lead.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <p className="text-xs truncate">{lead.message}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> {new Date(lead.created_at).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={lead.status === 'new' ? 'bg-blue-100 text-blue-700' : lead.status === 'viewed' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                      {lead.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="icon" variant="ghost" title="Mark as Replied" onClick={() => updateStatus(lead.id, 'replied')}>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => deleteInquiry(lead.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {inquiries?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                    No inquiries yet.
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
