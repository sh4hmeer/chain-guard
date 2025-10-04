import { withAuthenticationRequired } from '@auth0/auth0-react';
import type { ComponentType } from 'react';

export const Protected = <P extends object>(Component: ComponentType<P>) =>
  withAuthenticationRequired(Component, {
    onRedirecting: () => <div className="p-6">Checking auth…</div>,
  });