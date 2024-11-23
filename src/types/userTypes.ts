export type User = {
    id: number;
    name: string;
    email: string;
    token: string;
};

export type UserState = {
    userDetails: User | null;
    loading: boolean;
    error: string | null;
};

export type RequestActionUser = {
    id                  : number;
    name                : string;
    email               : string;
    password            : string;
    password_confirm    : string;
    role_id             : number;
}