import {jest} from '@jest/globals';
import {velbus} from '../modules/velbuslib'



// getName test : 0x08 VMB4RY
describe('Module name', () => {
    it('getName(0x08) return VMB4RY', () => {
        assert.strictEqual(velbus.getName(0x08), "VMB4RY");
        });
    it('getName(0x00) return "unknown"', () => {
        assert.strictEqual(velbus.getName(0x00), "unknown");
        });
});

describe('Module code', () => {
    it('getCode("VMB4RY") return 0x08', () => {
        assert.strictEqual(velbus.getCode("VMB4RY"), 0x08);
        });
});