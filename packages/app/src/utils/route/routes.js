import PhalaWalletPage from '@phala/wallet';
import AppSettingsPage from '@/components/SettingsPage';
import HelloWorldAppPage from '@phala/helloworld-app';
import SecretCodeAppPage from '@phala/secretcode-app';

export const COMPONENT_ROUTES = {
  wallet: PhalaWalletPage,
  settings: AppSettingsPage,
  helloworldapp: HelloWorldAppPage,
  secretcodeapp: SecretCodeAppPage,
};

export const MENU_ROUTES = {
  WALLET: '/wallet',
  SETTINGS: '/settings',
  HELLOWORLDAPP: '/helloworldapp',
  SECRETCODEAPP: '/secretcodeapp',
};
