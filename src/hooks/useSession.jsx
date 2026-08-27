import { createContext, useContext } from 'react';

// Development-only session stub.
// This stands in for StarVnt Core Identity / JWT auth, which will replace
// this provider in a future sprint without changing the consumer API below.
const DEV_SESSION = {
  name: 'Dev User',
  role: 'Sales Manager',
  initials: 'DU',
};

const SessionContext = createContext(DEV_SESSION);

export function SessionProvider({ children }) {
  return <SessionContext.Provider value={DEV_SESSION}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
