export const API_CONFIG = {
    BASE_URL: "https://localhost:7117/api",
    // BASE_URL: "https://billbyte-h3dfabcna4gtaycp.centralindia-01.azurewebsites.net/api",


  AUTH: {
    SIGNUP: "/auth/signup",
    VERIFY_EMAIL: "/auth/verify-email",
    LOGIN: "/auth/login",
  },

  // 💳 PLANS
  PLANS: {
    GET_ALL: "/plans"
  },
  MENU: {
  GET_ALL: "/menu-items",
  CREATE: "/menu-items",
  UPDATE: (id: string) => `/menu-items/${id}`,
  DELETE: (id: string) => `/menu-items/${id}`,
  GET_BY_ID: (id: string) => `/menu-items/${id}`
},

  MENU_IMAGE: {
  GET_ALL: "/menu-item-images",
  CREATE: "/menu-item-images",
   GET_BY_ID: (id: number) => `/menu-item-images/${id}`,
  UPDATE: (id: number) => `/menu-item-images/${id}`,
  DELETE: (id: number) => `/menu-item-images/${id}`
  },
    COMPLETED_ORDERS: {
        GET_ALL: "/completed-orders",
        CREATE: "/completed-orders",
        GET_BY_ID: (id: string) => `/completed-orders/${id}`,
        DELETE: (id: string) => `/completed-orders/${id}`,
        GET_BY_INVOICE: (invoiceNo: string) =>
    `/completed-orders/by-invoice/${invoiceNo}`
    },
    TABLE_PREFERENCES: {
    GET_ALL: "/table-preferences",
    CREATE: "/table-preferences",
    UPDATE: (id: number) => `/table-preferences/${id}`,
    GET_BY_ID: (id: number) => `/table-preferences/${id}`,
    DELETE: (id: number) => `/table-preferences/${id}`
  },
 TABLE_STATE: {
  GET_ALL: "/table-state",

  OCCUPIED: (tableId: string) =>
    `/table-state/occupied/${tableId}`,

  KOT: (tableId: string) =>
    `/kot/${tableId}`,

  BILLING: (tableId: string) =>
    `/table-state/billing/${tableId}`,

  RESET: (tableId: string) =>
    `/table-state/reset/${tableId}`
},

KOT: {
  CREATE: '/kot',
  GET_TODAY: '/kot/today',
  GET_LATEST: (tableId: string) => `/kot/latest/${tableId}`,
  GET_BY_KOT_NO: (kotNo: string) => `/kot/by-kot-no/${kotNo}`
},


  ACTIVE_TABLE_ITEMS: {
    GET_BY_TABLE: (tableId: string) =>
      `/active-table-items/${tableId}`,

    ADD_ITEM: (tableId: string) =>
      `/active-table-items/${tableId}`,

    UPDATE_ITEM: (tableId: string, itemId: number) =>
      `/active-table-items/${tableId}/${itemId}`,

    DELETE_ITEM: (tableId: string, itemId: number) =>
      `/active-table-items/${tableId}/${itemId}`,

    CLEAR_TABLE: (tableId: string) =>
      `/active-table-items/clear/${tableId}`,
  },

   USERS: {
    GET_ALL: "/users",
    CREATE: "/users",
    UPDATE_STATUS: (id: number) => `/users/${id}/status`
  },
  ASSIGN_TABLES: {
  CREATE: '/table-assignments',
   GET_BY_EMPLOYEE: (employeeId: string) =>
    `/table-assignments/by-employee/${employeeId}`
}
  

};
