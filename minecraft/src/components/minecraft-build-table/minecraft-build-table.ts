/// <amd-dependency path="text!./minecraft-build-table-html.html" />
/// <amd-dependency path="./bindings/genericContainerBindingHandler" />
/// <amd-dependency path="./bindings/inventoryDragAndDropBindingHandler" />

/// <reference path="../../require.d.ts" />

import World = require("./world");
import AppViewModel = require("./viewModel");
import ko = require("knockout");
export var template: string = require("text!./minecraft-build-table-html.html");


export class ViewModel {

    public appWorld: World;
    public appViewModel : AppViewModel;

    constructor (params: any) {
		
        console.log("app.init params:", params);
        
        this.appWorld = new World();

        this.appViewModel = new AppViewModel(true, this.appWorld);

        // make some stuff public so we can show it
        window["appViewModel"] = this.appViewModel;
        window["appWorld"] = this.appWorld;

        console.log('-- done with minecraft-experiment viewmodel ctor');
    }

    public dispose() {
        // This runs when the component is torn down. Put here any logic necessary to clean up,
        // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.        
    }
}

// knockout expects a lowercase viewModel, so we'll give it to them
export var viewModel = ViewModel;