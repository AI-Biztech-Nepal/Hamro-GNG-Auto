"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { submitLead } from '@/lib/inventory-api';
import { VehiclePhotoUploader, REQUIRED_PHOTO_SLOTS } from '@/components/VehiclePhotoUploader';

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().regex(/^\+?\d{10,13}$/, { message: "Enter a valid phone number, digits only." }),
  email: z.string().email({ message: "Enter a valid email address." }),
  brand: z.string().min(1, { message: "Brand is required." }),
  model: z.string().min(1, { message: "Model is required." }),
  year: z.string().regex(/^(19|20)\d{2}$/, { message: "Enter a 4-digit year, e.g. 2022." }),
  km_run: z.string().regex(/^\d{1,6}$/, { message: "Enter the KM run as a number." }),
  expected_price: z.string().regex(/^\d{4,9}$/, { message: "Enter your expected price as a number." }),
  interested_in: z.string(),
  message: z.string().optional(),
  images: z.array(z.string()).length(REQUIRED_PHOTO_SLOTS.length).refine(a => a.every(Boolean), "Please upload all 4 photos."),
});
const schemaAskingInterest = formSchema.extend({
  interested_in: z.string().trim().min(2, { message: "What bike are you looking for?" }),
});

export type BikeLeadValues = z.infer<typeof formSchema>;

interface BikeLeadFormProps {
  type: 'sell' | 'exchange';
  heading: string;
  submitLabel: string;
  footnote: string;
  /** Asks which bike they want: for an exchange that didn't start from a particular bike's card. */
  askInterest?: boolean;
  /** The lead's message: `details` is the visitor's own bike, written the same way for Sell and Exchange. */
  buildMessage: (details: string, values: BikeLeadValues) => string;
  successToast: { title: string; description: string };
  onSubmitted: () => void;
}

/** The form behind both Sell and Exchange, so the two always ask for the same details and photos. */
export function BikeLeadForm({ type, heading, submitLabel, footnote, askInterest = false, buildMessage, successToast, onSubmitted }: BikeLeadFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<BikeLeadValues>({
    resolver: zodResolver(askInterest ? schemaAskingInterest : formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      brand: "",
      model: "",
      year: "",
      km_run: "",
      expected_price: "",
      interested_in: "",
      message: "",
      images: REQUIRED_PHOTO_SLOTS.map(() => ''),
    },
  });

  async function onSubmit(values: BikeLeadValues) {
    setLoading(true);
    try {
      const details = `${values.brand} ${values.model} (${values.year}). KM: ${values.km_run}. Expected Price: NPR ${values.expected_price}.`;
      await submitLead({
        type,
        name: values.name,
        phone: values.phone,
        email: values.email,
        message: `${buildMessage(details, values)} ${values.message || ''} Photos in order: ${REQUIRED_PHOTO_SLOTS.join(', ')}.`,
        images: values.images,
      });
      onSubmitted();
      toast(successToast);
    } catch (err) {
      console.error(`Failed to submit ${type} inquiry:`, err);
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-8 md:p-12 rounded-xl border border-border">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold font-headline border-l-2 border-brand pl-3">{heading}</h3>
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
                    <FormControl><Input placeholder="98XXXXXXXX" inputMode="numeric" className="h-11 rounded-md" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</FormLabel>
                    <FormControl><Input type="email" autoComplete="email" placeholder="you@example.com" className="h-11 rounded-md" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="2022" inputMode="numeric" maxLength={4} className="h-11 rounded-md" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="12000" inputMode="numeric" className="h-11 rounded-md" {...field} /></FormControl>
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
                    <FormControl><Input placeholder="e.g. 185000" inputMode="numeric" className="h-11 rounded-md" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {askInterest && (
                <FormField
                  control={form.control}
                  name="interested_in"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Interested In</FormLabel>
                      <FormControl><Input placeholder="e.g. Yamaha MT-15 or Scooter" className="h-11 rounded-md" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Image Upload Section */}
              <div className="col-span-full pt-4 border-t">
                <VehiclePhotoUploader
                  images={form.watch('images')}
                  onChange={(images) => form.setValue('images', images, { shouldValidate: true })}
                  slotLabels={REQUIRED_PHOTO_SLOTS}
                  error={form.formState.errors.images?.message}
                />
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
            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold rounded-md">
              {loading ? <Loader2 className="animate-spin" /> : submitLabel}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground mt-4 uppercase tracking-widest font-semibold">
              {footnote}
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
