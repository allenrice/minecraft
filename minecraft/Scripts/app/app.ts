/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/jqueryui/jqueryui.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />

interface Console {
	debug(message: any, ...optionalParams: any[]): void;
}

interface dragConfiguration {
	what: any;
	where: any;
}

//#region binding handlers 


// this has to affect the global interface of the same name so this has to be global, this adds the binding for the following module
interface KnockoutBindingHandlers {
	inventoryContainer: any;
	buildSlotContainer: any;
};

module genericContainerBinding {

	/** where the actual custom bindings live, so we can call them with slightly different names and get somewhat of the same functionality */
	var genericContainerBinding = function (element, valueAccessor, allBindingsAccessor, viewModel: app.types.ui.InventoryItemContainer, context: KnockoutBindingContext, slotType: string) {

		console.debug(slotType, ".init");

		var $element: JQuery = $(element).addClass("build-grid-square");
		var value: app.types.ui.InventoryItemContainer = ko.utils.unwrapObservable(valueAccessor());
		var $root: app.viewModel = context.$root;

		ko.applyBindingsToNode(element, {
			"drag": value,
			"drop": $root.ui.dropItem,
			"text": value.name,
			"css": {
				"build-grid-square-selected": value.hasDropItem,
				"item-in-hand": value.hasDropItemInHand
			}
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

// this has to affect the global interface of the same name so this has to be global, this adds the binding for the following module
interface KnockoutBindingHandlers {
	drag: any;
	drop: Object;
};

/** we need to store some stateful information that we'd like to wrap in a closurefor these binding handlers, so we'll use a module to accomplish this */
module inventoryDragAndDropBindingHandler {

	/** contains all the stateful information of the inventory drag and drop binding handler */
	module state {
		export var hitDropTarget: Boolean = false;
		export var draggedObject: app.types.InventoryItem = null
		export var draggedObjectFrom: app.types.ui.InventoryItemContainer = null
	}

	// here we're adding the custom binding handler because at this time, we have access to the state variable above
	ko.bindingHandlers.drag = {
		"init": function (element, valueAccessor, allBindingsAccessor, viewModel: app.viewModel, context: KnockoutBindingContext) {
			console.debug("drag.init");

			var draggedObjectContainer: app.types.ui.InventoryItemContainer = ko.utils.unwrapObservable(valueAccessor());
			var dragElement: JQuery = $(element);
			var dragOptions = {
				"helper": "clone",
				"revert": true,
				"revertDuration": 0,
				"start": function () {
					console.debug("drag starting");

					// keep track of the state for the drop / stop events
					state.hitDropTarget = false;
					state.draggedObject = draggedObjectContainer.item();
					state.draggedObjectFrom = draggedObjectContainer;
					state.draggedObject.inHand(true);
				},
				"stop": function () {
					console.debug("drag stopping");

					if (state.hitDropTarget === false) {
						// TODO: put this guy back where we got it 
						// Note: we're going to have to "pick this up" from
						// a source and have that source handy, to accomplish this
					}

					// Note: we dont have to set hitDropTarget to false since thats done on drag start
					state.draggedObject.inHand(false);

					// clear out the state since we're not maintaining it anymore
					state.draggedObject = null;
					state.draggedObjectFrom = null;
				},
				"cursor": 'move'
			};

			dragElement.draggable(dragOptions).disableSelection();
		}
	};

	ko.bindingHandlers.drop = {
		"init": function (element, valueAccessor, allBindingsAccessor, viewModel) {
			console.debug("drop.init");
			var dropElement: JQuery = $(element);
			var dropOptions: DroppableOptions = {
				"drop": function (e: JQueryEventObject, ui) {
					console.debug("drop fired");
					// indicate that we hit a drop target so the other drop doesnt think its a missed drop
					state.hitDropTarget = true;

					// call the callback in the valueAccessor with the what/where object
					valueAccessor()({
						"what": state.draggedObject,
						"where": ko.dataFor(this)
					});

					var draggedFrom: app.types.ui.InventoryItemContainer = state.draggedObjectFrom;

					draggedFrom.item(null);
				},
				"hoverClass": "build-grid-square-hover"
			};
			dropElement.droppable(dropOptions);
		}
	};
}
//#endregoin

module app {

	export var init = function (useDemoBuildTable: Boolean = true) {

		console.log("app.init");

		app.world.init();

		app.viewModel.init(useDemoBuildTable);

		ko.applyBindings(app.viewModel, $("#content")[0]);

	};
}



module app.types {

	/** represents a single item in the game, includes dependencies, names, etc */
	export class Item {

		public imageUrl: string;
		public name: string;
		public dependencies: Dependency;

		constructor(name: string, dependencies: Dependency) {
			this.imageUrl = "";
			this.name = name;
			this.dependencies = dependencies;
		}
	}

	/** represents what a given item depends on to be crafted.  no properties should be changed after creating an instance of this */
	export class Dependency {

		/** the actual build matrix to build this item */
		public buildMatrix: string[][] = null;

		/** list representation of the build matrix, has Item name and qty */
		public buildList: { [dependencyName: string]: number; } = {};

		/** json string representation of the build matrix */
		public buildString: string = null;

		/** after an instance is generated, make sure to not touch any properties */
		constructor(buildMatrix: string[][]) {

			// safety dance
			if (buildMatrix.length !== 3 || buildMatrix[0].length !== 3 || buildMatrix[1].length !== 3 || buildMatrix[2].length !== 3) {
				throw "invalid build matrix";
			}

			this.buildMatrix = buildMatrix;

			// generate a list representation of this matrix
			for (var i = 0; i < this.buildMatrix.length; i++) {
				for (var j = 0; j < this.buildMatrix[i].length; j++) {

					var thisItemName: string = this.buildMatrix[i][j];

					if (thisItemName === null || thisItemName === "") { continue; }

					// add / increment the count of this item in the list
					this.buildList[thisItemName] = (this.buildList[thisItemName] || 0) + 1;
				}
			}

			this.buildString = JSON.stringify(this.buildMatrix);
		}
	}

	/** represents an item in the inventory, in inventory it has qty and will probably have more later on */
	export class InventoryItem {

		public qty: KnockoutObservableNumber = ko.observable(0);
		public inHand: KnockoutObservableBool = ko.observable(false);
		public item: Item = null;

		constructor(item: Item, qty: number) {
			var _this = this;

			this.qty.subscribe(function (newQty: number) {
				console.debug(_this.item.name, "qty changed to", newQty);
			});

			this.item = item;
			this.qty(qty);


		}
	}

	export module ui {

		/** The type that makes up a container that holds an inventory item,  this is used specifically in the UI because its the actual slot and is shared between inventory and build table */
		export class InventoryItemContainer {

			public x: number = null;
			public y: number = null;

			/** of type string */
			public name: KnockoutComputed = null;

			/** of type app.types.InventoryItem */
			public item: KnockoutObservableAny = ko.observable(null);

			/** of type boolean */
			public hasDropItem: KnockoutComputed = null;

			/** of type boolean */
			public hasDropItemInHand: KnockoutComputed = null;

			constructor(x: number, y: number) {

				// we use this so we'll have type checking in the computeds below
				var _this = this;
				_this.x = x;
				_this.y = y;
				_this.name = ko.computed(function () {
					var observedItem: app.types.InventoryItem = _this.item();

					if (observedItem === null) {
						return "";
					}
					else {
						return observedItem.item.name;
					}
				});

				_this.hasDropItem = ko.computed(function () {
					return (_this.item() !== null);
				});

				_this.hasDropItemInHand = ko.computed(function () {
					var thisItem: app.types.InventoryItem = _this.item();
					return (thisItem === null) ? false : thisItem.inHand();
				});
			}
		}
	}
}

module app.world {

	/** all of the items in the world are listed here. this is used to access items within allitems */
	export var itemNames = {
		stone: "stone",
		ironIngot: "ironIngot",
		stick: "stick",
		ironShovel: "ironShovel",
		ironPickaxe: "ironPickaxe",
		ironAxe: "ironAxe",
		stoneShovel: "stoneShovel",
		stonePickaxe: "stonePickaxe",
		stoneAxe: "stoneAxe"
	};

	/** all the items in the world are stored / defined here, to look them up, see: itemNames */
	export var allItems: { [itemName: string]: app.types.Item; } = {};

	/** the same information as allItems, but in a way that we can access it via their build matrix */
	export var allItemsViaBuildString: { [buildMatrixAsJSON: string]: app.types.Item; } = {};

	/** build all of the actual item definitions that exist in the world */
	var buildAllWorldItems = function () {
		console.log("app.world.buildAllWorldItems");

		// this is just a helper to cut down on repetitive code, given an item name and a build matrix, it will add a new Item with a proper dependency to the all items list
		var addItem = function (itemName: string, buildMatrix: string[][] = null) {

			var dependency: app.types.Dependency = (buildMatrix === null) ? null : new app.types.Dependency(buildMatrix);
			var newItem = new app.types.Item(itemName, dependency);
			allItems[itemName] = newItem;

			if (dependency !== null) {
				allItemsViaBuildString[dependency.buildString] = newItem;
			}
		};

		//#region go through and add all of the complex types

		addItem(itemNames.stone);
		addItem(itemNames.ironIngot);
		addItem(itemNames.stick);

		addItem(itemNames.stoneShovel, [
			[null, itemNames.stone, null],
			[null, itemNames.stick, null],
			[null, itemNames.stick, null]
		]);

		addItem(itemNames.ironShovel, [
			[null, itemNames.ironIngot, null],
			[null, itemNames.stick, null],
			[null, itemNames.stick, null]
		]);

		addItem(itemNames.stonePickaxe, [
			[itemNames.stone, itemNames.stone, itemNames.stone],
			[null, itemNames.stick, null],
			[null, itemNames.stick, null]
		]);

		addItem(itemNames.ironPickaxe, [
			[itemNames.ironIngot, itemNames.ironIngot, itemNames.ironIngot],
			[null, itemNames.stick, null],
			[null, itemNames.stick, null]
		]);

		addItem = null;

		//#endregion
	};

	/** init the minecraft world */
	export var init = function () {
		console.log("app.world.init");

		buildAllWorldItems();


	}





}

module app.viewModel {

	export module ui {

		export var init = function (useDemoBuildTable: Boolean): void {
			console.log("app.viewModel.ui.init");

			// create all of the targets with the right x/y coordinates
			for (var i = 0; i < 3; i++) {
				for (var j = 0; j < 3; j++) {
					buildTable.push(new app.types.ui.InventoryItemContainer(j, i));
				}
			}

			// FIXME: ok so we need actual build coordinates for the build table but not the inventory table.  We'll probably split InventoryItemContainer into 2 and maybe add the x/y coordinates onto the build table version
			for (var i = 0; i < 7; i++) {
				for (var j = 0; j < 2; j++) {
					inventoryTable.push(new app.types.ui.InventoryItemContainer(j, i));
				}
			}

			if (useDemoBuildTable === true) {
				buildTable[0].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stick], 1));
				buildTable[1].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stick], 1));
				buildTable[3].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.ironIngot], 1));
			}

			inventoryTable[0].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stick], 64))
			inventoryTable[1].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stone], 32))
			inventoryTable[2].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.ironIngot], 5))
			inventoryTable[3].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.ironIngot], 5))
			inventoryTable[4].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.ironIngot], 5))
			//var addItemToInventory = function (itemName: string, qty: number) {
			//	inventory.push();
			//};


			//#region tableImage computed body
			currentBuildString = ko.computed(function () {

				var buildMatrix = [[], [], []];

				for (var i = 0; i < buildTable.length; i++) {
					var buildSlot: app.types.ui.InventoryItemContainer = buildTable[i];

					var itemInBuildSlot: app.types.InventoryItem = buildSlot.item();

					var itemToPutInArray: string = (itemInBuildSlot === null) ? null : itemInBuildSlot.item.name;

					buildMatrix[buildSlot.y].push(itemToPutInArray);
				}

				return JSON.stringify(buildMatrix);
			});
			//#endregion

			//#region buildableResult body
			buildableResult = ko.computed(function () {

				// this is what we want to build
				return app.world.allItemsViaBuildString[currentBuildString()];
			});
			//#endregion
		};

		/** event handler for dropping an item */
		export var dropItem: any = function (data: dragConfiguration) {
			var where: app.types.ui.InventoryItemContainer = data.where;
			var what: app.types.InventoryItem = data.what;

			// Note: the order of these two operations will be important, not sure which should be first but its important 
			where.item(what);
			what.inHand(false);
		};

		/** this is the inventory table, one item per slot on the inventory */
		export var inventoryTable: app.types.ui.InventoryItemContainer[] = [];

		/** the actual build table, one item per slot */
		export var buildTable: app.types.ui.InventoryItemContainer[] = [];

		/** the json string representation of whats on the build table */
		export var currentBuildString: KnockoutComputed = null;

		/** if the user has the table arranged in a way that will build something, it will be here */
		export var buildableResult: KnockoutComputed = null;
	}



	export var init = function (useDemoBuildTable: Boolean): void {
		console.log("app.viewModel.init");

		app.viewModel.ui.init(useDemoBuildTable);



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

			var inventoryLookupObject: { [itemName: string]: app.types.InventoryItem; } = inventoryLookup();

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
	export var allItemsWithDependencies: KnockoutComputed;

	/** type: app.types.Item[], it is a list of everything we have the inventory to build (directly, not indirectly) */
	export var buildableItems: KnockoutComputed;
	
	/** type: { [itemName: string]: app.types.InventoryItem; }, it allows us to have a dictionary of our inventory */
	export var inventoryLookup: KnockoutComputed;

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


