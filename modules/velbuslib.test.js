import * as velbuslib from './velbuslib'

// Simple function to search module name, code, etc.
test ("fct getName(0x15) must return 'VMBDMI'", () => {
    expect(velbuslib.getName(0x15)).toBe('VMBDMI')
})
test ("fct getCode('VMBDMI)) must return 0x15", () => {
    expect(velbuslib.getCode('VMBDMI')).toBe(0x15)
})