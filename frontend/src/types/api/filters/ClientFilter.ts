import { BaseFilter } from "./BaseFilter";

export type ClientFilter = BaseFilter & {
    document?: string;
};
