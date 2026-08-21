"use client";

import { useCustomization } from "../context/CustomizationProvider";

import WizardProgress from "./WizardProgress";
import CateringReturnBanner from "./CateringReturnBanner";

import WelcomeStep from "./WelcomeStep";
import CelebrationStep from "./CelebrationStep";
import IdeaStep from "./IdeaStep";
import InspirationStep from "./InspirationStep";
import PeopleStep from "./PeopleStep";
import FlavorStep from "./FlavorStep";
import FillingStep from "./FillingStep";
import FrostingStep from "./FrostingStep";
import ScheduleStep from "./ScheduleStep";
import DeliveryStep from "./DeliveryStep";
import SummaryStep from "./SummaryStep";

export default function CustomizationWizard() {
  const { currentStep } = useCustomization();

  return (
    <main className="min-h-screen bg-[#FFF8F2]">
      <CateringReturnBanner />

      {currentStep > 0 && <WizardProgress />}

      {currentStep === 0 && <WelcomeStep />}

      {currentStep === 1 && <CelebrationStep />}

      {currentStep === 2 && <IdeaStep />}

      {currentStep === 3 && <InspirationStep />}

      {currentStep === 4 && <PeopleStep />}

      {currentStep === 5 && <FlavorStep />}

      {currentStep === 6 && <FillingStep />}

      {currentStep === 7 && <FrostingStep />}

      {currentStep === 8 && <ScheduleStep />}

      {currentStep === 9 && <DeliveryStep />}

      {currentStep === 10 && <SummaryStep />}
    </main>
  );
}
