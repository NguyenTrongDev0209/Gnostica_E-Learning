import React from "react";
import { TestimonialCarousel } from "@/components/common/composite/TestimonialCarousel";

// Components
import AboutHero from "@/pages/general/components/about/AboutHero";
import AboutTools from "@/pages/general/components/about/AboutTools";
import AboutSolutions from "@/pages/general/components/about/AboutSolutions";
import AboutVision from "@/pages/general/components/about/AboutVision";
import AboutCTA from "@/pages/general/components/about/AboutCTA";

// Mock Data
import {
  aboutToolsMock,
  aboutStepsMock,
  aboutHeroMock,
  aboutVisionMock,
  aboutCTAMock
} from "@/mocks/staticPages";

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
