
"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Lock, Loader2, ShieldCheck, UserCog } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, collection, query, where, getDocs, setDoc } from 'firebase/firestore';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Secret key must be at least 6 characters"),
  role: z.enum(['admin', 'super_admin']),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const db = useFirestore();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      role: "admin",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    if (!db || !auth) return;
    setLoading(true);
    
    // Explicit bootstrap check for Super Admin role
    if (values.role === 'super_admin' && values.password !== 'ggauto2024') {
      setLoading(false);
      toast({ 
        variant: "destructive", 
        title: "Access Denied", 
        description: "Invalid Secret Key for Super Admin access." 
      });
      return;
    }
    
    try {
      // 1. Sign in anonymously to establish a session
      const userCredential = await signInAnonymously(auth);
      const user = userCredential.user;

      if (user) {
        // 2. Check if this email was pre-authorized by a Super Admin
        const rolesCol = collection(db, 'roles_admin');
        const q = query(rolesCol, where('email', '==', values.email.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        let finalRole = values.role;

        if (!querySnapshot.empty) {
          const invitation = querySnapshot.docs[0];
          const invitedRole = invitation.data().role;
          
          // Only overwrite if the selected role isn't already higher privilege (Super)
          if (finalRole !== 'super_admin') {
            finalRole = invitedRole;
          }
          
          toast({ 
            title: "Authorized Access", 
            description: `Welcome back. Access level: ${finalRole}.` 
          });
        }

        // 3. Link the session UID to the role (Blocking write to ensure rules sync)
        const adminDocRef = doc(db, 'roles_admin', user.uid);
        
        await setDoc(adminDocRef, {
          email: values.email.toLowerCase(),
          role: finalRole,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }, { merge: true });

        toast({ 
          title: "Dashboard Unlocked", 
          description: `Logged in as ${finalRole === 'super_admin' ? 'Super Admin' : 'Staff Admin'}.` 
        });
        
        router.push('/admin/dashboard');
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast({ 
        variant: "destructive", 
        title: "Access Denied", 
        description: "Credentials verification failed. Please check your keys." 
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-gray-50/50">
      <Card className="w-full max-w-md shadow-2xl border-2 rounded-[2rem] overflow-hidden">
        <CardHeader className="space-y-2 text-center pb-8 pt-10 bg-white">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-4xl font-headline font-black tracking-tight text-primary">STAFF PORTAL</CardTitle>
          <CardDescription className="text-base font-medium">Authorized Entry Only</CardDescription>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Access Level</FormLabel>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <Tabs 
                      defaultValue={field.value} 
                      onValueChange={(val) => field.onChange(val as 'admin' | 'super_admin')}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 h-12 rounded-xl bg-gray-100 p-1">
                        <TabsTrigger 
                          value="admin" 
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 font-bold"
                        >
                          <UserCog className="w-4 h-4" /> Admin
                        </TabsTrigger>
                        <TabsTrigger 
                          value="super_admin" 
                          className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2 font-bold"
                        >
                          <ShieldCheck className="w-4 h-4" /> Super
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter email" 
                        autoComplete="off"
                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Secret Key</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Min 6 characters" 
                        autoComplete="off"
                        className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-colors" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-14 bg-primary text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-[0.98]" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-3 w-6 h-6" />
                    Verifying...
                  </>
                ) : (
                  "Unlock Dashboard"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <div className="bg-gray-50 p-4 text-center border-t">
          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-[0.2em]">Authorized Personnel Only</p>
        </div>
      </Card>
    </div>
  );
}
