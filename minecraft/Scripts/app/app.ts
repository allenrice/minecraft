/// <reference path="../typings/console/console.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="app.types.ts" />
/// <reference path="app.types.ui.ts" />
/// <reference path="app.world.ts" />
/// <reference path="app.viewModel.ts" />
/// <reference path="app.viewModel.ui.ts" />

module app {

	export var init = function (useDemoBuildTable: Boolean = true) {

		console.log("app.init");

		app.world.init();

		app.viewModel.init(useDemoBuildTable);

		ko.applyBindings(app.viewModel, $("#content")[0]);

	};
}





