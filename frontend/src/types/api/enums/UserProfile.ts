export enum UserProfile {
    Administrator = 1,
    Operator = 2,
}

export function getBadgeColorByUserProfile(value: string) {
    switch (value) {
        case UserProfile[UserProfile.Administrator]:
            return "dark";
        case UserProfile[UserProfile.Operator]:
            return "secondary";
        default:
            return "secondary";
    }
}

export function userProfileOptions() {
    return [
        { id: UserProfile.Administrator, name: "Administrador" },
        { id: UserProfile.Operator, name: "Operador" },
    ];
}