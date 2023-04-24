import mongoose from "mongoose";

export interface UserRolesInterface {
    roles: {
        [key: string]: string;
    }
}

const UserRolesSchema = new mongoose.Schema<UserRolesInterface>({
    roles: {type: Object, default: null},
});
export const UserRoles = mongoose.model<UserRolesInterface>('UserRoles', UserRolesSchema);