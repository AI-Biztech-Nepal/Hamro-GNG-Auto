
"use client"

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserCog, Loader2, Users, AlertTriangle, UserPlus, Trash2, Pencil } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RolesPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  // Add Staff State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'super_admin'>('admin');
  
  // Edit Email State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [editEmail, setEditEmail] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const rolesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'roles_admin');
  }, [db]);

  const { data: roles, isLoading } = useCollection(rolesQuery);

  const changeRole = (userId: string, newRole: string) => {
    if (!db) return;
    if (userId === user?.uid) {
      toast({ variant: "destructive", title: "Action Denied", description: "You cannot change your own role to avoid self-lockout." });
      return;
    }
    const docRef = doc(db, 'roles_admin', userId);
    updateDocumentNonBlocking(docRef, { role: newRole });
    toast({ title: "Role Updated", description: "The staff role has been updated successfully." });
  };

  const deleteStaff = (userId: string) => {
    if (!db || !confirm('Are you sure you want to remove this staff member?')) return;
    if (userId === user?.uid) {
      toast({ variant: "destructive", title: "Action Denied", description: "You cannot remove yourself." });
      return;
    }
    const docRef = doc(db, 'roles_admin', userId);
    deleteDocumentNonBlocking(docRef);
    toast({ title: "Staff Removed", description: "The access record has been deleted." });
  };

  const handleAddStaff = () => {
    if (!db || !newEmail) return;
    setIsSubmitting(true);
    
    const newStaffRef = doc(collection(db, 'roles_admin'));
    
    setDocumentNonBlocking(newStaffRef, {
      email: newEmail.toLowerCase(),
      role: newRole,
      createdAt: new Date().toISOString(),
      status: 'invited' 
    }, { merge: true });

    toast({ title: "Staff Authorized", description: `${newEmail} has been pre-authorized.` });
    setNewEmail('');
    setIsAddOpen(false);
    setIsSubmitting(false);
  };

  const openEditEmail = (staff: any) => {
    setEditingStaff(staff);
    setEditEmail(staff.email);
    setIsEditOpen(true);
  };

  const handleUpdateEmail = () => {
    if (!db || !editingStaff || !editEmail) return;
    setIsSubmitting(true);
    
    const docRef = doc(db, 'roles_admin', editingStaff.id);
    updateDocumentNonBlocking(docRef, { email: editEmail.toLowerCase() });
    
    toast({ title: "Email Updated", description: "The staff email has been updated successfully." });
    setIsEditOpen(false);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" /> Staff Management
          </h1>
          <p className="text-muted-foreground">Manage administrative emails and access levels</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2 px-6">
              <UserPlus className="w-4 h-4" /> Add New Individual
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
            <DialogHeader>
              <DialogTitle>Authorize New Individual</DialogTitle>
              <DialogDescription>
                Grant pre-approved access to the dashboard using their Gmail/Email.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest ml-1">Gmail / Email</Label>
                <Input 
                  id="email" 
                  placeholder="e.g. user@gmail.com" 
                  autoComplete="off"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest ml-1">Access Level</Label>
                <Select value={newRole} onValueChange={(val: any) => setNewRole(val)}>
                  <SelectTrigger className="rounded-xl h-12">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin (Standard)</SelectItem>
                    <SelectItem value="super_admin">Super Admin (Full Access)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleAddStaff} 
                disabled={isSubmitting || !newEmail}
                className="w-full h-12 rounded-xl font-bold"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Authorize Individual"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Email Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Edit Individual Email</DialogTitle>
            <DialogDescription>
              Update the login email for this staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-xs font-bold uppercase tracking-widest ml-1">New Gmail / Email</Label>
              <Input 
                id="edit-email" 
                placeholder="Enter new email" 
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="rounded-xl h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleUpdateEmail} 
              disabled={isSubmitting || !editEmail}
              className="w-full h-12 rounded-xl font-bold"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="bg-white rounded-[2rem] shadow-xl border overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Syncing staff list...</p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-gray-50/50">
              <TableRow>
                <TableHead className="py-5">Individual</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Current Role</TableHead>
                <TableHead className="text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles?.map((r: any) => (
                <TableRow key={r.id} className="hover:bg-gray-50/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        {r.role === 'super_admin' ? <ShieldCheck className="w-5 h-5 text-primary" /> : <UserCog className="w-5 h-5 text-muted-foreground" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold">{r.id === user?.uid ? "Your Account" : "Staff User"}</span>
                        {r.status === 'invited' && <span className="text-[10px] text-orange-600 font-bold uppercase">Awaiting Login</span>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{r.email}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => openEditEmail(r)}>
                        <Pencil className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={r.role === 'super_admin' ? 'bg-primary text-white px-3 py-1' : 'bg-gray-100 text-gray-700 px-3 py-1'}>
                      {r.role.toUpperCase().replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex items-center justify-end gap-2">
                      <Select defaultValue={r.role} onValueChange={(val) => changeRole(r.id, val)} disabled={r.id === user?.uid}>
                        <SelectTrigger className="w-32 h-10 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive hover:bg-destructive/10 rounded-full"
                        onClick={() => deleteStaff(r.id)}
                        disabled={r.id === user?.uid}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {roles?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                    No individuals found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
        <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0" />
        <div className="text-sm text-yellow-800">
          <p className="font-bold mb-1 uppercase tracking-tight">Security Note</p>
          <p>Changing an individual's email will require them to log in using the new address. You can manage roles and contact credentials here.</p>
        </div>
      </div>
    </div>
  );
}
