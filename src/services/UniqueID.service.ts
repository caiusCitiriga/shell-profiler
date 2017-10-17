export class UniqueIdUtility {
    public static generateId(): string {
        const mask = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
        return mask.replace(/[x]/g, c => Math.floor((new Date().getTime() + Math.random() * 16) % 16).toString(16));
    };
}