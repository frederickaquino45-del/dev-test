import { SidebarItemsType } from "@/types/sidebar";
import { NAVIGATION_PATH } from "@/constants";
import { UserProfile } from "@/types/api/enums/UserProfile";
import { FaRegAddressBook } from "react-icons/fa";
import { HiOutlineUsers } from "react-icons/hi";

// PAGES
const CLIENTS_PAGE: SidebarItemsType = { href: NAVIGATION_PATH.CLIENTS.LISTING.ABSOLUTE, title: "Clientes", icon: FaRegAddressBook };
const USERS_PAGE: SidebarItemsType = { href: NAVIGATION_PATH.USERS.LISTING.ABSOLUTE, title: "Usuários", icon: HiOutlineUsers };

export const SIDEBAR = {
    [UserProfile.Administrator]: [
        {
            title: "Gestão",
            pages: [CLIENTS_PAGE, USERS_PAGE]
        }
    ],
}