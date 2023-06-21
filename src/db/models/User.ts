import mongoose from "mongoose";
import {UserRolesInterface} from "./UserRoles";

export interface UserInterface {
    username: string;
    chatId: number;
    paid: boolean;
    subscriptionEndAt: string;
    limits: {
        maxWords: number;
        wordsTotal: number;
        maxImg: number;
        imgTotal: number;
    };
    referralId: string;
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
        maxWords: {type: Number, default: 2000},
        wordsTotal: {type: Number, default: 0},
        maxImg: {type: Number, default: 100},
        imgTotal: {type: Number, default: 0},
    },
    referralId: {type: String, default: null},
    cacheLength: {type: Number, default: 2},
    userCache: [{type: String, default: []}],
    chatCache: [{type: String, default: []}],
    currentRole: {type: Object, default: null},
    roles: {type: mongoose.Schema.Types.ObjectId, ref: 'UserRoles'},
});
export const User = mongoose.model<UserInterface>('User', UserSchema);