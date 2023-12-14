'use strict'

const {src, dest, series, parallel, watch} = require('gulp')

const sass = require('gulp-sass')(require('node-sass'))
const autoprefixer = require('gulp-autoprefixer')
const plumber = require('gulp-plumber')
const cssbeautify = require('gulp-cssbeautify')
const cleanCss = require('gulp-clean-css')
const browserSync = require('browser-sync').create()
const notify = require('gulp-notify')
const fileinclude = require('gulp-file-include')
const htmlmin = require('gulp-htmlmin')
const del = require('del')
const uglify = require('gulp-uglify')
const imagemin = require('gulp-imagemin')
var svgSprite = require('gulp-svg-sprite')
const webp = require('gulp-webp')
const gcmq = require('gulp-group-css-media-queries')

// New
const webpack = require('webpack-stream')
const cssLoader = require('css-loader')
const styleLoader = require('style-loader')

// Paths
const srcPath = 'src/'
const distPath = 'dist/'

const path = {
	build: {
		html: distPath,
		css: distPath + 'assets/css',
		js: distPath + 'assets/js',
		img: distPath + 'assets/img',
		video: distPath + 'assets/video',
		svg: distPath + 'assets/img/svg',
		vendors: distPath + 'assets/vendors',
		fonts: distPath + 'assets/fonts',
	},
	src: {
		html: srcPath + '*.html',
		css: srcPath + 'assets/scss/**/*.scss',
		js: srcPath + 'assets/js/*.js',
		img: srcPath + 'assets/img/**/*.{jpg,jpeg,png,svg}',
		video: srcPath + 'assets/video/**/*',
		svg: srcPath + 'assets/img/svg/**/*.svg',
		vendors: srcPath + 'assets/vendors/**/*.{css,js}',
		fonts: srcPath + 'assets/fonts/**/*',
	},
	clean: distPath,
}

let isProd = false // dev default

function html() {
	return src(path.src.html)
		.pipe(
			fileinclude({
				prefix: '@',
				basepath: '@file',
			})
		)
		.pipe(dest(path.build.html))
		.pipe(browserSync.reload({stream: true}))
}

function htmlMinify() {
	return src(path.src.html)
		.pipe(
			fileinclude({
				prefix: '@',
				basepath: '@file',
			})
		)
		.pipe(
			htmlmin({
				collapseWhitespace: true,
			})
		)
		.pipe(dest(path.build.html))
}

function cssMinify() {
	return src(path.src.css)
		.pipe(sass())
		.pipe(gcmq())
		.pipe(
			cleanCss({
				level: 2,
			})
		)
		.pipe(dest(path.build.css))
}

function jsMinify() {
	return src(path.src.js)
		.pipe(webpack(require('./webpack.config')))
		.pipe(uglify())
		.pipe(dest(path.build.js))
}

function imgMinify() {
	return src(path.src.img)
		.pipe(
			imagemin([
				imagemin.mozjpeg({
					quality: 80,
					progressive: true,
				}),
				imagemin.optipng({
					optimizationLevel: 2,
				}),
			])
		)
		.pipe(dest(path.build.img))
}

function css() {
	return src(path.src.css)
		.pipe(
			plumber({
				errorHandler: function (err) {
					notify.onError({
						title: 'SCSS Error',
						message: 'Error: <%= error.message %>',
					})(err)
					this.emit('end')
				},
			})
		)
		.pipe(sass())
		.pipe(gcmq())
		.pipe(
			autoprefixer({
				cascade: false,
			})
		)
		.pipe(cssbeautify())
		.pipe(dest(path.build.css))
		.pipe(browserSync.reload({stream: true}))
}

function js() {
	return src(path.src.js)
		.pipe(
			plumber({
				errorHandler: function (err) {
					notify.onError({
						title: 'JS Error',
						message: 'Error: <%= error.message %>',
					})(err)
					this.emit('end')
				},
			})
		)
		.pipe(webpack(require('./webpack.config')))
		.pipe(dest(path.build.js))
		.pipe(browserSync.reload({stream: true}))
}

function img() {
	return src(path.src.img).pipe(dest(path.build.img))
}

function video() {
	return src(path.src.video).pipe(dest(path.build.video))
}

function webpImg() {
	return src(srcPath + 'assets/img/**/*.{jpeg,jpg,png}')
		.pipe(webp())
		.pipe(dest(distPath + 'assets/img/webp'))
		.pipe(browserSync.reload({stream: true}))
}

function svg() {
	return src(path.src.svg)
		.pipe(
			svgSprite({
				mode: {
					symbol: {
						sprite: '../sprite.svg',
					},
				},
			})
		)
		.pipe(dest(path.build.svg))
		.pipe(browserSync.reload({stream: true}))
}

function vendors() {
	return src(path.src.vendors)
		.pipe(dest(path.build.vendors))
		.pipe(browserSync.reload({stream: true}))
}

function fonts() {
	return src(path.src.fonts)
		.pipe(dest(path.build.fonts))
		.pipe(browserSync.reload({stream: true}))
}

// Other Tasks
function clean() {
	return del(path.clean)
}

function serve() {
	browserSync.init({
		server: {
			baseDir: distPath,
		},
	})
}

function prod(done) {
	!isProd
	done()
}

const dev = series(
	clean,
	parallel(html, css, js, img, video, webpImg, svg, vendors, fonts),
	serve
)
const build = series(
	clean,
	parallel(
		prod,
		htmlMinify,
		cssMinify,
		jsMinify,
		imgMinify,
		video,
		webpImg,
		svg,
		vendors,
		fonts
	)
)

const preview = series(serve)

function watchFiles() {
	watch([path.src.html], html)
	watch([srcPath + 'assets/**/*.html'], html)
	watch([path.src.css], css)
	watch([path.src.js], js)
	watch([srcPath + 'assets/js/**/*.js'], js)
	watch([path.src.img], img)
	watch([path.src.video], video)
	watch([path.src.img], webp)
	watch([path.src.svg], svg)
	watch([path.src.vendors], vendors)
	watch([path.src.fonts], fonts)
}

const runParallel = parallel(dev, watchFiles)

exports.html = html
exports.css = css
exports.js = js
exports.img = img
exports.video = video
exports.webpImg = webpImg
exports.svg = svg
exports.dev = dev
exports.vendors = vendors
exports.fonts = fonts
exports.build = build
exports.preview = preview
exports.watchFiles = watchFiles

exports.default = runParallel
