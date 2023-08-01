import { nodeResolve } from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
	input: 'src/js/index.js',
	output: {
		file: 'src/out/bundle.js',
		format: 'iife',
		name: 'Main'
	},
	plugins: [
		json({compact: true}),
		alias({
			entries: {
				'three/addons': '../../node_modules/three/examples/jsm',
				'three/fonts': '../../node_modules/three/examples/fonts'
			}
		}),
		nodeResolve(),
		terser()]
};