export const API = {

  AUTH: {
    REGISTER:        "/api/auth/register",
    LOGIN:           "/api/auth/login",
    FORGOT_PASSWORD: "/api/auth/forgot-password",
    RESET_PASSWORD:  "/api/auth/reset-password",
  },

  PETS: {
    GET_ALL:   "/api/pets",
    GET_BY_ID: (id: string) => `/api/pets/${id}`,
    COST:      (id: string) => `/api/pets/${id}/cost`,
  },

  PRODUCTS: {
    GET_ALL:   "/api/products",
    GET_BY_ID: (id: string) => `/api/products/${id}`,
  },

  CART: {
    GET:    "/api/cart",
    ADD:    "/api/cart",
    REMOVE: (productId: string) => `/api/cart/${productId}`,
    CLEAR:  "/api/cart",
  },

  ORDERS: {
    MY_ORDERS: "/api/orders",
    GET_BY_ID: (id: string) => `/api/orders/${id}`,
    PLACE:     "/api/orders",
  },

  ADOPTION: {
    REQUEST:      "/api/adoption",
    MY_ADOPTIONS: "/api/adoption/my",
  },
  ADOPTIONS: {
    REQUEST:      "/api/adoption",
    MY_ADOPTIONS: "/api/adoption/my",
  },

  AI: {
    QUIZ:   "/api/ai/quiz",
    SUBMIT: "/api/ai/quiz/submit",
  },

  QUIZ: "/api/ai/quiz",
  SUBMIT: "/api/ai/quiz/submit",

  ANALYTICS: "/api/admin/analytics",

  USER: {
    ME:              "/api/user/me",
    UPDATE:          "/api/user/update",
    CHANGE_PASSWORD: "/api/user/change-password",
  },

  ADMIN: {
    USERS: {
      GET_ALL:   "/api/admin/users",
      GET_BY_ID: (id: string) => `/api/admin/users/${id}`,
      UPDATE:    (id: string) => `/api/admin/users/${id}`,
      DELETE:    (id: string) => `/api/admin/users/${id}`,
    },
    PETS: {
      GET_ALL: "/api/admin/pets",
      CREATE:  "/api/admin/pets",
      UPDATE:  (id: string) => `/api/admin/pets/${id}`,
      DELETE:  (id: string) => `/api/admin/pets/${id}`,
    },
    PRODUCTS: {
      GET_ALL: "/api/admin/products",
      CREATE:  "/api/admin/products",
      UPDATE:  (id: string) => `/api/admin/products/${id}`,
      DELETE:  (id: string) => `/api/admin/products/${id}`,
    },
    ADOPTIONS: {
      GET_ALL:       "/api/admin/adoptions",
      UPDATE_STATUS: (id: string) => `/api/admin/adoptions/${id}/status`,
    },
    ORDERS: {
      GET_ALL:       "/api/admin/orders",
      UPDATE_STATUS: (id: string) => `/api/admin/orders/${id}/status`,
    },
    ANALYTICS: "/api/admin/analytics",
  },

} as const;










