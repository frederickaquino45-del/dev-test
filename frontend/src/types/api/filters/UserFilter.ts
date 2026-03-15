import { BaseFilter } from "./BaseFilter";

export type UserFilter = BaseFilter & {
    username: string;
};

