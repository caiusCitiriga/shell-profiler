import { ProfilerItem } from './ProfilerItem.entity';

export class ProfilerData {
    aliases: ProfilerItem[];
    functions: ProfilerItem[];

    name: string | null;
    userBashrcFilePath: string | null;
}
