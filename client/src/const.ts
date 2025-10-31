export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = "BRAVE SPHERE";

export const APP_LOGO = "/brave-sphere-logo.png";

// Generate login URL for Supabase authentication
export const getLoginUrl = () => {
  // For Supabase auth, redirect to the login page
  return '/login';
};

