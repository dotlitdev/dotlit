import fs from 'fs';
import path from 'path';
import {generate} from '../../src/cli/generate';

function fromCwd(...p) {
    return path.resolve(process.cwd(), ...p);
}

// jest.setTimeout(60 * 1000)

test('Basic .lit file output', done => {
    const cb = async (err, res) => {
        expect(err).toBeUndefined()
        const output = await fs.readFileSync(fromCwd('./__output__/basic.html'), 'utf-8')
        const expected = await fs.readFileSync(fromCwd('./expected/basic.html'), 'utf-8')
        expect(output).toBe(expected)
        done()
    }
    process.chdir(fromCwd('./test/generate'))
    console.log('CWD', process.cwd())
    const cmd = {
        path: './source',
        cwd: process.cwd(),
        output: './__output__'
    }
    console.log(cmd)
    generate(cmd, cb)
})