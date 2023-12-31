import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser' // 压缩打包文件

export default {
  input: './src/index.js', // 打包入口文件
  // 输出文件配置
  output: [
    {
      file: 'dist/index.js', // 打包完成后文件位置
      format: 'es', // 输出格式 amd es iife umd cjs均可配置
      sourcemap: false, // 输出.map文件，方便调试
      name: 'vsk'
    }
  ],
  plugins: [commonjs(), resolve(), terser()]
}
