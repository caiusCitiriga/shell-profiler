export const HELP = [
    {
        command: 'set',
        options: '--token:tkn, --username:usr',
    },
    {
        command: 'new',
        options: '--alias, --func'
    },
    {
        command: 'delete',
        options: '--alias:name, --func:name'
    },
    {
        command: 'edit',
        options: '--alias:name, --func:name'
    },
    {
        command: '<alias_name | func_name>',
        options: 'executes the given command. All the "natural command options can be passed"'
    }
]
