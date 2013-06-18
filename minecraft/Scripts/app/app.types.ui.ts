/// <reference path="app.types.ts" />

module app.types.ui {

	/** The type that makes up a container that holds an inventory item,  this is used specifically in the UI because its the actual slot and is shared between inventory and build table */
	export class InventoryItemContainer {

		/** of type string */
		public name: KnockoutComputed = null;

		/** of type app.types.InventoryItem */
		public item: KnockoutObservableAny = ko.observable(null);

		/** of type boolean */
		public hasDropItem: KnockoutComputed = null;

		/** of type boolean */
		public hasDropItemInHand: KnockoutComputed = null;

		constructor() {

			// we use this so we'll have type checking in the computeds below
			var _this = this;
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

	export class BuildTableItemContainer extends InventoryItemContainer {

		public x: number = null;
		public y: number = null;

		constructor(x: number, y: number) {
			super();

			var _this = this;
			_this.x = x;
			_this.y = y;
		}
	}
}
