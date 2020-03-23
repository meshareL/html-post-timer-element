'use strict';
import pluginClear from 'rollup-plugin-clear';
import pluginTypescript from '@rollup/plugin-typescript';
import pluginNodeResolve from '@rollup/plugin-node-resolve';
import pluginCommonjs from '@rollup/plugin-commonjs';
import pluginBabel from 'rollup-plugin-babel';
import {terser as pluginTerser} from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
    input: './src/index.ts',
    output: [
        {
            file: pkg.module,
            format: 'esm',
            sourcemap: true
        },
        {
            name: 'HTMLPostTimerElement',
            file: pkg.main,
            format: 'umd',
            sourcemap: true
        }
    ],
    plugins: [
        pluginClear({
            targets: ['dist']
        }),
        pluginTypescript(),
        pluginNodeResolve(),
        pluginCommonjs(),
        pluginBabel({
            presets: ['github'],
            exclude: 'node_modules/**',
            extensions: ['.js', '.ts'],
        }),
        pluginTerser()
    ]
};
