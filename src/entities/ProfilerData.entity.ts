import { ProfilerItem } from './ProfilerItem.entity';

export class ProfilerData {
    aliases: ProfilerItem[];
    functions: ProfilerItem[];

    gistName: string | null;
    userBashrcFilePath: string | null;
}
