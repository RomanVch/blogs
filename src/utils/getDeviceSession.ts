import {v4 as uuidv4} from "uuid";
import {UserDevicesSessionsBaseT} from "../repository/types";
import {settings} from "../application/setting";

export const getDeviceSession = (userAgent:string,ip:string):UserDevicesSessionsBaseT => ({
    deviceId: uuidv4(),
    title:userAgent,
    ip:ip,
    lastActiveDate:new Date().toISOString(),
    deleteActiveDate: new Date(Date.now() + settings.TIME_LIFE_MS_REFRESH_TOKEN).toISOString()
})