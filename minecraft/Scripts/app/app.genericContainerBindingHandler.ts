///// <reference path="app.ts" />
//// this has to affect the global interface of the same name so this has to be global, this adds the binding for the following module
//interface KnockoutBindingHandlers {
//	inventoryContainer: any;
//	buildSlotContainer: any;
//};

//module dt.genericContainerBindingHandler {

//	/** where the actual custom bindings live, so we can call them with slightly different names and get somewhat of the same functionality */
//	var genericContainerBinding = function (element, valueAccessor, allBindingsAccessor, viewModel: app.types.ui.InventoryItemContainer, context: KnockoutBindingContext, slotType: string) {

//		console.debug(slotType, ".init");

//		var $element: JQuery = $(element).addClass("build-grid-square");
//		var value: app.types.ui.InventoryItemContainer = ko.utils.unwrapObservable(valueAccessor());
//		var $root: app.viewModel = context.$root;

//		ko.applyBindingsToNode(element, {
//			"drag": value,
//			"drop": $root.ui.dropItem,
//			"text": value.name,
//			"css": {
//				"build-grid-square-selected": value.hasDropItem,
//				"item-in-hand": value.hasDropItemInHand
//			}
//		}, viewModel);

//		// keep the tile draggable or not draggable depending on if there is something in it
//		value.item.subscribe(function (newItemValue) {
//			$element.draggable(
//				(newItemValue) ?
//					"enable" : "disable");
//		});

//		// this triggers the above function to disable the drag of slots without items at appstart time
//		value.item.valueHasMutated();
//	};

//	/** defines the possible types of containers for the generic containers binding */
//	export var containerTypes = {
//		buildTable: "buildSlotContainer",
//		inventory: "inventoryContainer"
//	};

//	ko.bindingHandlers.inventoryContainer = {
//		"init": function (element, valueAccessor, allBindingsAccessor, viewModel: app.types.ui.InventoryItemContainer, context: KnockoutBindingContext) {
//			genericContainerBinding(element, valueAccessor, allBindingsAccessor, viewModel, context, containerTypes.inventory);
//		}
//	};

//	ko.bindingHandlers.buildSlotContainer = {
//		"init": function (element, valueAccessor, allBindingsAccessor, viewModel: app.types.ui.InventoryItemContainer, context: KnockoutBindingContext) {
//			genericContainerBinding(element, valueAccessor, allBindingsAccessor, viewModel, context, containerTypes.buildTable);
//		}
//	}
//}