import SandboxHeroSection from './_components/SandboxHeroSection';
import FeaturePreviewCards from './_components/FeaturePreviewCards';

export default function SandboxLandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SandboxHeroSection />
      <FeaturePreviewCards />

      {/* Footer */}
      <footer className="mt-auto py-8 text-center">
        <p className="text-xs text-white/40">
          Farrer Park Hospital &middot; Clinical Analytics OS &middot; All data is
          synthetic and for demonstration purposes only.
        </p>
      </footer>
    </div>
  );
}
