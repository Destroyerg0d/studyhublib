import React from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useAuth } from "@/contexts/AuthContext";

const OnboardingTour: React.FC = () => {
  const { profile } = useAuth();
  const [run, setRun] = React.useState(false);

  React.useEffect(() => {
    const seen = typeof window !== "undefined" && localStorage.getItem("dashboard_tour_seen");
    if (!seen) {
      setRun(true);
    }
  }, []);

  const steps: Step[] = [
    {
      target: "body",
      placement: "center",
      title: "Welcome to The Study Hub",
      content:
        "Quick tour: Verify your account, complete payments (admin approval), then book your seat.",
      disableBeacon: true,
    },
    {
      target: "[data-tour='nav-verification']",
      title: "Step 1: Verification",
      content:
        "Upload your Aadhar and details here. Your account gets full access after admin approval.",
    },
    {
      target: "[data-tour='nav-fees']",
      title: "Step 2: Payments",
      content:
        "Pay your plan fees here. Payments show as approved once an admin verifies them.",
    },
    {
      target: "[data-tour='nav-seats']",
      title: "Step 3: Book Seats",
      content: "After approval, reserve your seat for your selected plan and time slot.",
    },
  ];

  const handleCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      try {
        localStorage.setItem("dashboard_tour_seen", "1");
      } catch {}
      setRun(false);
    }
  };

  // Skip tour for admins
  if (profile?.role === "admin") return null;

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      showProgress
      showSkipButton
      disableOverlayClose={false}
      scrollToFirstStep
      styles={{ options: { zIndex: 10000 } }}
      callback={handleCallback}
    />
  );
};

export default OnboardingTour;
