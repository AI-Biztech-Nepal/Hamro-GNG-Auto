
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bike, CheckCircle2, Camera, Upload, X, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import { submitLead } from '@/lib/inventory-api';
import { compressImage } from '@/lib/image-upload';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().min(10, { message: "Please enter a valid phone number." }),
  brand: z.string().min(1, { message: "Brand is required." }),
  model: z.string().min(1, { message: "Model is required." }),
  year: z.string().min(4, { message: "Year is required." }),
  km_run: z.string().min(1, { message: "Mileage is required." }),
  expected_price: z.string().min(1, { message: "Please specify your expected price." }),
  message: z.string().optional(),
  images: z.array(z.string()).min(1, "Please upload at least one image of your bike."),
});

export default function SellPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      brand: "",
      model: "",
      year: "",
      km_run: "",
      expected_price: "",
      message: "",
      images: [],
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsCompressing(true);
    const currentImages = form.getValues('images');
    const newImages = [...currentImages];

    for (let i = 0; i < files.length; i++) {
      if (newImages.length >= 6) break;
      try {
        const compressedBase64 = await compressImage(files[i]);
        newImages.push(compressedBase64);
      } catch (err) {
        console.error("Error compressing file", err);
      }
    }

    form.setValue('images', newImages, { shouldValidate: true });
    setIsCompressing(false);
  };

  const removeImage = (index: number) => {
    const currentImages = form.getValues('images');
    const filtered = currentImages.filter((_, i) => i !== index);
    form.setValue('images', filtered, { shouldValidate: true });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await submitLead({
        type: 'sell',
        name: values.name,
        phone: values.phone,
        message: `Sell Inquiry: ${values.brand} ${values.model} (${values.year}). KM: ${values.km_run}. Expected Price: NPR ${values.expected_price}. ${values.message || ''}`,
        images: values.images,
      });
      setSubmitted(true);
      toast({
        title: "Inquiry Submitted",
        description: "We've received your bike details and photos. Our team will contact you soon.",
      });
    } catch (err) {
      console.error('Failed to submit sell inquiry:', err);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="font-headline font-bold text-4xl">Inquiry Sent!</h1>
        <p className="text-xl text-muted-foreground">Thank you for sharing your bike details. One of our experts will review the information and call you shortly.</p>
        <Button size="lg" asChild className="rounded-full px-10">
          <a href="/">Return Home</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Content */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-6">
            <span aria-hidden className="block w-8 h-1 bg-brand" />
            <h1 className="font-headline font-bold text-4xl md:text-5xl leading-tight tracking-tight">Sell your bike, <br />skip the showroom trips.</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Upload a few photos and the details. We&rsquo;ll come back with a straight
              price once we&rsquo;ve seen them &mdash; usually the same day.
            </p>
          </div>

          <div className="border-t border-border">
            {['Fair valuation from photos', 'Free inspection at your door', 'Immediate payment on the deal'].map(item => (
              <div key={item} className="flex items-center gap-3 border-b border-border py-3.5">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-brand" strokeWidth={2} />
                <p className="font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-8 md:p-12 rounded-xl border border-border">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold font-headline border-l-2 border-brand pl-3">Vehicle Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                          <FormControl><Input placeholder="Your Name" className="h-11 rounded-md" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</FormLabel>
                          <FormControl><Input placeholder="98XXXXXXXX" className="h-11 rounded-md" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Brand</FormLabel>
                          <FormControl><Input placeholder="e.g. Honda" className="h-11 rounded-md" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="model"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Model</FormLabel>
                          <FormControl><Input placeholder="e.g. Dio BS6" className="h-11 rounded-md" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Model Year</FormLabel>
                          <FormControl><Input placeholder="2022" className="h-11 rounded-md" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="km_run"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total KM Run</FormLabel>
                          <FormControl><Input placeholder="12000" className="h-11 rounded-md" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="expected_price"
                      render={({ field }) => (
                        <FormItem className="col-span-full">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Expected Price (NPR)</FormLabel>
                          <FormControl><Input placeholder="e.g. 185000" className="h-11 rounded-md" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Image Upload Section */}
                    <div className="col-span-full space-y-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-brand" /> Vehicle Photos (Max 6)
                        </FormLabel>
                        <div className="flex items-center gap-4">
                          {isCompressing && <div className="flex items-center gap-2 text-brand font-bold animate-pulse text-[10px]"><Loader2 className="w-3 h-3 animate-spin" /> Optimizing...</div>}
                          <span className="text-[10px] text-muted-foreground font-bold">{form.watch('images').length} / 6</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 gap-3">
                        {form.watch('images').map((img, idx) => (
                          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border group shadow-sm">
                            <img src={img} className="w-full h-full object-cover" alt={`Bike preview ${idx}`} />
                            <button 
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {form.watch('images').length < 6 && (
                          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-foreground/40 hover:bg-brand/10 transition-all text-muted-foreground hover:text-brand group">
                            <Plus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-bold uppercase">Add Photo</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*" 
                              multiple 
                              onChange={handleImageUpload} 
                              disabled={isCompressing}
                            />
                          </label>
                        )}
                      </div>
                      <FormMessage>{form.formState.errors.images?.message}</FormMessage>
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="col-span-full">
                          <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Additional Info</FormLabel>
                          <FormControl><Textarea placeholder="Maintenance history, documents status..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" disabled={loading || isCompressing} className="w-full h-12 text-base font-semibold rounded-md">
                    {loading ? <Loader2 className="animate-spin" /> : "Request a price"}
                  </Button>
                  <p className="text-center text-[11px] text-muted-foreground mt-4 uppercase tracking-widest font-semibold">
                    No obligation &middot; we&rsquo;ll call you back
                  </p>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
