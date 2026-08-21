import { CustomizationProvider } from "@/features/customization/context/CustomizationProvider";

import CustomizationWizard from "@/features/customization/components/CustomizationWizard";

export default function NuevoPastelPage() {
  return (
    <CustomizationProvider>
      <CustomizationWizard />
    </CustomizationProvider>
  );
}