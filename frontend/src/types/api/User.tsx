import { BaseEntity } from "@/types/api/BaseEntity";
import { UserProfile } from "./enums/UserProfile";

export type User = {
    id?: string,
    username: string,
    password?: string,
    profile: UserProfile;
} & Partial<BaseEntity>;