
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Wrench, CheckCircle2, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  vehicle_model: z.string().min(2, "Please specify your bike/scooter model"),
  service_type: z.string().min(1, "Please select a service type"),
  preferred_date: z.date({
    required_error: "A preferred date is required.",
  }),
});

export default function BookServicePage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const db = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      vehicle_model: "",
      service_type: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!db) return;
    setLoading(true);

    const inquiryData = {
      type: 'test-ride', // Mapping 'Service Booking' to 'test-ride' or similar type in our schema
      name: values.name,
      phone: values.phone,
      message: `Service Booking: ${values.vehicle_model}. Type: ${values.service_type}. Preferred Date: ${format(values.preferred_date, "PPP")}`,
      created_at: new Date().toISOString(),
      status: 'new'
    };

    const inquiriesRef = collection(db, 'inquiries');
    addDocumentNonBlocking(inquiriesRef, inquiryData);

    setSubmitted(true);
    setLoading(false);
    toast({
      title: "Appointment Requested",
      description: "Our service team will call you to confirm your slot.",
    });
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-14 h-14 text-green-600" />
        </div>
        <div className="space-y-4">
          <h1 className="font-headline font-bold text-5xl text-foreground">Booking Received!</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Thank you for choosing G&G Auto Hub. Our technician will contact you shortly to confirm your appointment at our Boudha workshop.
          </p>
        </div>
        <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-2xl" asChild>
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
          <div className="space-y-6">
            <div className="bg-primary/10 p-4 rounded-3xl w-fit">
              <Wrench className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-headline font-bold text-5xl leading-tight">Professional <br /><span className="text-primary">Bike Servicing</span></h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Keep your ride in top condition with Kathmandu's most trusted two-wheeler experts. We service all major brands including Honda, Yamaha, TVS, and Bajaj.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border shadow-sm group hover:border-primary/50 transition-colors">
              <div className="bg-primary/5 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Express Service</p>
                <p className="text-muted-foreground">General servicing completed in under 90 minutes.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white border shadow-sm group hover:border-primary/50 transition-colors">
              <div className="bg-primary/5 p-3 rounded-xl group-hover:bg-primary group-hover:text-white transition-colors text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-lg">Genuine Parts</p>
                <p className="text-muted-foreground">We only use certified OEM parts and high-quality lubricants.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Booking Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-gray-50">
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
                        <FormControl><Input placeholder="Your Name" className="h-12 rounded-xl" {...field} /></FormControl>
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
                        <FormControl><Input placeholder="98XXXXXXXX" className="h-12 rounded-xl" {...field} /></FormControl>
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
                        <FormControl><Input placeholder="e.g. Pulsar 150 / Dio" className="h-12 rounded-xl" {...field} /></FormControl>
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
                            <SelectTrigger className="h-12 rounded-xl">
                              <SelectValue placeholder="Select service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="full-service">Full Service</SelectItem>
                            <SelectItem value="oil-change">Oil Change Only</SelectItem>
                            <SelectItem value="brake-repair">Brake Repair</SelectItem>
                            <SelectItem value="engine-work">Engine Work</SelectItem>
                            <SelectItem value="electrical">Electrical Repair</SelectItem>
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
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "h-12 rounded-xl text-left font-normal pl-3",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="pt-6">
                  <Button type="submit" disabled={loading} className="w-full h-14 bg-primary text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
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
