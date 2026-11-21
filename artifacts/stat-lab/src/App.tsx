import { Router as WouterRouter } from 'wouter';
import { clerkEnabled, basePath } from '@/auth/clerk-config';
import { HttpErrorBanner } from '@/components/HttpErrorBanner';
import { HttpLoadingOverlay } from '@/components/HttpLoadingOverlay';
import { MarketplaceCartProvider } from '@/marketplace';
import { ClerkRoutes, LocalRoutes } from '@/routes';

function App() {
  return (
    <WouterRouter base={basePath}>
      <MarketplaceCartProvider>
        <HttpErrorBanner />
        <HttpLoadingOverlay />
        {clerkEnabled ? <ClerkRoutes/> : <LocalRoutes/>}
      </MarketplaceCartProvider>
    </WouterRouter>
  );
}

export default App;
