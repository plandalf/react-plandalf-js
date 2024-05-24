import {babel} from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import ts from 'rollup-plugin-ts';
import pkg from './package.json';

const PLUGINS = [
    commonjs(),
    ts({
        tsconfig: 'tsconfig.json',
        transpileOnly: true,
    }),
    nodeResolve(),
    babel({
        extensions: ['.ts', '.js', '.tsx', '.jsx'],
    }),
    replace({
        'process.env.NODE_ENV': JSON.stringify('production'),
        _VERSION: JSON.stringify(pkg.version),
        preventAssignment: true,
    }),
];

export default [
    {
        input: 'src/index.tsx',
        external: ['react', 'react-dom'],
        // external: ['react'],
        output: [
            {file: pkg.main, format: 'cjs'},
            // {file: pkg.main, format: 'umd', name: 'ReactPlandalf', globals: {react: 'React'}},
            {file: pkg.module, format: 'es'},
        ],
        plugins: PLUGINS,
    },

    // UMD build
    {
        input: 'src/index.tsx',
        external: ['react'],
        // external: ['react', 'react-dom'],
        output: [
            {
                name: 'ReactPlandalf',
                file: pkg.browser,
                format: 'umd',
                globals: {
                    react: 'React',
                },
            },
        ],
        plugins: PLUGINS,
    },
    // Minified UMD Build
    {
        input: 'src/index.tsx',
        external: ['react'],
        // external: ['react', 'react-dom'],
        output: [
            {
                name: 'ReactPlandalf',
                file: pkg['browser:min'],
                format: 'umd',
                globals: {
                    react: 'React',
                },
            },
        ],
        plugins: [...PLUGINS, terser()],
    },
];