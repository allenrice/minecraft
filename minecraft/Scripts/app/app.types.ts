/// <reference path="../typings/console/console.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />

// TODO: move this to somewhere like app.d.ts maybe
interface dragConfiguration {
	what: any;
	where: any;
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
}
