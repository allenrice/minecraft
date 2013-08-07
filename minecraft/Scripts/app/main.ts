/// <reference path="../typings/requirejs/require.d.ts" />

require.config({
	baseUrl: '/Scripts/app',
	paths: {
		'jquery': '/Scripts/jquery-2.0.1',
		'knockout': '/Scripts/knockout-2.2.1'
	},
});

require(['app'], function (root) {
	root.app.init();
});