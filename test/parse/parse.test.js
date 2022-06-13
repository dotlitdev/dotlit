import fs from 'fs';
import path from 'path'
import util from 'util'
import {parse} from '../../src/parser'
import vfile from 'to-vfile'

function fromCwd(...p) {
    return path.resolve(process.cwd(), ...p);
}

// jest.setTimeout(60 * 1000)

test('Basic .lit file output', async () => {
    process.chdir(fromCwd('./test/parse'))
    console.log('CWD', process.cwd())
    const cmd = {
        path: './source',
        cwd: process.cwd(),
        output: './__output__'
    }
    console.log(cmd)
    
    const file = await vfile.read('./source/basic.lit')
    const resp = await parse(file, {})

    const prettified = util.inspect(resp, false, Infinity, false)

    // fs.promises.writeFile('./expected/basic.ast', prettified)
    const expected = await fs.promises.readFile('./expected/basic.ast', {encoding: 'utf-8'});
    expect(expected).toBe(prettified);
})