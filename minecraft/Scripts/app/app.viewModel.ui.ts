/// <reference path="../typings/console/console.d.ts" />

import appWorld = module("app.world");
import appTypes = module("app.types");
import appTypesUI = module("app.types.ui");



export module app.viewModel.ui {

	export var init = function (useDemoBuildTable: Boolean): void {
		console.log("app.viewModel.ui.init");

		// create all of the targets with the right x/y coordinates
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				buildTable.push(new appTypesUI.app.types.ui.BuildTableItemContainer(j, i));
			}
		}

		// FIXME: ok so we need actual build coordinates for the build table but not the inventory table.  We'll probably split InventoryItemContainer into 2 and maybe add the x/y coordinates onto the build table version
		for (var i = 0; i < 14; i++) {
			inventoryTable.push(new appTypesUI.app.types.ui.InventoryItemContainer());
		}
		
		if (useDemoBuildTable === true) {
			buildTable[0].item(new appTypes.app.types.InventoryItem(appWorld.app.world.allItems[appWorld.app.world.itemNames.stick], 1));
			buildTable[1].item(new appTypes.app.types.InventoryItem(appWorld.app.world.allItems[appWorld.app.world.itemNames.stick], 1));
			buildTable[3].item(new appTypes.app.types.InventoryItem(appWorld.app.world.allItems[appWorld.app.world.itemNames.ironIngot], 1));
		}

		inventoryTable[0].item(new appTypes.app.types.InventoryItem(appWorld.app.world.allItems[appWorld.app.world.itemNames.stick], 64))
		inventoryTable[1].item(new appTypes.app.types.InventoryItem(appWorld.app.world.allItems[appWorld.app.world.itemNames.stone], 32))
		inventoryTable[2].item(new appTypes.app.types.InventoryItem(appWorld.app.world.allItems[appWorld.app.world.itemNames.ironIngot], 5))
		inventoryTable[3].item(new appTypes.app.types.InventoryItem(appWorld.app.world.allItems[appWorld.app.world.itemNames.ironIngot], 5))
		inventoryTable[4].item(new appTypes.app.types.InventoryItem(appWorld.app.world.allItems[appWorld.app.world.itemNames.ironIngot], 5))
		//var addItemToInventory = function (itemName: string, qty: number) {
		//	inventory.push();
		//};


		//#region tableImage computed body
		currentBuildString = ko.computed(function () {

			var buildMatrix = [[], [], []];

			for (var i = 0; i < buildTable.length; i++) {
				var buildSlot: appTypesUI.app.types.ui.BuildTableItemContainer = buildTable[i];

				var itemInBuildSlot: appTypes.app.types.InventoryItem = buildSlot.item();

				var itemToPutInArray: string = (itemInBuildSlot === null) ? null : itemInBuildSlot.item.name;

				buildMatrix[buildSlot.y].push(itemToPutInArray);
			}

			return JSON.stringify(buildMatrix);
		});
		//#endregion

		//#region buildableResult body
		buildableResult = ko.computed(function () {

			// this is what we want to build
			return appWorld.app.world.allItemsViaBuildString[currentBuildString()];
		});
		//#endregion
	};

	/** event handler for dropping an item */
	export var dropItem: any = function (data: appTypes.dragConfiguration) {
		var where: appTypesUI.app.types.ui.InventoryItemContainer = data.where;
		var what: appTypes.app.types.InventoryItem = data.what;

		// Note: the order of these two operations will be important, not sure which should be first but its important 
		where.item(what);
		what.inHand(false);
	};

	/** this is the inventory table, one item per slot on the inventory */
	export var inventoryTable: appTypesUI.app.types.ui.InventoryItemContainer[] = [];

	/** the actual build table, one item per slot */
	export var buildTable: appTypesUI.app.types.ui.BuildTableItemContainer[] = [];

	/** the json string representation of whats on the build table */
	export var currentBuildString: KnockoutComputed = null;

	/** if the user has the table arranged in a way that will build something, it will be here */
	export var buildableResult: KnockoutComputed = null;
}