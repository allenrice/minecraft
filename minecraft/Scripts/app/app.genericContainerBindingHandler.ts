/// <reference path="app.ts" />

// this has to affect the global interface of the same name so this has to be global, this adds the binding for the following module
interface KnockoutBindingHandlers {
	inventoryContainer: any;
	buildSlotContainer: any;
};

module dt.genericContainerBindingHandler {

	/** where the actual custom bindings live, so we can call them with slightly different names and get somewhat of the same functionality */
	var genericContainerBinding = function (element, valueAccessor, allBindingsAccessor, viewModel: app.types.ui.InventoryItemContainer, context: KnockoutBindingContext, slotType: string) {

		console.debug(slotType, ".init");
		
		var $element: JQuery = $(element).addClass("build-grid-square");
		var $stackQtyDiv = $("<div></div>").text("12").addClass("build-grid-stack-qty");
		var $stackItemNameDiv = $("<div></div>").addClass("build-grid-item-name");
		var $subContainer = $("<div></div>").addClass("build-grid-inner-container");
		$subContainer.append($stackItemNameDiv).append($stackQtyDiv);
		$element.append($subContainer);
		
		var value: app.types.ui.InventoryItemContainer = ko.utils.unwrapObservable(valueAccessor());
		var $root: app.viewModel = context.$root;

		ko.applyBindingsToNode(element, {
			"drag": value,
			"drop": $root.ui.dropItem,
			"css": {
				"build-grid-square-selected": value.hasDropItem,
				"item-in-hand": value.hasDropItemInHand
			}
		}, viewModel);

		ko.applyBindingsToNode($stackItemNameDiv[0], {
			"text": value.name
		}, viewModel);
		
		ko.applyBindingsToNode($stackQtyDiv[0], {
			// TODO: This computed shouldn't really be generated here due to how often it will get created / deleted, maybe we can add it to the InventoryItemContainer
			"text": ko.computed(function () {
				var item: app.types.InventoryItem = value.item();
				return (item) ? item.qty().toString() : "";
			})
		}, viewModel);

		// keep the tile draggable or not draggable depending on if there is something in it
		value.item.subscribe(function (newItemValue) {
			$element.draggable(
				(newItemValue) ?
					"enable" : "disable");
		});

		// this triggers the above function to disable the drag of slots without items at appstart time
		value.item.valueHasMutated();
	};

	/** defines the possible types of containers for the generic containers binding */
	export var containerTypes = {
		buildTable: "buildSlotContainer",
		inventory: "inventoryContainer"
	};

	ko.bindingHandlers.inventoryContainer = {
		"init": function (element, valueAccessor, allBindingsAccessor, viewModel: app.types.ui.InventoryItemContainer, context: KnockoutBindingContext) {
			genericContainerBinding(element, valueAccessor, allBindingsAccessor, viewModel, context, containerTypes.inventory);
		}
	};

	ko.bindingHandlers.buildSlotContainer = {
		"init": function (element, valueAccessor, allBindingsAccessor, viewModel: app.types.ui.InventoryItemContainer, context: KnockoutBindingContext) {
			genericContainerBinding(element, valueAccessor, allBindingsAccessor, viewModel, context, containerTypes.buildTable);
		}
	}
}