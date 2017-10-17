import { ProfilerItem } from './ProfilerItem.entity';

export class ProfilerData {
    gistName: string | null;
    aliases: ProfilerItem[];
    functions: ProfilerItem[];
}
