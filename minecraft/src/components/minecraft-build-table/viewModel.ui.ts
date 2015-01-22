import ko = require("knockout");

import AppWorld = require("./world");
import appTypes = require("./types");
import appTypesUI = require("./types.ui");


class AppViewModelUI { 

	constructor (useDemoBuildTable: Boolean, appWorld: AppWorld) {

		console.log("app.viewModel.ui.init");

		// init all the drop targets for the build table, 
		for (var i = 0; i < 3; i++) {
			// this table needs to be a specific dimension and have specific x/y coordinates so a matrix was chosen
			for (var j = 0; j < 3; j++) {
			
				this.buildTable.push(new appTypesUI.BuildTableItemContainer(j, i));
			}
		}

		// do the same thing but for our inventoryTable
		for (var i = 0; i < 14; i++) {
			this.inventoryTable.push(new appTypesUI.InventoryItemContainer());
		}

		//#region test data
		if (useDemoBuildTable === true) {
		
			this.buildTable[0].item(new appTypes.InventoryItem(appWorld.allItems[AppWorld.itemNames.stick], 1));
			this.buildTable[1].item(new appTypes.InventoryItem(appWorld.allItems[AppWorld.itemNames.stick], 1));
			this.buildTable[3].item(new appTypes.InventoryItem(appWorld.allItems[AppWorld.itemNames.ironIngot], 1));

			this.inventoryTable[0].item(new appTypes.InventoryItem(appWorld.allItems[AppWorld.itemNames.stick], 64))
			this.inventoryTable[1].item(new appTypes.InventoryItem(appWorld.allItems[AppWorld.itemNames.stone], 32))
			this.inventoryTable[2].item(new appTypes.InventoryItem(appWorld.allItems[AppWorld.itemNames.ironIngot], 5))
			this.inventoryTable[3].item(new appTypes.InventoryItem(appWorld.allItems[AppWorld.itemNames.ironIngot], 5))
			this.inventoryTable[4].item(new appTypes.InventoryItem(appWorld.allItems[AppWorld.itemNames.ironIngot], 5))
		}
		//#endregion

		//#region tableImage computed body
		this.currentBuildString = ko.computed(() => {

			var buildMatrix = [[], [], []];

			for (var i = 0; i < this.buildTable.length; i++) {
				var buildSlot: appTypesUI.BuildTableItemContainer = this.buildTable[i];

				var itemInBuildSlot: appTypes.InventoryItem = buildSlot.item();

				var itemToPutInArray: string = (itemInBuildSlot === null) ? null : itemInBuildSlot.item.name;

				buildMatrix[buildSlot.y].push(itemToPutInArray);
			}

			return JSON.stringify(buildMatrix);
		});
		//#endregion

		//#region buildableResult body
		this.buildableResult = ko.computed(() => {
			// this is what we want to build
			return appWorld.allItemsViaBuildString[this.currentBuildString()];
		});
		//#endregion
	}

	/** event handler for dropping an item */
	public dropItem: any = (data: appTypes.dragConfiguration) => {

		var where: appTypesUI.InventoryItemContainer = data.where;
		var what: appTypes.InventoryItem = data.what;

		// Note: the order of these two operations will be important, not sure which should be first but its important 
		where.item(what);
		what.inHand(false);
	};

	/** this is the inventory table, one item per slot on the inventory */
	public inventoryTable: appTypesUI.InventoryItemContainer[] = [];

	/** the actual build table, one item per slot */
	public buildTable: appTypesUI.BuildTableItemContainer[] = [];

	/** the json string representation of whats on the build table */
	public currentBuildString: KnockoutComputed<string> = null;

	/** if the user has the table arranged in a way that will build something, it will be here */
	public buildableResult: KnockoutComputed<appTypes.Item> = null;

}
export = AppViewModelUI;