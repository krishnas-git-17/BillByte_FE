export const API_CONFIG = {
    BASE_URL: "https://localhost:7117/api",
    //  BASE_URL: "https://billbyte-be-4.onrender.com/api",


    MENU: {
        GET_ALL: "/MenuItems",
        CREATE: "/MenuItems",
        UPDATE: (id: string) => `/MenuItems/${id}`,
        DELETE: (id: string) => `/MenuItems/${id}`,
        GET_BY_ID: (id: string) => `/MenuItems/${id}`
    },
    MENU_IMAGE: {
        GET_ALL: "/menu-item-images",
        CREATE: "/menu-item-images",
        GET_BY_ID: (id: string) => `/menu-item-images/${id}`,
        UPDATE: (id: string) => `/menu-item-images/${id}`,
        DELETE: (id: string) => `/menu-item-images/${id}`
    },
    COMPLETED_ORDERS: {
        GET_ALL: "/completed-orders",
        CREATE: "/completed-orders",
        GET_BY_ID: (id: string) => `/completed-orders/${id}`,
        DELETE: (id: string) => `/completed-orders/${id}`
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
    START: (tableId: string) => `/table-state/start/${tableId}`,
    STOP: (tableId: string) => `/table-state/stop/${tableId}`,
    SET_STATUS: "/table-state/status"
  }
};
