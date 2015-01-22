/// <amd-dependency path="jqueryui" />
/// <reference path="../../../jqueryui.d.ts" />

import $ = require("jquery");
import ko = require("knockout");
import appTypesUI = require("../types.ui");

// this has to affect the global interface of the same name so this has to be global, this adds the binding for the following module


/** defines the possible types of containers for the generic containers binding */
export var containerTypes = {
	buildTable: "buildSlotContainer",
	inventory: "inventoryContainer"
};

/** where the actual custom bindings live, so we can call them with slightly different names and get somewhat of the same functionality */
var genericContainerBinding = function (element, valueAccessor, allBindingsAccessor, viewModel: appTypesUI.InventoryItemContainer, context: KnockoutBindingContext, slotType: string) {
	(<any>console).debug(slotType, ".init");
    
	var $element: JQuery = $(element).addClass("build-grid-square");
	var value: appTypesUI.InventoryItemContainer = ko.utils.unwrapObservable<appTypesUI.InventoryItemContainer>(valueAccessor());
	var $root: any = context.$root;
    
	ko.applyBindingsToNode(element, {
		"drag": value,
        "drop": context.$parent.ui.dropItem,
		"text": value.name,
		"css": {
			"build-grid-square-selected": value.hasDropItem,
			"item-in-hand": value.hasDropItemInHand
		}
	});

	// keep the tile draggable or not draggable depending on if there is something in it
	value.item.subscribe(function (newItemValue) {
		$element.draggable(
			(newItemValue) ?
			"enable" : "disable");
	});

	// this triggers the above function to disable the drag of slots without items at appstart time
	value.item.valueHasMutated();
};

ko.bindingHandlers["inventoryContainer"] = {
	"init": function (element, valueAccessor, allBindingsAccessor, viewModel: appTypesUI.InventoryItemContainer, context: KnockoutBindingContext) {
		genericContainerBinding(element, valueAccessor, allBindingsAccessor, viewModel, context, containerTypes.inventory);
	}
};

ko.bindingHandlers["buildSlotContainer"] = {
	"init": function (element, valueAccessor, allBindingsAccessor, viewModel: appTypesUI.InventoryItemContainer, context: KnockoutBindingContext) {
		genericContainerBinding(element, valueAccessor, allBindingsAccessor, viewModel, context, containerTypes.buildTable);
	}
}

