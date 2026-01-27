declare global {
  interface Window {
    mixpanel: any;
  }
}

// List of PII fields to automatically strip from analytics
const PII_FIELDS = ['email', 'phone', 'firstName', 'lastName', 'name', 'companyName', 'address', 'city', 'zipCode', 'state'];

// Sanitize properties to remove any PII
const sanitizeProperties = (properties?: Record<string, any>): Record<string, any> | undefined => {
  if (!properties) return properties;
  const sanitized = { ...properties };
  PII_FIELDS.forEach(field => {
    if (field in sanitized) {
      delete sanitized[field];
    }
  });
  return sanitized;
};

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track(event, {
        ...sanitizeProperties(properties),
        timestamp: new Date().toISOString(),
      });
    }
  },

  identify: (userId: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.identify(userId);
      if (properties) {
        window.mixpanel.people.set({
          ...sanitizeProperties(properties),
          $last_seen: new Date().toISOString(),
        });
      }
    }
  },

  setUserProperties: (properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.people.set(sanitizeProperties(properties));
    }
  },

  incrementProperty: (property: string, value: number = 1) => {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.people.increment(property, value);
    }
  },

  pageView: (pageName: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Page View', { 
        page: pageName,
        url: window.location.href,
        ...sanitizeProperties(properties) 
      });
    }
  },

  timeEvent: (eventName: string) => {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.time_event(eventName);
    }
  },

  reset: () => {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.reset();
    }
  },

  trackSessionStart: () => {
    if (typeof window !== 'undefined' && window.mixpanel) {
      window.mixpanel.track('Session Start', {
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        language: navigator.language,
      });
    }
  },
};

export const EVENTS = {
  // Session & App Events
  SESSION: {
    START: 'Session Start',
    END: 'Session End',
    APP_OPENED: 'App Opened',
    APP_BACKGROUNDED: 'App Backgrounded',
  },

  // Landing Page Events
  LANDING: {
    PAGE_VIEW: 'Landing Page View',
    CTA_CLICK: 'Landing CTA Click',
    DEMO_REQUEST_START: 'Demo Request Start',
    DEMO_REQUEST_COMPLETE: 'Demo Request Complete',
    DEMO_VIDEO_PLAY: 'Demo Video Play',
    DEMO_VIDEO_COMPLETE: 'Demo Video Complete',
    NEWSLETTER_SIGNUP: 'Newsletter Signup',
    POPUP_SHOWN: 'Popup Shown',
    POPUP_SUBMIT: 'Popup Submit',
    POPUP_DISMISSED: 'Popup Dismissed',
    PRICING_VIEW: 'Pricing Section View',
    FEATURES_VIEW: 'Features Section View',
    TESTIMONIALS_VIEW: 'Testimonials Section View',
    SCROLL_DEPTH: 'Scroll Depth',
  },

  // Onboarding Events
  ONBOARDING: {
    STEP_1_VIEW: 'Onboarding Step 1 View',
    STEP_1_COMPLETE: 'Onboarding Step 1 Complete',
    STEP_2_VIEW: 'Onboarding Step 2 View',
    STEP_2_COMPLETE: 'Onboarding Step 2 Complete',
    COMPLETE: 'Onboarding Complete',
    SKIP: 'Onboarding Skip',
    RESUME: 'Onboarding Resume',
    FIELD_FOCUS: 'Onboarding Field Focus',
    VALIDATION_ERROR: 'Onboarding Validation Error',
  },

  // Checkout Events
  CHECKOUT: {
    START: 'Checkout Start',
    REDIRECT_TO_STRIPE: 'Redirect to Stripe',
    SUCCESS: 'Checkout Success',
    CANCEL: 'Checkout Cancel',
    ERROR: 'Checkout Error',
  },

  // Dashboard Events
  DASHBOARD: {
    PAGE_VIEW: 'Dashboard View',
    CALENDAR_VIEW: 'Calendar View',
    INVOICES_VIEW: 'Invoices View',
    MATERIALS_VIEW: 'Materials View',
    ROUTES_VIEW: 'Routes View',
    SIDEBAR_TOGGLE: 'Sidebar Toggle',
    QUICK_ACTION_CLICK: 'Quick Action Click',
  },

  // Navigation Events
  NAVIGATION: {
    TAB_CLICK: 'Navigation Tab Click',
    SEARCH_FOCUS: 'Search Focus',
    SEARCH_QUERY: 'Search Query',
    SEARCH_RESULT_CLICK: 'Search Result Click',
    MENU_OPEN: 'Menu Open',
    SETTINGS_CLICK: 'Settings Click',
    HELP_CLICK: 'Help Click',
    NOTIFICATIONS_OPEN: 'Notifications Open',
    PROFILE_CLICK: 'Profile Click',
  },

  // Customer Events
  CUSTOMER: {
    LIST_VIEW: 'Customer List View',
    ADD_START: 'Add Customer Start',
    ADD_COMPLETE: 'Add Customer Complete',
    ADD_ERROR: 'Add Customer Error',
    IMPORT_START: 'Import Customers Start',
    IMPORT_COMPLETE: 'Import Customers Complete',
    IMPORT_ERROR: 'Import Customers Error',
    EDIT_START: 'Edit Customer Start',
    EDIT_COMPLETE: 'Edit Customer Complete',
    DELETE: 'Customer Delete',
    SEARCH: 'Customer Search',
    SELECT: 'Customer Select',
  },

  // Invoice Events
  INVOICE: {
    LIST_VIEW: 'Invoice List View',
    CREATE_START: 'Create Invoice Start',
    CREATE_COMPLETE: 'Create Invoice Complete',
    CREATE_ERROR: 'Create Invoice Error',
    PDF_DOWNLOAD: 'Invoice PDF Download',
    PDF_PREVIEW: 'Invoice PDF Preview',
    EDIT_START: 'Edit Invoice Start',
    EDIT_COMPLETE: 'Edit Invoice Complete',
    DELETE: 'Invoice Delete',
    SEND: 'Invoice Send',
    MARK_PAID: 'Invoice Mark Paid',
    LINE_ITEM_ADD: 'Invoice Line Item Add',
    LINE_ITEM_REMOVE: 'Invoice Line Item Remove',
    DISCOUNT_APPLY: 'Invoice Discount Apply',
    SEARCH: 'Invoice Search',
  },

  // Job Events
  JOB: {
    LIST_VIEW: 'Job List View',
    CREATE_START: 'Job Create Start',
    CREATE_COMPLETE: 'Job Created',
    CREATE_ERROR: 'Job Create Error',
    UPDATE: 'Job Updated',
    DELETE: 'Job Delete',
    SCHEDULE: 'Job Scheduled',
    RESCHEDULE: 'Job Rescheduled',
    COMPLETE: 'Job Complete',
    CANCEL: 'Job Cancel',
    ASSIGN_TECHNICIAN: 'Job Assign Technician',
    ADD_NOTES: 'Job Add Notes',
    UPLOAD_PHOTO: 'Job Upload Photo',
    VIEW_DETAILS: 'Job View Details',
  },

  // Route Events
  ROUTE: {
    LIST_VIEW: 'Route List View',
    OPTIMIZE_START: 'Route Optimize Start',
    OPTIMIZE_COMPLETE: 'Route Optimize Complete',
    OPTIMIZE_ERROR: 'Route Optimize Error',
    SAVE: 'Route Save',
    EDIT: 'Route Edit',
    DELETE: 'Route Delete',
    REORDER: 'Route Reorder',
    ADD_STOP: 'Route Add Stop',
    REMOVE_STOP: 'Route Remove Stop',
    VIEW_MAP: 'Route View Map',
    EXPORT: 'Route Export',
  },

  // Materials/Inventory Events
  MATERIALS: {
    LIST_VIEW: 'Materials List View',
    ADD_START: 'Material Add Start',
    ADD_COMPLETE: 'Material Add Complete',
    EDIT: 'Material Edit',
    DELETE: 'Material Delete',
    SEARCH: 'Material Search',
    RESTOCK_ALERT: 'Material Restock Alert',
    USAGE_LOG: 'Material Usage Log',
    INVENTORY_CHECK: 'Inventory Check',
  },

  // Calendar Events
  CALENDAR: {
    VIEW_CHANGE: 'Calendar View Change',
    DATE_SELECT: 'Calendar Date Select',
    EVENT_CLICK: 'Calendar Event Click',
    EVENT_CREATE: 'Calendar Event Create',
    EVENT_DRAG: 'Calendar Event Drag',
    WEEK_CHANGE: 'Calendar Week Change',
    MONTH_CHANGE: 'Calendar Month Change',
    FILTER_APPLY: 'Calendar Filter Apply',
  },

  // User Account Events
  ACCOUNT: {
    LOGIN: 'User Login',
    LOGOUT: 'User Logout',
    SIGNUP_START: 'Signup Start',
    SIGNUP_COMPLETE: 'Signup Complete',
    PASSWORD_RESET_REQUEST: 'Password Reset Request',
    PASSWORD_RESET_COMPLETE: 'Password Reset Complete',
    PROFILE_UPDATE: 'Profile Update',
    SETTINGS_CHANGE: 'Settings Change',
    SUBSCRIPTION_VIEW: 'Subscription View',
    UPGRADE_CLICK: 'Upgrade Click',
  },

  // Error Events
  ERROR: {
    API_ERROR: 'API Error',
    VALIDATION_ERROR: 'Validation Error',
    PAGE_NOT_FOUND: 'Page Not Found',
    PERMISSION_DENIED: 'Permission Denied',
    NETWORK_ERROR: 'Network Error',
    UNKNOWN_ERROR: 'Unknown Error',
  },

  // Feature Discovery
  FEATURE: {
    FIRST_JOB_CREATED: 'First Job Created',
    FIRST_CUSTOMER_ADDED: 'First Customer Added',
    FIRST_INVOICE_CREATED: 'First Invoice Created',
    FIRST_ROUTE_OPTIMIZED: 'First Route Optimized',
    TOOLTIP_VIEW: 'Tooltip View',
    TUTORIAL_START: 'Tutorial Start',
    TUTORIAL_COMPLETE: 'Tutorial Complete',
    TUTORIAL_SKIP: 'Tutorial Skip',
  },
};

export default analytics;
