/// <reference path="../typings/knockout/knockout.d.ts" />
/// <reference path="../typings/console/console.d.ts" />
/// <reference path="app.viewModel.ui.ts" />
/// <reference path="app.world.ts" />



module app.viewModel {

	export var init = function (useDemoBuildTable: Boolean): void {
		console.log("app.viewModel.init");

		app.viewModel.ui.init(useDemoBuildTable);

		//#region allItemsWithDependencies
		allItemsWithDependencies = ko.computed(function () {
			console.debug("computed: allItemsWithDependencies");

			var results: app.types.Item[] = [];

			for (var itemName in app.world.allItems) {

				// just a safety check
				if (!app.world.allItems.hasOwnProperty(itemName)) { continue; }

				// get the actual item
				var item: app.types.Item = app.world.allItems[itemName];

				// make sure its an item that can be built
				if (item.dependencies === null) { continue; }

				results.push(item);
			}

			return results;
		});
		//#endregion

		//#region inventoryLookup computed body

		inventoryLookup = ko.computed(function () {
			console.log("computed: inventoryLookup");

			var currentInventory: app.types.InventoryItem[] = [];
			for (var i = 0; i < ui.inventoryTable.length; i++) {
				var item: app.types.InventoryItem = ui.inventoryTable[i].item();
				if (item) {
					currentInventory.push(item);
				}
			}

			var inventoryLookupObject: { [itemName: string]: app.types.InventoryItem; } = {};

			for (var i = 0; i < currentInventory.length; i++) {
				var currentInventoryItem = currentInventory[i];
				inventoryLookupObject[currentInventoryItem.item.name] = currentInventoryItem;
			}
			return inventoryLookupObject;
		});
		
		//#endregion

		//#region buildableItems computed body
		buildableItems = ko.computed(function () {
			console.log("computed: buildableItems");

			var results: app.types.Item[] = [];

			var itemsWithDependencies: app.types.Item[] = allItemsWithDependencies();

			var inventoryLookupObject = inventoryLookup();

			for (var i = 0; i < itemsWithDependencies.length; i++) {
				var currentItem = itemsWithDependencies[i];

				if (canBuildItem(currentItem, inventoryLookupObject) === true) {
					results.push(currentItem);
				}
			}
			return results;
		});
		//#endregion 

	};

	// FIXME: This is a computed representation of all the items in app.world.allItems and it shouldnt be a computed and it shouldnt be on the viewmodel
	export var allItemsWithDependencies: KnockoutComputed<app.types.Item[]>;

	/** it is a list of everything we have the inventory to build (directly, not indirectly) */
	export var buildableItems: KnockoutComputed<app.types.Item[]>;

	/** allows us to have a dictionary of our inventory */
	export var inventoryLookup: KnockoutComputed<{ [itemName: string]: app.types.InventoryItem; }>;

	inventoryLookup.subscribe(function (newValue) {
	
	});

	/** determines if we can build a specific item, given a dictionary of items in the dictionary */
	var canBuildItem = function (item: app.types.Item, currentInventory: { [itemName: string]: app.types.InventoryItem; }) {

		// we cant build an item without dependencies
		if (item.dependencies === null) { throw "items without dependencies (" + item.name + ") should not be built"; }

		// TODO: see if there are any other preemptive checks that we can perform to return early

		// get the list of items and their quantities that we will need in order to build this item
		var buildListForItem: { [dependencyName: string]: number; } = item.dependencies.buildList;

		// go through each item in that list of things we need to build
		for (var requiredItemName in buildListForItem) {

			// safety check
			if (!buildListForItem.hasOwnProperty(requiredItemName)) { continue; }

			var requiredQtyToBuildItem: number = buildListForItem[requiredItemName];

			// if we don't even have a record of that item in our inventory then we cant build it
			if (typeof currentInventory[requiredItemName] === "undefined") {
				return false;
			}

			if (currentInventory[requiredItemName].qty() < requiredQtyToBuildItem) {
				return false;
			}
		}

		return true;
	}

}

