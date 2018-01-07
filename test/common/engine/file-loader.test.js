/* tslint:disable:no-unused-expression */
import { expect } from 'chai';
import { RulesFileLoader } from '../../../src/common/engine/file-loader';
const rulesLoader = new RulesFileLoader();
const testDir = './test/samples';
const testNoNames = ['ts'];
const testSomeNames = ['js'];
const testAllNames = ['js', 'jsr'];
let rulesModules;
describe('RulesFileLoader', () => {
    it('should load single RulesModule if recursive reading is disabled', () => {
        try {
            rulesModules = rulesLoader.loadFrom(testDir);
        }
        catch (e) {
        }
        finally {
            expect(rulesModules).to.have.length(1);
        }
    });
    it('should not load modules for non-existing file extentions', () => {
        try {
            rulesModules = rulesLoader.loadFrom(testDir, testNoNames);
        }
        catch (e) {
        }
        finally {
            expect(rulesModules).to.have.length(0);
        }
    });
    it('should recursively load modules for file extention .js', () => {
        try {
            rulesModules = rulesLoader.loadFrom(testDir, testSomeNames, true);
        }
        catch (e) {
        }
        finally {
            expect(rulesModules).to.have.length(2);
        }
    });
    it('should recursively load modules for file extentions .js & .jsr', () => {
        try {
            rulesModules = rulesLoader.loadFrom(testDir, testAllNames, true);
        }
        catch (e) {
        }
        finally {
            expect(rulesModules).to.have.length(3);
        }
    });
    it('should recursively load all modules in nested directories', () => {
        try {
            rulesModules = rulesLoader.loadFrom(testDir, null, true);
        }
        catch (e) {
        }
        finally {
            expect(rulesModules).to.have.length(3);
        }
    });
});
