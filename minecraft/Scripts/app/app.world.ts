/// <reference path="../typings/console/console.d.ts" />

import appTypes = module("app.types");

export module app.world {

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
	export var allItems: { [itemName: string]: appTypes.app.types.Item; } = {};

	/** the same information as allItems, but in a way that we can access it via their build matrix */
	export var allItemsViaBuildString: { [buildMatrixAsJSON: string]: appTypes.app.types.Item; } = {};

	/** build all of the actual item definitions that exist in the world */
	var buildAllWorldItems = function () {
		console.log("app.world.buildAllWorldItems");

		// this is just a helper to cut down on repetitive code, given an item name and a build matrix, it will add a new Item with a proper dependency to the all items list
		var addItem = function (itemName: string, buildMatrix: string[][] = null) {

			var dependency: appTypes.app.types.Dependency = (buildMatrix === null) ? null : new appTypes.app.types.Dependency(buildMatrix);
			var newItem = new appTypes.app.types.Item(itemName, dependency);
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