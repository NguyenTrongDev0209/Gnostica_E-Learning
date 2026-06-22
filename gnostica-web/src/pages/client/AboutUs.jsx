import React from "react";
import { TestimonialCarousel } from "@/components/pages/client/home/HomeCarousels";

// Components
import AboutHero from "@/components/pages/client/about/AboutHero";
import AboutTools from "@/components/pages/client/about/AboutTools";
import AboutSolutions from "@/components/pages/client/about/AboutSolutions";
import AboutVision from "@/components/pages/client/about/AboutVision";
import AboutCTA from "@/components/pages/client/about/AboutCTA";

// Mock Data
import {
  aboutToolsMock,
  aboutStepsMock,
  aboutHeroMock,
  aboutVisionMock,
  aboutCTAMock
} from "@/apiMocks/staticPages";

export default function AboutUs() {
  return (
    <div className="flex flex-col w-full overflow-hidden">
      <AboutHero data={aboutHeroMock} />

      <AboutTools tools={aboutToolsMock} />

      <AboutSolutions steps={aboutStepsMock} />

      <AboutVision data={aboutVisionMock} />

      <section className="py-10">
        <TestimonialCarousel />
      </section>

      <AboutCTA data={aboutCTAMock} />
    </div>
  );
}
