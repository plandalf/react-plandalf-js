import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';

const packageJson = require('./package.json');

export default {
    input: 'src/index.tsx', // Adjust based on your entry file
    output: [
        {
            file: packageJson.main,
            format: 'cjs',
            sourcemap: true,
            exports: 'named' // Use 'named' to clarify how exports should be accessed
        }
    ],
    plugins: [
        peerDepsExternal(),
        resolve(),
        commonjs(),
        typescript({ tsconfig: './tsconfig.json' }), // Make sure tsconfig.json path is correct
        terser()
    ],
    external: ['react', 'react-dom'] // Mark react and react-dom as external
};
