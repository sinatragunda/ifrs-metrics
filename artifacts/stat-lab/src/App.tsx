import { Router as WouterRouter } from 'wouter';
import { clerkEnabled, basePath } from '@/auth/clerk-config';
import { MarketplaceCartProvider } from '@/marketplace';
import { ClerkRoutes, LocalRoutes } from '@/routes';

function App() {
  return (
    <WouterRouter base={basePath}>
      <MarketplaceCartProvider>
        {clerkEnabled ? <ClerkRoutes/> : <LocalRoutes/>}
      </MarketplaceCartProvider>
    </WouterRouter>
  );
}

export default App;
