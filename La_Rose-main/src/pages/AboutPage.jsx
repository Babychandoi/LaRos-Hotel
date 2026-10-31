import { useEffect } from "react";
import AboutHero from "../components/about/AboutHero";
import CtaSection from "../components/about/CtaSection";
import FaqSection from "../components/about/FaqSection";
import { MilestonesSection, TeamSection } from "../components/about/JourneySections";
import StorySection from "../components/about/StorySection";
import { AwardsSection, FeaturesSection, SustainabilitySection } from "../components/about/ValuesSections";
import { CONTACT } from "../components/siteConfig";

const PAGE_TITLE = "Về La Rosé - Khách sạn 5 sao sang trọng | Hòa quyện văn hóa Pháp - Việt";

const STRUCTURED_DATA = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "La Rosé Hotel",
    description: "Khách sạn 5 sao sang trọng kết hợp văn hóa Pháp và Việt Nam",
    address: { "@type": "PostalAddress", streetAddress: CONTACT.address, addressCountry: "VN" },
    telephone: CONTACT.phone,
    email: CONTACT.email,
    amenityFeature: ["SwimmingPool", "Spa", "FineDiningRestaurant", "BusinessCenter", "ConciergeService"],
};

/** SEO: đặt tiêu đề trang + JSON-LD khi vào trang, khôi phục khi rời đi. */
const useAboutSeo = () => {
    useEffect(() => {
        const previousTitle = document.title;
        document.title = PAGE_TITLE;

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.text = JSON.stringify(STRUCTURED_DATA);
        document.head.appendChild(script);

        return () => {
            document.title = previousTitle;
            script.remove();
        };
    }, []);
};

const AboutPage = () => {
    useAboutSeo();

    return (
        <>
            <AboutHero />
            <StorySection />
            <FeaturesSection />
            <SustainabilitySection />
            <MilestonesSection />
            <AwardsSection />
            <TeamSection />
            <FaqSection />
            <CtaSection />
        </>
    );
};

export default AboutPage;
