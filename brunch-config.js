exports.watcher     = { awaitWriteFinish: true };
exports.autoRequire = { 'app.js': ['initialize'] };

exports.files = {
	javascripts: {joinTo: 'app.js'}
	, stylesheets: {joinTo: 'app.css'}
};

exports.paths = { public: './docs' };

exports.plugins = {
	babel: {
		presets:   ['@babel/preset-env']
		, plugins: ["@babel/plugin-proposal-class-properties"]
	}
	, raw: {
		pattern: /\.(html|svg)$/,
		wrapper: content => `module.exports = ${JSON.stringify(content)}`
	}
	, preval:{ tokens: { BUILD_TIME: ()=> Date.now() } }
};

