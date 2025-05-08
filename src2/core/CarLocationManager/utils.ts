export const addtodate = (date: Date, minutes: number) => 
    new Date(date.getTime() + minutes * 60 * 1000);

export const datein = (min: Date, max: Date, date: Date) => 
    date.getTime() >= min.getTime() && date.getTime() <= max.getTime();

export function mstohuman(ms: number): string {
    const minutes = Math.floor(ms / 1000 / 60);
    if (minutes < 60) {
        return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours < 10 ? '0':''}${hours}h${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}`;
}
