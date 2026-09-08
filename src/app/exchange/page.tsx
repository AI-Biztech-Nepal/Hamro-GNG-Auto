
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Camera, CheckCircle2, Loader2, Image as ImageIcon, Plus, X } from 'lucide-react';
import { submitLead } from '@/lib/inventory-api';
import { compressImage } from '@/lib/image-upload';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  old_bike: z.string().min(2, "Please enter your current bike model"),
  old_year: z.string().min(4, "Enter manufacturing year"),
  interested_in: z.string().min(2, "What bike are you looking for?"),
  images: z.array(z.string()).min(1, "Please upload at least one image for evaluation."),
});

export default function ExchangePage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      name: "", 
      phone: "", 
      old_bike: "", 
      old_year: "", 
      interested_in: "",
      images: []
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
        console.error("Error reading file", err);
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
        type: 'exchange',
        name: values.name,
        phone: values.phone,
        message: `Exchange Inquiry: ${values.old_bike} (${values.old_year}) for ${values.interested_in}. Photos provided: ${values.images.length}`,
        images: values.images,
      });
      setSubmitted(true);
      toast({
        title: "Exchange Request Sent",
        description: "We'll review your bike details and photos and call you with an offer.",
      });
    } catch (err) {
      console.error('Failed to submit exchange inquiry:', err);
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
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-14 h-14 text-green-600" />
        </div>
        <div className="space-y-4">
          <h1 className="font-headline font-bold text-5xl text-foreground tracking-tight">Request Received!</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Thank you. Our valuation expert will review your bike details and contact you shortly to discuss the best exchange price.
          </p>
        </div>
        <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-lg" asChild>
          <a href="/">Back to Home</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-14 space-y-12">
      <header className="max-w-2xl">
        <span aria-hidden className="block w-8 h-1 bg-brand mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold font-headline tracking-tight">Exchange your two-wheeler</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Trade what you ride now towards something better. Send your current bike&rsquo;s
          photos and details for a straight valuation.
        </p>
      </header>

      <ol className="grid sm:grid-cols-3 border-t border-border">
        {[
          { step: '1', title: 'Share details', desc: 'Your current bike, its year, and a few photos.' },
          { step: '2', title: 'Get a price', desc: 'We come back with an estimated exchange value.' },
          { step: '3', title: 'Ride away', desc: 'Finalise at the showroom and swap the keys.' },
        ].map((item) => (
          <li key={item.step} className="border-b border-border sm:border-b-0 sm:border-r last:border-r-0 py-6 sm:px-6 sm:first:pl-0">
            <span className="font-headline font-bold text-brand text-sm">{item.step}</span>
            <h3 className="mt-1 font-semibold text-lg">{item.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
          </li>
        ))}
      </ol>

      <div className="bg-white p-6 md:p-10 rounded-xl border border-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-2xl font-bold font-headline border-l-2 border-brand pl-3">Personal Info</h3>
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Name</FormLabel>
                    <FormControl><Input placeholder="John Doe" className="h-11 rounded-md" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Phone Number</FormLabel>
                    <FormControl><Input placeholder="98XXXXXXXX" className="h-11 rounded-md" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="space-y-6">
                <h3 className="text-2xl font-bold font-headline border-l-2 border-brand pl-3">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="old_bike" render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Current Bike</FormLabel>
                      <FormControl><Input placeholder="e.g. Pulsar 150" className="h-11 rounded-md" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="old_year" render={({ field }) => (
                    <FormItem className="col-span-2 sm:col-span-1">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Year</FormLabel>
                      <FormControl><Input placeholder="2018" className="h-11 rounded-md" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="interested_in" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Interested In</FormLabel>
                    <FormControl><Input placeholder="e.g. Yamaha MT-15 or Scooter" className="h-11 rounded-md" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Photo Upload Section */}
              <div className="col-span-full space-y-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold font-headline flex items-center gap-3">
                    <Camera className="w-6 h-6 text-brand" /> Vehicle Photos (Max 6)
                  </h3>
                  <div className="flex items-center gap-4">
                    {isCompressing && <div className="flex items-center gap-2 text-brand font-bold animate-pulse text-[10px]"><Loader2 className="w-3 h-3 animate-spin" /> Optimizing...</div>}
                    <span className="text-[10px] text-muted-foreground font-bold">{form.watch('images').length} / 6</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {form.watch('images').map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border group shadow-sm bg-gray-50">
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
                      <span className="text-[10px] font-bold uppercase">Upload</span>
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
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Provide clear photos. Large images are automatically optimized for fast upload.</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || isCompressing}
              className="w-full h-12 text-base font-semibold rounded-md"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Request an exchange valuation"}
            </Button>

            <p className="text-center text-[11px] text-muted-foreground mt-4 uppercase tracking-widest font-semibold">
              No obligation &middot; we&rsquo;ll call you back with an offer
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
}
