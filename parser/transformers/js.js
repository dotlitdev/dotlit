import {transformSync} from '@babel/core'
import presetReact from "@babel/preset-react"

export const transform = (filename, source) => {
                return transformSync(source, { 
                    filename: filename,
                    sourceMaps: false,
                    parserOpts: { allowReturnOutsideFunction: true },
                    presets: [
                        presetReact,
                        // presetTypescript
                    ],
                    plugins: [
                        // pluginClassProps
                    ]
                })
}
