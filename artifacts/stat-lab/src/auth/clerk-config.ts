import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { isPublishableKey } from '@/auth/session';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const configuredClerkKey = String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '');
const clerkEnabled = isPublishableKey(configuredClerkKey);
const clerkPubKey = clerkEnabled
  ? publishableKeyFromHost(window.location.hostname, configuredClerkKey)
  : '';
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: '#147b69', colorForeground: '#142a3d', colorMutedForeground: '#64748b',
    colorDanger: '#b42318', colorBackground: '#fffdfa', colorInput: '#fffdfa',
    colorInputForeground: '#142a3d', colorNeutral: '#142a3d',
    fontFamily: 'DM Sans, sans-serif', borderRadius: '6px',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[#fffdfa] rounded-xl w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-[#142a3d] font-bold',
    headerSubtitle: 'text-[#64748b]',
    socialButtonsBlockButtonText: 'text-[#142a3d] font-semibold',
    formFieldLabel: 'text-[#142a3d] font-semibold',
    footerActionLink: 'text-[#147b69] font-semibold',
    footerActionText: 'text-[#64748b]',
    dividerText: 'text-[#64748b]',
    identityPreviewEditButton: 'text-[#147b69]',
    formFieldSuccessText: 'text-[#147b69]',
    alertText: 'text-[#142a3d]',
    logoBox: 'justify-center',
    logoImage: 'h-9 w-9',
    socialButtonsBlockButton: 'border-[#d6d2c8] bg-white',
    formButtonPrimary: 'bg-[#147b69] hover:bg-[#0f6556]',
    formFieldInput: 'border-[#d6d2c8] bg-white text-[#142a3d]',
    footerAction: 'bg-transparent',
    dividerLine: 'bg-[#e4e0d7]',
    alert: 'border-[#e4e0d7] bg-[#fffdfa]',
    otpCodeFieldInput: 'border-[#d6d2c8] text-[#142a3d]',
    formFieldRow: 'text-[#142a3d]',
    main: 'text-[#142a3d]',
  },
};
export { basePath, clerkEnabled, clerkPubKey, clerkProxyUrl, clerkAppearance };
