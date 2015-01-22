import ko = require("knockout");
import appTypes = require("./types");

class World {
	
	/** all of the items in the world are listed here. this is used to access items within allitems */
	public static itemNames = {
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
	public allItems: { [itemName: string]: appTypes.Item; } = {};

	/** the same information as allItems, but in a way that we can access it via their build matrix */
	public allItemsViaBuildString: { [buildMatrixAsJSON: string]: appTypes.Item; } = {};

	/** build all of the actual item definitions that exist in the world */
	private buildAllWorldItems = () => {

		console.log("buildAllWorldItems");

		// this is just a helper to cut down on repetitive code, given an item name and a build matrix, it will add a new Item with a proper dependency to the all items list
		var addItem = (itemName: string, buildMatrix: string[][]= null) => {

			var dependency: appTypes.Dependency = (buildMatrix === null) ? null : new appTypes.Dependency(buildMatrix);
			var newItem = new appTypes.Item(itemName, dependency);
			this.allItems[itemName] = newItem;

			if (dependency !== null) {
				this.allItemsViaBuildString[dependency.buildString] = newItem;
			}
		};

		//#region go through and add all of the complex types

		var i = World.itemNames;

		addItem(i.stone);
		addItem(i.ironIngot);
		addItem(i.stick);

		addItem(i.stoneShovel, [
			[null, i.stone, null],
			[null, i.stick, null],
			[null, i.stick, null]
		]);

		addItem(i.ironShovel, [
			[null, i.ironIngot, null],
			[null, i.stick, null],
			[null, i.stick, null]
		]);

		addItem(i.stonePickaxe, [
			[i.stone, i.stone, i.stone],
			[null, i.stick, null],
			[null, i.stick, null]
		]);

		addItem(i.ironPickaxe, [
			[i.ironIngot, i.ironIngot, i.ironIngot],
			[null, i.stick, null],
			[null, i.stick, null]
		]);

		addItem = null;

		//#endregion
	};

	/** init the minecraft world */
	constructor() {
		console.log("ctor");

		this.buildAllWorldItems();
	}
}

export = World;