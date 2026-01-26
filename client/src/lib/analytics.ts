declare global {
  interface Window {
    mixpanel: any;
  }
}

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track(event, properties);
    }
  },

  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.identify(userId);
      if (properties) {
        window.mixpanel.people.set(properties);
      }
    }
  },

  pageView: (pageName: string) => {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Page View', { page: pageName });
    }
  }
};

export const EVENTS = {
  LANDING: {
    PAGE_VIEW: 'Landing Page View',
    CTA_CLICK: 'Landing CTA Click',
    DEMO_REQUEST_START: 'Demo Request Start',
    DEMO_REQUEST_COMPLETE: 'Demo Request Complete',
    NEWSLETTER_SIGNUP: 'Newsletter Signup',
    POPUP_SHOWN: 'Popup Shown',
    POPUP_SUBMIT: 'Popup Submit',
    POPUP_DISMISSED: 'Popup Dismissed',
  },
  ONBOARDING: {
    STEP_1_VIEW: 'Onboarding Step 1 View',
    STEP_1_COMPLETE: 'Onboarding Step 1 Complete',
    STEP_2_VIEW: 'Onboarding Step 2 View',
    STEP_2_COMPLETE: 'Onboarding Step 2 Complete',
    COMPLETE: 'Onboarding Complete',
    SKIP: 'Onboarding Skip',
  },
  CHECKOUT: {
    START: 'Checkout Start',
    REDIRECT_TO_STRIPE: 'Redirect to Stripe',
    SUCCESS: 'Checkout Success',
  },
  DASHBOARD: {
    PAGE_VIEW: 'Dashboard View',
    CALENDAR_VIEW: 'Calendar View',
    INVOICES_VIEW: 'Invoices View',
    MATERIALS_VIEW: 'Materials View',
    ROUTES_VIEW: 'Routes View',
  },
  CUSTOMER: {
    ADD_START: 'Add Customer Start',
    ADD_COMPLETE: 'Add Customer Complete',
    IMPORT_START: 'Import Customers Start',
    IMPORT_COMPLETE: 'Import Customers Complete',
  },
  INVOICE: {
    CREATE_START: 'Create Invoice Start',
    CREATE_COMPLETE: 'Create Invoice Complete',
    PDF_DOWNLOAD: 'Invoice PDF Download',
  },
  JOB: {
    CREATE: 'Job Created',
    UPDATE: 'Job Updated',
    SCHEDULE: 'Job Scheduled',
  },
  ROUTE: {
    OPTIMIZE_START: 'Route Optimize Start',
    OPTIMIZE_COMPLETE: 'Route Optimize Complete',
  },
};

export default analytics;
