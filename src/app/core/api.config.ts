export const API_CONFIG = {
    //  BASE_URL: "https://localhost:7117/api",
    BASE_URL: "https://billbyte-be-4.onrender.com/api",


    MENU: {
        GET_ALL: "/MenuItems",
        CREATE: "/MenuItems",
        UPDATE: (id: string) => `/MenuItems/${id}`,
        DELETE: (id: string) => `/MenuItems/${id}`,
        GET_BY_ID: (id: string) => `/MenuItems/${id}`
    },
    MENU_IMAGE: {
        GET_ALL: "/MenuItemImage",
        CREATE: "/MenuItemImage",
        GET_BY_ID: (id: string) => `/MenuItemImage/${id}`,
        UPDATE: (id: string) => `/MenuItemImage/${id}`,
        DELETE: (id: string) => `/MenuItemImage/${id}`
    }


};
