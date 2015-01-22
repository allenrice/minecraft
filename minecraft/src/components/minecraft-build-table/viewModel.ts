import ko = require("knockout");

import World = require("./world");
import appTypes = require("./types");
import AppViewModelUI = require("./viewModel.ui");

class AppViewModel {

	private appWorld: World;
	public ui: AppViewModelUI;

	constructor (useDemoBuildTable: Boolean, world: World) {
		console.log("app.viewModel.init");

		this.appWorld = world;

		this.ui = new AppViewModelUI(useDemoBuildTable, world);

		//#region allItemsWithDependencies
		this.allItemsWithDependencies = ko.computed(() => {
			(<any>console).debug("computed: allItemsWithDependencies");

			var results: appTypes.Item[] = [];

			for (var itemName in this.appWorld.allItems) {

				// just a safety check
				if (!this.appWorld.allItems.hasOwnProperty(itemName)) { continue; }

				// get the actual item
				var item: appTypes.Item = this.appWorld.allItems[itemName];

				// make sure its an item that can be built
				if (item.dependencies === null) { continue; }

				results.push(item);
			}

			return results;
		});
		//#endregion

		//#region inventoryLookup computed body

		this.inventoryLookup = ko.computed(() => {
			console.debug("computed: inventoryLookup");

			var currentInventory: appTypes.InventoryItem[] = [];
			for (var i = 0; i < this.ui.inventoryTable.length; i++) {
				var item: appTypes.InventoryItem = this.ui.inventoryTable[i].item();
				if (item) {
					currentInventory.push(item);
				}
			}

			var inventoryLookupObject: { [itemName: string]: appTypes.InventoryItem; } = {};

			for (var i = 0; i < currentInventory.length; i++) {
				var currentInventoryItem = currentInventory[i];
				inventoryLookupObject[currentInventoryItem.item.name] = currentInventoryItem;
			}
			return inventoryLookupObject;
		});

		//#endregion

		//#region buildableItems computed body
		this.buildableItems = ko.computed(() => {
			(<any>console).debug("computed: buildableItems");

			var results: appTypes.Item[] = [];

			var itemsWithDependencies: appTypes.Item[] = this.allItemsWithDependencies();

			var inventoryLookupObject = this.inventoryLookup();

			for (var i = 0; i < itemsWithDependencies.length; i++) {
				var currentItem = itemsWithDependencies[i];

				if (this.canBuildItem(currentItem, inventoryLookupObject) === true) {
					results.push(currentItem);
				}
			}
			return results;
		});
		//#endregion 

	}

	// FIXME: This is a computed representation of all the items in app.world.allItems and it shouldnt be a computed and it shouldnt be on the viewmodel
	public allItemsWithDependencies: KnockoutComputed<appTypes.Item[]>;

	/** it is a list of everything we have the inventory to build (directly, not indirectly) */
	public buildableItems: KnockoutComputed<appTypes.Item[]>;

	/** allows us to have a dictionary of our inventory */
	public inventoryLookup: KnockoutComputed<{ [itemName: string]: appTypes.InventoryItem; }>;

	/** determines if we can build a specific item, given a dictionary of items in the dictionary */
	private canBuildItem = (item: appTypes.Item, currentInventory: { [itemName: string]: appTypes.InventoryItem; }) => {

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

//export var ui = appViewModelUI;
export = AppViewModel;