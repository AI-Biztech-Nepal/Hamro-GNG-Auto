"use client"

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Save, ChevronLeft, Loader2, Image as ImageIcon, Plus, X, Camera } from 'lucide-react';
import { generateVehicleDescription } from '@/ai/flows/generate-vehicle-description';
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Vehicle } from '@/types/vehicle';
import { compressImage } from '@/lib/image-upload';

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  type: z.enum(['bike', 'scooter']),
  year: z.coerce.number().min(1990, "Year must be 1990 or later"),
  kmRun: z.coerce.number().min(0, "KM run cannot be negative"),
  price: z.coerce.number().min(1, "Price must be at least 1"),
  condition: z.string().min(1, "Condition is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrls: z.array(z.string()).min(1, "Please upload at least one image of the vehicle."),
});

export default function EditVehiclePage() {
  const router = useRouter();
  const { id } = useParams();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const db = useFirestore();

  const vehicleRef = useMemoFirebase(() => {
    if (!db || !id) return null;
    return doc(db, 'vehicles', id as string);
  }, [db, id]);

  const { data: vehicle, isLoading } = useDoc<Vehicle>(vehicleRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "", 
      brand: "", 
      model: "", 
      type: "bike", 
      year: 2022, 
      kmRun: 0, 
      price: 0, 
      condition: "Excellent", 
      description: "", 
      imageUrls: []
    },
  });

  useEffect(() => {
    if (vehicle) {
      form.reset({
        title: vehicle.title,
        brand: vehicle.brand,
        model: vehicle.model,
        type: vehicle.type,
        year: vehicle.year,
        kmRun: vehicle.km_run,
        price: vehicle.price,
        condition: vehicle.condition,
        description: vehicle.description,
        imageUrls: vehicle.image_urls || []
      });
    }
  }, [vehicle, form]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsCompressing(true);
    const currentImages = form.getValues('imageUrls');
    const newImages = [...currentImages];

    for (let i = 0; i < files.length; i++) {
      if (newImages.length >= 12) {
        toast({
          variant: "destructive",
          title: "Limit Reached",
          description: "Maximum 12 images allowed."
        });
        break;
      }
      
      const file = files[i];
      try {
        const compressedBase64 = await compressImage(file);
        newImages.push(compressedBase64);
      } catch (err) {
        console.error("Error processing file", err);
        toast({
          variant: "destructive",
          title: "Compression Failed",
          description: `Failed to process image: ${file.name}`
        });
      }
    }

    form.setValue('imageUrls', newImages, { shouldValidate: true });
    setIsCompressing(false);
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues('imageUrls');
    const filtered = currentImages.filter((_, i) => i !== index);
    form.setValue('imageUrls', filtered, { shouldValidate: true });
  };

  async function handleGenerateAI() {
    const values = form.getValues();
    if (!values.brand || !values.model) {
      toast({ 
        variant: "destructive", 
        title: "Missing Info", 
        description: "Brand and model are required for AI generation." 
      });
      return;
    }

    setGenerating(true);
    try {
      const result = await generateVehicleDescription({
        brand: values.brand,
        model: values.model,
        type: values.type,
        year: values.year,
        kmRun: values.kmRun,
        condition: values.condition,
        price: values.price
      });
      
      if (result && result.description) {
        form.setValue('description', result.description);
        toast({ title: "Success", description: "AI description generated!" });
      } else {
        throw new Error("Invalid AI response");
      }
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "AI Generation Failed", 
        description: "Could not generate description at this time." 
      });
    } finally {
      setGenerating(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db || !id) return;
    setIsSaving(true);
    
    const vehicleDocRef = doc(db, 'vehicles', id as string);
    const vehicleData = {
      title: values.title,
      brand: values.brand,
      model: values.model,
      type: values.type,
      year: values.year,
      km_run: values.kmRun,
      price: values.price,
      condition: values.condition,
      description: values.description,
      image_urls: values.imageUrls,
    };

    updateDocumentNonBlocking(vehicleDocRef, vehicleData);
    
    toast({ title: "Vehicle Updated", description: "Changes have been saved successfully." });
    router.push('/admin/dashboard');
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-40 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-xl font-medium text-muted-foreground">Loading vehicle details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <h1 className="text-3xl font-bold font-headline">Edit Vehicle</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border space-y-8">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-xl">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold font-headline">Vehicle Photos</h3>
                </div>
                <div className="flex items-center gap-4">
                  {isCompressing && <div className="flex items-center gap-2 text-primary font-bold animate-pulse text-xs"><Loader2 className="w-3 h-3 animate-spin" /> Optimizing...</div>}
                  <span className="text-xs font-bold text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
                    {form.watch('imageUrls').length} / 12 Images
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {form.watch('imageUrls').map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 group shadow-sm bg-gray-50">
                    <img src={img} className="w-full h-full object-cover" alt={`Vehicle preview ${idx}`} />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {idx === 0 && (
                      <div className="absolute bottom-0 inset-x-0 bg-primary/90 text-[10px] text-white font-bold text-center py-1 uppercase tracking-wider">
                        Main
                      </div>
                    )}
                  </div>
                ))}
                
                {form.watch('imageUrls').length < 12 && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all text-muted-foreground hover:text-primary group">
                    <Plus className="w-8 h-8 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold uppercase">Add Photo</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/jpeg,image/png" 
                      multiple 
                      onChange={handleImageUpload} 
                      disabled={isCompressing}
                    />
                  </label>
                )}
              </div>
              <FormMessage>{form.formState.errors.imageUrls?.message}</FormMessage>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest bg-gray-50 p-3 rounded-xl border">
                Upload up to 12 photos. Images are automatically optimized to ensure reliable saving within database limits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Listing Title</FormLabel>
                    <FormControl><Input placeholder="e.g. Pristine Honda Dio BS6 2022" className="h-12 rounded-xl bg-gray-50 focus:bg-white transition-colors" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Brand</FormLabel>
                    <FormControl><Input placeholder="Yamaha" className="h-12 rounded-xl bg-gray-50 focus:bg-white transition-colors" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Model</FormLabel>
                    <FormControl><Input placeholder="MT-15" className="h-12 rounded-xl bg-gray-50 focus:bg-white transition-colors" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-gray-50 focus:bg-white transition-colors"><SelectValue placeholder="Select type" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bike">Bike</SelectItem>
                        <SelectItem value="scooter">Scooter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Condition</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 rounded-xl bg-gray-50 focus:bg-white transition-colors"><SelectValue placeholder="Select condition" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                        <SelectItem value="Like New">Like New</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Year</FormLabel>
                    <FormControl><Input type="number" className="h-12 rounded-xl bg-gray-50 focus:bg-white transition-colors" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="kmRun"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">KM Run</FormLabel>
                    <FormControl><Input type="number" className="h-12 rounded-xl bg-gray-50 focus:bg-white transition-colors" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Price (NPR)</FormLabel>
                    <FormControl><Input type="number" className="h-12 rounded-xl bg-gray-50 focus:bg-white transition-colors font-bold text-primary" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-full space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Vehicle Description</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 text-primary border-primary hover:bg-primary/5 rounded-full px-4 font-bold"
                    onClick={handleGenerateAI}
                    disabled={generating}
                  >
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generating ? "AI Working..." : "Regenerate AI Description"}
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl><Textarea className="min-h-[200px] rounded-[1.5rem] bg-gray-50 focus:bg-white transition-colors" placeholder="Tell us more about this vehicle..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="pt-8 border-t">
              <Button type="submit" disabled={isSaving || isCompressing} className="w-full h-16 bg-primary text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-3">
                {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {isSaving ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
