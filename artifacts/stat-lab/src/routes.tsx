import { ClerkProvider } from '@clerk/react';
import { Route, Switch, useLocation } from 'wouter';
import NotFound from '@/pages/not-found';
import IfrsMetrics from '@/pages/IfrsMetrics';
import LoansDepositsLanding from '@/pages/LoansDepositsLanding';
import { MarketplacePage } from '@/marketplace';
import { ClerkSessionBridge, ClerkSetupPage, HomeRedirect, SignInPage, SignUpPage } from '@/auth/AuthPages';
import { basePath, clerkAppearance, clerkProxyUrl, clerkPubKey } from '@/auth/clerk-config';
import { SessionUserContext } from '@/auth/session';
import { AccountBillingRoute, AccountRoute } from '@/pages/AccountPages';
import { CheckoutReviewPage } from '@/pages/CheckoutReviewPage';
import { WorkspaceAppRoute, WorkspaceEntry } from '@/pages/WorkspaceHome';

export function LocalRoutes() {
  return (
    <SessionUserContext.Provider value={null}>
      <Switch>
        <Route path="/" component={IfrsMetrics}/>
        <Route path="/ifrs" component={IfrsMetrics}/>
        <Route path="/loans-deposits/marketplace" component={MarketplacePage}/>
        <Route path="/loans-deposits" component={LoansDepositsLanding}/>
        <Route path="/workspace" component={WorkspaceEntry}/>
        <Route path="/workspace/app" component={WorkspaceAppRoute}/>
        <Route path="/account/billing" component={ClerkSetupPage}/>
        <Route path="/account" component={ClerkSetupPage}/>
        <Route path="/checkout" component={ClerkSetupPage}/>
        <Route path="/sign-in/*?" component={ClerkSetupPage}/>
        <Route path="/sign-up/*?" component={ClerkSetupPage}/>
        <Route component={NotFound}/>
      </Switch>
    </SessionUserContext.Provider>
  );
}

export function ClerkRoutes() {
  const [, setLocation] = useLocation();
  const stripBase = (path: string) => basePath && path.startsWith(basePath) ? path.slice(basePath.length) || '/' : path;
  return <ClerkProvider
    publishableKey={clerkPubKey}
    proxyUrl={clerkProxyUrl}
    appearance={clerkAppearance}
    signInUrl={`${basePath}/sign-in`}
    signUpUrl={`${basePath}/sign-up`}
    localization={{signIn:{start:{title:'Welcome back',subtitle:'Sign in to access your IFRS Lab projects'}},signUp:{start:{title:'Create your account',subtitle:'Save and track your IFRS Lab projects'}}}}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
  >
    <ClerkSessionBridge>
      <Switch>
        <Route path="/" component={HomeRedirect}/>
        <Route path="/ifrs" component={IfrsMetrics}/>
        <Route path="/loans-deposits/marketplace" component={MarketplacePage}/>
        <Route path="/loans-deposits" component={LoansDepositsLanding}/>
        <Route path="/workspace" component={WorkspaceEntry}/>
        <Route path="/workspace/app" component={WorkspaceAppRoute}/>
        <Route path="/account/billing" component={AccountBillingRoute}/>
        <Route path="/account" component={AccountRoute}/>
        <Route path="/checkout" component={CheckoutReviewPage}/>
        <Route path="/sign-in/*?" component={SignInPage}/>
        <Route path="/sign-up/*?" component={SignUpPage}/>
        <Route component={NotFound}/>
      </Switch>
    </ClerkSessionBridge>
  </ClerkProvider>;
}
