import { Router as WouterRouter } from 'wouter';
import { clerkEnabled, basePath } from '@/auth/clerk-config';
import { HttpLoadingOverlay } from '@/components/HttpLoadingOverlay';
import { StatusPopupHost } from '@/components/StatusPopupHost';
import { MarketplaceCartProvider } from '@/marketplace';
import { ClerkRoutes, LocalRoutes } from '@/routes';

function App() {
  return (
    <WouterRouter base={basePath}>
      <MarketplaceCartProvider>
        <StatusPopupHost />
        <HttpLoadingOverlay />
        {clerkEnabled ? <ClerkRoutes/> : <LocalRoutes/>}
      </MarketplaceCartProvider>
    </WouterRouter>
  );
}

export default App;
