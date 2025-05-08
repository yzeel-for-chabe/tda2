
export const seconds_to_human = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const hours_str = hours > 0 ? `${hours}h` : "";
    const minutes_str = minutes > 0 ? `${minutes}m` : "";
    const secs_str = secs > 0 ? `${Math.floor(secs)}s` : "";

    return `${hours_str} ${minutes_str} ${secs_str}`;
};
