import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Monitor, 
  Settings, 
  Users, 
  LineChart, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { SimpleButton, AppIconButton } from "@/components/common/AppButton";
import { TestimonialCarousel } from "@/components/common/HomeCarousels";
import { AppBreadcrumb } from "@/components/common/AppSection";
import { Home } from "lucide-react";

const tools = [
  {
    icon: <Monitor className="w-6 h-6" />,
    title: "AI Personalization",
    description: "Algorithms that adapt content to your pace and learning style automatically.",
  },
  {
    icon: <Settings className="w-6 h-6" />,
    title: "Adaptive Testing",
    description: "Assessments that challenge you just enough to keep you in the flow state.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Collaborative Spaces",
    description: "Connect with learners worldwide in our real-time digital study lounges.",
  },
  {
    icon: <LineChart className="w-6 h-6" />,
    title: "Progress Tracking",
    description: "Detailed visual insights into your mastery of complex concepts over time.",
  },
];

const steps = [
  { title: "Contact", description: "Reach out to us to start your transformative journey." },
  { title: "Consult", description: "Meet with an advisor to map your custom curriculum path." },
  { title: "Enroll", description: "Join the community and unlock your personalized platform." },
  { title: "Learn", description: "Engage with world-class content and start growing." },
];

export default function AboutUs() {
  const breadcrumbItems = [
    { label: "Trang chủ", href: "/", icon: Home },
    { label: "Về chúng tôi", isLast: true }
  ];

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 1. Hero Section */}
      <section className="app-container py-6 md:py-12">
        <AppBreadcrumb 
          items={breadcrumbItems} 
          className="mb-6 md:mb-10" 
        />
        <div className="grid md:grid-cols-2 items-center gap-6">
          <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            THE FUTURE OF EDUCATION
          </Badge>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            We Create Solutions for Your <span className="bg-button-gradient bg-clip-text text-transparent italic">Learning.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
            Empowering curious minds through ethereal learning experiences that blend artificial intelligence with human-centric collaborative environments.
          </p>
          <div className="flex items-center gap-4 mt-2">
            <SimpleButton size="lg" className="min-w-[120px] shadow-lg shadow-orange-500/20">
              Get Started
            </SimpleButton>
            <SimpleButton size="lg" variant="outline" className="min-w-[120px] bg-transparent border-orange-500 text-orange-500 hover:bg-orange-50">
              Explore More
            </SimpleButton>
          </div>
        </div>
        <div className="relative aspect-square md:aspect-[4/3] bg-teal-800 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center transform transition-all hover:scale-[1.02] cursor-pointer">
           <div className="text-white text-center flex flex-col items-center gap-4">
              <div className="w-24 h-24 border-2 border-white/20 rounded-full flex items-center justify-center opacity-40">
                <Monitor size={48} />
              </div>
              <span className="text-xl md:text-3xl font-black tracking-widest uppercase opacity-80">COLLABOUATIVE</span>
           </div>
           {/* Decorative hand icon simulation */}
           <div className="absolute bottom-12 right-12 w-32 h-16 border-b-4 border-white/30 rounded-full rotate-[-15deg]"></div>
        </div>
        </div>
      </section>

      {/* 2. Specialized Learning Tools */}
      <section className="bg-slate-50/50 py-8">
        <div className="app-container">
          <div className="text-center mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Our Specialized Learning Tools</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Advanced technology meets elegant design to provide a seamless educational journey tailored to your unique potential.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <Card key={index} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-white">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="w-12 h-12 rounded-xl bg-button-gradient text-white flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                    {tool.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{tool.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {tool.description}
                  </p>
                  <Button variant="link" className="p-0 h-auto bg-button-gradient bg-clip-text text-transparent font-bold w-fit group-hover:gap-2 transition-all">
                    Read More <ArrowRight className="ml-1 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-orange-500" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Simple Learning Solutions */}
      <section className="app-container py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 items-center gap-6 lg:gap-10">
          <div className="aspect-square bg-neutral-900 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden group">
            <div className="text-white text-center p-8 z-10">
               <h4 className="text-2xl font-black tracking-wide mb-2 opacity-60">VISION</h4>
               <div className="w-16 h-0.5 bg-primary/50 mx-auto mb-4"></div>
               <p className="text-sm tracking-[0.2em] opacity-40">STEP TO WORK</p>
            </div>
            {/* Overlay glow */}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <span className="bg-button-gradient bg-clip-text text-transparent font-bold tracking-widest text-xs uppercase">HOW WE WORK</span>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Simple Learning Solutions!</h2>
            </div>
            <div className="flex flex-col gap-6">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-button-gradient flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/10">
                    {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-bold text-slate-900">{step.title}</h4>
                    <p className="text-slate-500 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-4">
              <SimpleButton size="lg" className="min-w-[120px]">Learn More</SimpleButton>
              <SimpleButton size="lg" variant="outline" className="min-w-[120px] bg-transparent border-orange-500 text-orange-500 hover:bg-orange-50">Our Philosophy</SimpleButton>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Vision for the Future */}
      <section className="bg-primary/5 py-10">
        <div className="app-container">
          <div className="grid lg:grid-cols-2 items-center gap-8">
            <div className="flex flex-col gap-8">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Our Vision for the Future</h2>
              <div className="flex flex-col gap-6 text-slate-600 leading-relaxed">
                <p>
                  We believe education should be as unique as the individuals who seek it. Lumina Academy is committed to pioneering a data-driven pedagogical framework where every click, interaction, and achievement is analyzed to refine your learning experience.
                </p>
                <p>
                  By 2030, we envision a world where high-quality education isn't a privilege, but a beautifully accessible ethereal environment available to any mind ready to explore. Our mission is to bridge the gap between static content and dynamic understanding.
                </p>
              </div>
              <div className="border-l-4 border-orange-400/50 pl-6 py-2 italic font-medium text-slate-800 bg-white/50 rounded-r-lg">
                "Education is the architecture of the mind."
                <div className="text-xs bg-button-gradient bg-clip-text text-transparent font-bold mt-2 uppercase tracking-widest">— LUMINA YOUR PASSION</div>
              </div>
            </div>
            <div className="aspect-square bg-neutral-900 rounded-3xl shadow-2xl relative overflow-hidden flex items-center justify-center group">
               <div className="flex flex-col items-center gap-4 text-white p-12">
                  <div className="w-20 h-28 border border-white/20 rounded-t-full flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]"></div>
                  </div>
                  <div className="text-sm tracking-[0.4em] opacity-40 uppercase">GATE TO WORK</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Testimonial Section */}
      <section className="py-10">
        <TestimonialCarousel />
      </section>

      {/* 6. Ready to get started? CTA */}
      <section className="app-container pb-8">
        <div className="w-full bg-button-gradient md:bg-primary rounded-[2rem] py-8 px-6 text-center text-white flex flex-col items-center gap-4 shadow-2xl shadow-primary/30 relative overflow-hidden">
          {/* Decorative patterns */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight relative z-10">Ready to get started?</h2>
          <p className="text-white/80 max-w-xl text-lg relative z-10">
            Join thousands of students who have already transformed their learning journey with our intelligent platform.
          </p>
          <SimpleButton size="lg" variant="secondary" className="py-2 text-orange-600 h-auto font-bold text-lg hover:scale-105 transition-transform bg-white border-none shadow-xl mt-4 relative z-10">
            Contact Us
          </SimpleButton>
        </div>
      </section>
    </div>
  );
}
