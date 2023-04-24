import mongoose from "mongoose";
import {UserRolesInterface} from "./UserRoles";

export interface UserInterface {
    username: string;
    chatId: number;
    paid: boolean;
    subscriptionEndAt: string;
    limits: {
        maxSymbols: number;
        symbolTotal: number;
    };
    cacheLength: number;
    userCache: string[];
    chatCache: string[];
    currentRole: {
        [key: string]: string;
    }
    roles: UserRolesInterface;
}

const UserSchema = new mongoose.Schema<UserInterface>({
    username: {type: String, required: true},
    chatId: {type: Number, required: true},
    paid: {type: Boolean, default: false},
    subscriptionEndAt: {type: String, default: null},
    limits: {
        maxSymbols: {type: Number, default: 10000},
        symbolTotal: {type: Number, default: 0},
    },
    cacheLength: {type: Number, default: 2},
    userCache: [{type: String, default: null}],
    chatCache: [{type: String, default: null}],
    currentRole: {type: Object, default: null},
    roles: {type: mongoose.Schema.Types.ObjectId, ref: 'UserRoles'},
});
export const User = mongoose.model<UserInterface>('User', UserSchema);