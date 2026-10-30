
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { submitLead } from '@/lib/inventory-api';
import { VehiclePhotoUploader, REQUIRED_PHOTO_SLOTS } from '@/components/VehiclePhotoUploader';

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\+?\d{10,13}$/, "Enter a valid phone number, digits only"),
  email: z.string().email("Enter a valid email address"),
  old_bike: z.string().min(2, "Please enter your current bike model"),
  old_year: z.string().regex(/^(19|20)\d{2}$/, "Enter a 4-digit year, e.g. 2019"),
  interested_in: z.string().min(2, "What bike are you looking for?"),
  images: z.array(z.string()).length(REQUIRED_PHOTO_SLOTS.length).refine(a => a.every(Boolean), "Please upload all 4 photos."),
});

export default function ExchangePage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      old_bike: "",
      old_year: "",
      interested_in: "",
      images: REQUIRED_PHOTO_SLOTS.map(() => '')
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await submitLead({
        type: 'exchange',
        name: values.name,
        phone: values.phone,
        email: values.email,
        message: `Exchange Inquiry: ${values.old_bike} (${values.old_year}) for ${values.interested_in}. Photos in order: ${REQUIRED_PHOTO_SLOTS.join(', ')}.`,
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
                    <FormControl><Input placeholder="98XXXXXXXX" inputMode="numeric" className="h-11 rounded-md" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</FormLabel>
                    <FormControl><Input type="email" autoComplete="email" placeholder="you@example.com" className="h-11 rounded-md" {...field} /></FormControl>
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
                      <FormControl><Input placeholder="2018" inputMode="numeric" maxLength={4} className="h-11 rounded-md" {...field} /></FormControl>
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
              <div className="col-span-full pt-6 border-t">
                <VehiclePhotoUploader
                  images={form.watch('images')}
                  onChange={(images) => form.setValue('images', images, { shouldValidate: true })}
                  slotLabels={REQUIRED_PHOTO_SLOTS}
                  error={form.formState.errors.images?.message}
                />
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-4">Provide clear photos. Large images are automatically optimized for fast upload.</p>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
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
