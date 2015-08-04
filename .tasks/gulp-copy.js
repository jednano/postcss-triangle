import gulp from 'gulp';

export default () => {
	return gulp.src('build/lib/**/*.d.ts', { base: 'build/lib' })
		.pipe(gulp.dest('dist'));
}
