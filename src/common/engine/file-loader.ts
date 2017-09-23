import * as fs from 'fs-extra';
import * as path from 'path';

import * as VError from 'verror';

import { RulesModule } from './models';

interface FileData {
    file: string;
    stat: fs.Stats;
}

export class RulesFileLoader {

    /**
     * Creates a matching function to test filenames for their endings.
     * @param extentions An array of file extentions.
     */
    private extentionsMatch(extentions?: string[]): (string) => boolean {
        let regexp = null;
        const doMatch = Boolean(extentions) && extentions.length > 0;
        if (doMatch) {
            const pattern = extentions.map((ext: string) => `.${ext}`).join('|');
            regexp = new RegExp(`(${pattern})$`, 'i');
        }
        return (fileName: string): boolean => {
            return !doMatch || regexp.test(fileName);
        }
    }

    /**
     * Recursively loads set of rules starting with the the provided root directory.
     * @param rulesDir The root dir to start loading from.
     * @param extentions (Optional) A list of extentions to match against filenames.
     * @param recursive (Optional) Should nested dirs be searched for rules recursively.
     */
    public loadFrom(rulesDir: string, extentions?: string[], recursive?: boolean): RulesModule[] {
        const realPath = fs.realpathSync(rulesDir);
        const fileData = fs.readdirSync(realPath)
            .map((fileName: string): FileData => {
                const filePath = path.join(rulesDir, fileName);
                const file = fs.realpathSync(filePath);
                const stat = fs.statSync(file);
                return {
                    file,
                    stat,
                };
            });
        const rulesModules: RulesModule[] = [];
        fileData.forEach((data: FileData, index: number) => {
            const matches = this.extentionsMatch(extentions);
            switch (true) {
                case data.stat.isFile() && matches(data.file): {
                    const rulesModule = require(data.file);
                    rulesModules.push(rulesModule);
                    break;
                }
                case data.stat.isDirectory() && recursive: {
                    const recursiveModules = this.loadFrom(data.file, extentions, recursive);
                    rulesModules.push(...recursiveModules);
                    break;
                }
            }
        });
        return rulesModules;
    }
}
