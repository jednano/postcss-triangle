import del from 'del';

export default done => {
	del([
		'build/**/*.js',
		'build/**/*.d.ts',
		'dist'
	], done);
}
