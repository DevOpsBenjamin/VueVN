import { GameTime } from "@/generate/types";

class TimeHelper {
    static sleep(gameTime: GameTime): void {
        if (!TimeHelper.canSleep(gameTime)){
            return;
        }

        const d = TimeHelper.toDate(gameTime);
        if (gameTime.hour >= 21) {
            d.setDate(d.getDate() + 1);
            d.setHours(7, 0, 0, 0);
        } else {
            // Early morning (0..4): same day 06:00
            d.setHours(7, 0, 0, 0);
        }
        TimeHelper.setDate(gameTime, d);
    }

    static canSleep(gameTime: GameTime): boolean {
        //If after 4h not sleep
        if (gameTime.hour >= 21 || gameTime.hour < 4) {
            return true;
        }
        return false
    }

    /** Build a JS Date from the stored fields (local time). */
    private static toDate(gameTime: GameTime): Date {
        return new Date(gameTime.year, gameTime.month - 1, gameTime.day, gameTime.hour, 0, 0, 0);
    }

    /** Update stored fields from a JS Date (local time). */
    private static setDate(gameTime: GameTime, date: Date): void {
        gameTime.year  = date.getFullYear();
        gameTime.month = date.getMonth() + 1;
        gameTime.day   = date.getDate();
        gameTime.hour  = date.getHours();
    }
    
    static waitOneHour(gameTime: GameTime) {
        const d = TimeHelper.toDate(gameTime);
        d.setHours(d.getHours() + 1);
        TimeHelper.setDate(gameTime, d);
    }

    static jump(gameTime: GameTime, hours: number) {
        const d = TimeHelper.toDate(gameTime);
        d.setHours(d.getHours() + hours);
        TimeHelper.setDate(gameTime, d);
    }
};

export default TimeHelper;