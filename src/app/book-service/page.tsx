
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BSDatePicker from '@/components/BSDatePicker';
import { formatBSDate } from '@/lib/nepali-date';
import { CheckCircle2, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitLead } from '@/lib/inventory-api';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  vehicle_model: z.string().min(2, "Please specify your bike/scooter model"),
  service_type: z.string().min(1, "Please select a service type"),
  preferred_date: z.string().min(1, "A preferred date is required."),
});

export default function BookServicePage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      vehicle_model: "",
      service_type: "",
      preferred_date: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await submitLead({
        type: 'service',
        name: values.name,
        phone: values.phone,
        message: `Service Booking: ${values.vehicle_model}. Type: ${values.service_type}. Preferred Date: ${formatBSDate(values.preferred_date)} BS (${values.preferred_date} AD)`,
        requested_service: values.service_type,
        vehicle_type: values.vehicle_model,
        preferred_date: values.preferred_date,
      });
      setSubmitted(true);
      toast({
        title: "Appointment Requested",
        description: "Our service team will call you to confirm your slot.",
      });
    } catch (err) {
      console.error('Failed to submit service booking:', err);
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
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-8">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-14 h-14 text-green-600" />
        </div>
        <div className="space-y-4">
          <h1 className="font-headline font-bold text-5xl text-foreground">Booking Received!</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Thank you for choosing G&G Auto Hub. Our technician will contact you shortly to confirm your appointment at our Boudha workshop.
          </p>
        </div>
        <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-lg" asChild>
          <a href="/">Back to Home</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Left Side: Info & Benefits */}
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-5">
            <span aria-hidden className="block w-8 h-1 bg-brand" />
            <h1 className="font-headline font-bold text-4xl md:text-5xl leading-tight tracking-tight">Professional bike servicing</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Keep your ride in top condition with Kathmandu's most trusted two-wheeler experts. We service all major brands including Honda, Yamaha, TVS, and Bajaj.
            </p>
          </div>

          <div className="border-t border-border">
            <div className="flex items-start gap-3 border-b border-border py-4">
              <Clock className="w-5 h-5 mt-0.5 shrink-0 text-brand" strokeWidth={2} />
              <div>
                <p className="font-semibold">Express service</p>
                <p className="text-sm text-muted-foreground">General servicing done in under 90 minutes.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-b border-border py-4">
              <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-brand" strokeWidth={2} />
              <div>
                <p className="font-semibold">Genuine parts</p>
                <p className="text-sm text-muted-foreground">Certified OEM parts and quality lubricants only.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Booking Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-10 rounded-xl border border-border">
            <h2 className="text-3xl font-bold font-headline mb-8">Book Your Slot</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Full Name</FormLabel>
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
                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Phone Number</FormLabel>
                        <FormControl><Input placeholder="98XXXXXXXX" className="h-11 rounded-md" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="vehicle_model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Vehicle Model</FormLabel>
                        <FormControl><Input placeholder="e.g. Pulsar 150 / Dio" className="h-11 rounded-md" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="service_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Service Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-md">
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Full Service">Full Service</SelectItem>
                            <SelectItem value="Oil Change">Oil Change Only</SelectItem>
                            <SelectItem value="Brake Repair">Brake Repair</SelectItem>
                            <SelectItem value="Engine Work">Engine Work</SelectItem>
                            <SelectItem value="Electrical Repair">Electrical Repair</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferred_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Preferred Date</FormLabel>
                        <FormControl>
                          <BSDatePicker
                            value={field.value}
                            onChange={field.onChange}
                            disablePast
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-6">
                  <Button type="submit" disabled={loading} className="w-full h-12 text-base font-semibold rounded-md">
                    {loading ? <Loader2 className="animate-spin" /> : "Confirm Appointment Request"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
