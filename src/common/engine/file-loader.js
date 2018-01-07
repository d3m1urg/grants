import * as fs from 'fs-extra';
import * as path from 'path';
export class RulesFileLoader {
    /**
     * Creates a matching function to test filenames for their endings.
     * @param extentions An array of file extentions.
     */
    extentionsMatch(extentions) {
        let regexp = null;
        const testMatch = Boolean(extentions) && extentions.length > 0;
        if (testMatch) {
            const pattern = extentions.map((ext) => `.${ext}`).join('|');
            regexp = new RegExp(`(${pattern})$`, 'i');
        }
        return (fileName) => {
            return !testMatch || regexp.test(fileName);
        };
    }
    /**
     * Recursively loads set of rules starting with the the provided root directory.
     * @param rulesDir The root dir to start loading from.
     * @param extentions (Optional) A list of extentions to match against filenames.
     * @param recursive (Optional) Should nested dirs be searched for rules recursively.
     */
    loadFrom(rulesDir, extentions, recursive) {
        const realPath = fs.realpathSync(rulesDir);
        const fileData = fs.readdirSync(realPath)
            .map((fileName) => {
            const filePath = path.join(rulesDir, fileName);
            const file = fs.realpathSync(filePath);
            const stat = fs.statSync(file);
            return {
                file,
                stat,
            };
        });
        const rulesModules = [];
        fileData.forEach((data, index) => {
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
