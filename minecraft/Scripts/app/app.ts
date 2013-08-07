/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />

import appViewModel = module("app.viewModel");
import appWorld = module("app.world");

export module app {

	export var init = function (useDemoBuildTable: Boolean = true) {

		
		console.log("app.init");

		appWorld.app.world.init();

		appViewModel.app.viewModel.init(useDemoBuildTable);

		ko.applyBindings(appViewModel.app.viewModel, $("#content")[0]);

	};
}


