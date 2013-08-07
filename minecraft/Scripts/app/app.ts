/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="app.viewModel.ts" />


module app {

	export var init = function (useDemoBuildTable: Boolean = true) {

		console.log("app.init");

		app.world.init();

		app.viewModel.init(useDemoBuildTable);

		ko.applyBindings(app.viewModel, $("#content")[0]);

	};
}





