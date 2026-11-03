
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { BikeLeadForm } from '@/components/BikeLeadForm';

export default function SellPage() {
  const [submitted, setSubmitted] = useState(false);

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
          <BikeLeadForm
            type="sell"
            heading="Vehicle Details"
            submitLabel="Request a price"
            footnote="No obligation · we’ll call you back"
            buildMessage={(details) => `Sell Inquiry: ${details}`}
            successToast={{ title: 'Inquiry Submitted', description: "We've received your bike details and photos. Our team will contact you soon." }}
            onSubmitted={() => setSubmitted(true)}
          />
        </div>
      </div>
    </div>
  );
}
