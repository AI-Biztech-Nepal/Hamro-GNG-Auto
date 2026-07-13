
"use client"

import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking, useUser } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, Loader2, Image as ImageIcon, Store, Mail, Phone, MapPin, Upload, X, ShieldAlert, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

const settingsSchema = z.object({
  logo_url: z.string().min(1, "Logo is required"),
  business_name: z.string().min(3, "Business name must be at least 3 characters"),
  contact_phone: z.string().min(10, "Phone number must be at least 10 digits"),
  contact_email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  hero_image_url: z.string().min(1, "Hero image is required"),
  service_image_url: z.string().min(1, "Service image is required"),
});

export default function SettingsPage() {
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("showroom");
  const [updatingField, setUpdatingField] = useState<string | null>(null);
  
  const settingsRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'settings', 'general');
  }, [db]);

  const roleRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'roles_admin', user.uid);
  }, [db, user?.uid]);

  const { data: settings, isLoading } = useDoc(settingsRef);
  const { data: roleData } = useDoc(roleRef);
  const isSuperAdmin = roleData?.role === 'super_admin';

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      logo_url: "",
      business_name: "",
      contact_phone: "",
      contact_email: "",
      address: "",
      hero_image_url: "",
      service_image_url: "",
    },
  });

  useEffect(() => {
    if (settings) {
      const maintenancePlaceholder = PlaceHolderImages.find(img => img.id === 'maintenance')?.imageUrl || "";
      const heroPlaceholder = PlaceHolderImages.find(img => img.id === 'hero-bike')?.imageUrl || "";
      const logoPlaceholder = PlaceHolderImages.find(img => img.id === 'logo')?.imageUrl || "";

      form.reset({
        logo_url: settings.logo_url || logoPlaceholder,
        business_name: settings.business_name || "Hamro G&G Auto Enterprises",
        contact_phone: settings.contact_phone || "9860087161",
        contact_email: settings.contact_email || "info@ggautonp.com",
        address: settings.address || "Nayabasti, Boudha",
        hero_image_url: settings.hero_image_url || heroPlaceholder,
        service_image_url: settings.service_image_url || maintenancePlaceholder,
      });
    }
  }, [settings, form]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleUpdateSingleField = async (fieldName: keyof z.infer<typeof settingsSchema>) => {
    if (!db || !isSuperAdmin) return;
    
    const value = form.getValues(fieldName);
    if (!value) {
      toast({ variant: "destructive", title: "Error", description: "Value cannot be empty." });
      return;
    }

    setUpdatingField(fieldName);
    try {
      const docRef = doc(db, 'settings', 'general');
      setDocumentNonBlocking(docRef, { [fieldName]: value }, { merge: true });
      toast({ title: "Updated", description: `${fieldName.replace('_url', '').replace('_', ' ')} has been saved.` });
    } catch (err) {
      toast({ variant: "destructive", title: "Save Failed", description: "Could not update the field." });
    } finally {
      setTimeout(() => setUpdatingField(null), 1000);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof z.infer<typeof settingsSchema>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 250 * 1024) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please upload an image smaller than 250KB for site stability."
      });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      form.setValue(fieldName, base64, { shouldValidate: true });
      toast({ title: "Image Loaded", description: "Press 'Save' button next to the field to apply changes." });
    } catch (err) {
      toast({ variant: "destructive", title: "Upload Failed", description: "Could not process image." });
    }
  };

  function onSubmit(values: z.infer<typeof settingsSchema>) {
    if (!db) return;
    if (!isSuperAdmin) {
      toast({ variant: "destructive", title: "Access Denied", description: "Only Super Admins can modify global settings." });
      return;
    }
    
    setIsSaving(true);
    
    const docRef = doc(db, 'settings', 'general');
    setDocumentNonBlocking(docRef, values, { merge: true });
    
    setTimeout(() => {
      setIsSaving(false);
      toast({ 
        title: "Settings Saved", 
        description: "All configurations have been updated." 
      });
    }, 800);
  }

  if (!isSuperAdmin && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-red-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm">
          <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-headline">Access Restricted</h1>
          <p className="text-muted-foreground">You must have Super Admin privileges to manage site settings.</p>
        </div>
        <Button variant="outline" asChild className="rounded-full px-8">
          <Link href="/admin/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" /> Site Settings
          </h1>
          <p className="text-muted-foreground">Modify individual assets or the entire showroom configuration</p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl border overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Fetching settings...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="bg-gray-50 border-b px-8 py-4 flex flex-wrap gap-4 items-center justify-between">
                  <TabsList className="bg-transparent gap-8">
                    <TabsTrigger value="showroom" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-bold">Showroom</TabsTrigger>
                    <TabsTrigger value="branding" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-bold">Visual Branding</TabsTrigger>
                    <TabsTrigger value="contact" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent font-bold">Contact</TabsTrigger>
                  </TabsList>
                  
                  {activeTab !== 'branding' && (
                    <Button type="submit" disabled={isSaving} size="sm" className="rounded-full gap-2 font-bold px-6">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isSaving ? "Saving..." : "Save Tab Info"}
                    </Button>
                  )}
                </div>

                <div className="p-8 md:p-12 space-y-10">
                  <TabsContent value="showroom" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b pb-4">
                        <Store className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-xl">General Information</h3>
                      </div>
                      <FormField
                        control={form.control}
                        name="business_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest">Showroom Display Name</FormLabel>
                            <FormControl><Input className="h-12 rounded-xl bg-gray-50 focus:bg-white" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest">Physical Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input className="h-12 rounded-xl bg-gray-50 focus:bg-white pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="branding" className="mt-0 space-y-12 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="space-y-10">
                      <div className="flex items-center gap-2 border-b pb-4">
                        <ImageIcon className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-xl">Visual Assets Management</h3>
                      </div>
                      
                      {/* Logo Section */}
                      <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-dashed space-y-6">
                        <FormField
                          control={form.control}
                          name="logo_url"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center mb-2">
                                <FormLabel className="text-xs font-bold uppercase tracking-widest">Showroom Logo</FormLabel>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="secondary"
                                  className="rounded-full font-bold h-8 px-4"
                                  disabled={updatingField === 'logo_url'}
                                  onClick={() => handleUpdateSingleField('logo_url')}
                                >
                                  {updatingField === 'logo_url' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                  {updatingField === 'logo_url' ? "Saving..." : "Save Logo Only"}
                                </Button>
                              </div>
                              <FormControl>
                                <div className="space-y-4">
                                  <div className="flex gap-4 items-center">
                                    <div className="flex-1">
                                      <Input 
                                        placeholder="Paste URL or upload file" 
                                        className="h-12 rounded-xl bg-white text-xs border-dashed" 
                                        value={field.value?.startsWith('data:') ? "File Uploaded (Base64)" : field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                      />
                                    </div>
                                    <label className="h-12 px-6 rounded-xl bg-white border-2 border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors gap-2 text-sm font-bold shadow-sm shrink-0">
                                      <Upload className="w-4 h-4" /> Upload
                                      <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={(e) => handleFileUpload(e, 'logo_url')} />
                                    </label>
                                  </div>
                                  {field.value && (
                                    <div className="relative w-24 h-24 border-4 border-white rounded-full overflow-hidden bg-white shadow-md flex items-center justify-center group">
                                      <img src={field.value} alt="Logo preview" className="w-full h-full object-cover" />
                                      <button type="button" onClick={() => field.onChange("")} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Hero Section */}
                      <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-dashed space-y-6">
                        <FormField
                          control={form.control}
                          name="hero_image_url"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center mb-2">
                                <FormLabel className="text-xs font-bold uppercase tracking-widest">Homepage Hero Banner</FormLabel>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="secondary"
                                  className="rounded-full font-bold h-8 px-4"
                                  disabled={updatingField === 'hero_image_url'}
                                  onClick={() => handleUpdateSingleField('hero_image_url')}
                                >
                                  {updatingField === 'hero_image_url' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                  {updatingField === 'hero_image_url' ? "Saving..." : "Save Hero Only"}
                                </Button>
                              </div>
                              <FormControl>
                                <div className="space-y-4">
                                  <div className="flex gap-4 items-center">
                                    <div className="flex-1">
                                      <Input 
                                        placeholder="Paste URL or upload file" 
                                        className="h-12 rounded-xl bg-white text-xs border-dashed" 
                                        value={field.value?.startsWith('data:') ? "File Uploaded (Base64)" : field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                      />
                                    </div>
                                    <label className="h-12 px-6 rounded-xl bg-white border-2 border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors gap-2 text-sm font-bold shadow-sm shrink-0">
                                      <Upload className="w-4 h-4" /> Upload
                                      <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={(e) => handleFileUpload(e, 'hero_image_url')} />
                                    </label>
                                  </div>
                                  {field.value && (
                                    <div className="relative w-full aspect-[21/9] border-4 border-white rounded-2xl overflow-hidden bg-white shadow-md group">
                                      <img src={field.value} alt="Hero preview" className="w-full h-full object-cover" />
                                      <button type="button" onClick={() => field.onChange("")} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Maintenance Section */}
                      <div className="bg-gray-50/50 p-6 rounded-[2rem] border border-dashed space-y-6">
                        <FormField
                          control={form.control}
                          name="service_image_url"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex justify-between items-center mb-2">
                                <FormLabel className="text-xs font-bold uppercase tracking-widest">Workshop Asset</FormLabel>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="secondary"
                                  className="rounded-full font-bold h-8 px-4"
                                  disabled={updatingField === 'service_image_url'}
                                  onClick={() => handleUpdateSingleField('service_image_url')}
                                >
                                  {updatingField === 'service_image_url' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3 mr-1" />}
                                  {updatingField === 'service_image_url' ? "Saving..." : "Save Image Only"}
                                </Button>
                              </div>
                              <FormControl>
                                <div className="space-y-4">
                                  <div className="flex gap-4 items-center">
                                    <div className="flex-1">
                                      <Input 
                                        placeholder="Paste URL or upload file" 
                                        className="h-12 rounded-xl bg-white text-xs border-dashed" 
                                        value={field.value?.startsWith('data:') ? "File Uploaded (Base64)" : field.value}
                                        onChange={(e) => field.onChange(e.target.value)}
                                      />
                                    </div>
                                    <label className="h-12 px-6 rounded-xl bg-white border-2 border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/5 transition-colors gap-2 text-sm font-bold shadow-sm shrink-0">
                                      <Upload className="w-4 h-4" /> Upload
                                      <input type="file" className="hidden" accept="image/jpeg,image/png" onChange={(e) => handleFileUpload(e, 'service_image_url')} />
                                    </label>
                                  </div>
                                  {field.value && (
                                    <div className="relative w-full aspect-video border-4 border-white rounded-2xl overflow-hidden bg-white shadow-md group max-w-sm">
                                      <img src={field.value} alt="Service preview" className="w-full h-full object-cover" />
                                      <button type="button" onClick={() => field.onChange("")} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact" className="mt-0 space-y-8 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 border-b pb-4">
                        <Mail className="w-5 h-5 text-primary" />
                        <h3 className="font-bold text-xl">Contact Information</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="contact_email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest">Business Email</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <Input className="h-12 rounded-xl bg-gray-50 focus:bg-white pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="contact_phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-bold uppercase tracking-widest">Contact Phone</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <Input className="h-12 rounded-xl bg-gray-50 focus:bg-white pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <div className="pt-8 border-t flex flex-col md:flex-row gap-4">
                    <Button 
                      type="submit" 
                      disabled={isSaving} 
                      className="flex-1 h-14 bg-primary text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform flex gap-3"
                    >
                      {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-5 h-5" />}
                      {isSaving ? "Saving Everything..." : "Save All Settings"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => form.reset()}
                      className="h-14 px-8 rounded-2xl font-bold"
                    >
                      Reset Changes
                    </Button>
                  </div>
                </div>
              </Tabs>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
