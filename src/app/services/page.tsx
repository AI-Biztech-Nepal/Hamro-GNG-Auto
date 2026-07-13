import { Wrench, ShieldCheck, RefreshCw, FileText, BadgeCheck, Phone, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CONTACT_INFO } from '@/lib/constants';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function ServicesPage() {
  const services = [
    {
      title: "Second Hand Sales",
      description: "Wide range of thoroughly inspected bikes and scooters across all budgets.",
      icon: <BadgeCheck className="w-10 h-10 text-primary" />,
      link: "/inventory",
      cta: "Explore Store"
    },
    {
      title: "Exchange Facility",
      description: "Upgrade your old two-wheeler with a better model at the best market rates.",
      icon: <RefreshCw className="w-10 h-10 text-primary" />,
      link: "/exchange",
      cta: "Get Appraisal"
    },
    {
      title: "Servicing & Repair",
      description: "Full-service mechanical workshop with expert mechanics for all brands.",
      icon: <Wrench className="w-10 h-10 text-primary" />,
      link: "/book-service",
      cta: "Book Appointment"
    },
    {
      title: "Insurance Renewal",
      description: "Get your vehicle insurance renewed instantly at our showroom.",
      icon: <ShieldCheck className="w-10 h-10 text-primary" />,
      link: "/contact",
      cta: "Enquire Now"
    },
    {
      title: "Ownership Transfer",
      description: "We handle all the paperwork for legal and smooth ownership transfer.",
      icon: <FileText className="w-10 h-10 text-primary" />,
      link: "/contact",
      cta: "Learn More"
    },
    {
      title: "Free Appraisal",
      description: "Not sure how much your bike is worth? Get a free professional valuation.",
      icon: <Phone className="w-10 h-10 text-primary" />,
      link: "/sell",
      cta: "Value My Bike"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h1 className="font-headline font-bold text-4xl">Our Services</h1>
        <p className="text-lg text-muted-foreground">More than just a showroom. We are your one-stop destination for all two-wheeler needs in Kathmandu.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service, index) => (
          <div key={index} className="bg-white p-8 rounded-[2rem] shadow-sm border hover:shadow-xl hover:border-primary/20 transition-all flex flex-col items-center text-center space-y-4 group">
            <div className="bg-primary/5 p-4 rounded-2xl mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
              {service.icon}
            </div>
            <h3 className="font-headline font-bold text-xl">{service.title}</h3>
            <p className="text-muted-foreground leading-relaxed flex-grow">{service.description}</p>
            <Button variant="link" className="text-primary font-bold gap-2 p-0 h-auto" asChild>
              <Link href={service.link}>{service.cta} <CalendarCheck className="w-4 h-4" /></Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-primary p-12 rounded-[3rem] text-white text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <h2 className="font-headline font-bold text-3xl md:text-4xl">Need Quick Servicing?</h2>
        <p className="text-white/80 max-w-xl mx-auto text-lg">Book an appointment online or visit our Nayabasti workshop directly for express repair services.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
          <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-bold h-14 px-8 rounded-2xl text-lg shadow-xl" asChild>
            <Link href="/book-service">Book Appointment Online</Link>
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white hover:bg-white hover:text-primary font-bold h-14 px-8 rounded-2xl text-lg group" 
                  asChild
                >
                  <a href={`tel:${CONTACT_INFO.phone}`} className="flex items-center gap-2">
                    <Phone className="w-5 h-5 group-hover:animate-pulse" />
                    <span>Call: {CONTACT_INFO.phone}</span>
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-white text-primary font-bold border-primary">
                <p>Click to call: {CONTACT_INFO.phone}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
