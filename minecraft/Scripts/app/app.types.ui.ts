/// <reference path="../typings/console/console.d.ts" />
/// <reference path="../typings/knockout/knockout.d.ts" />


import appTypes = module("app.types");
            

/** contains all types specifically related to something that is a UI element, like a container in the inventory table or build table */
export module app.types.ui {

	/** The type that makes up a container that holds an inventory item,  this is used specifically in the UI because its the actual slot and is shared between inventory and build table */
	export class InventoryItemContainer {

		/** of type string, gives u a convenient way to bind to item.name() */
		public name: KnockoutComputed = null;

		/** of type app.types.InventoryItem */
		public item: KnockoutObservableAny = ko.observable(null);

		/** of type boolean, gives u a convenient way to bind to item() !== null */
		public hasDropItem: KnockoutComputed = null;

		/** of type boolean, gives u a convenient way to bind to item.inHand() */
		public hasDropItemInHand: KnockoutComputed = null;

		constructor() {

			// we use this so we'll have type checking in the computeds below
			var _this = this;

			_this.name = ko.computed(function () {
				var observedItem: appTypes.app.types.InventoryItem = _this.item();
				return (observedItem === null) ? "" : observedItem.item.name;
			});

			_this.hasDropItem = ko.computed(function () {
				return (_this.item() !== null);
			});

			_this.hasDropItemInHand = ko.computed(function () {
				var thisItem: appTypes.app.types.InventoryItem = _this.item();
				return (thisItem === null) ? false : thisItem.inHand();
			});
		}
	}

	/** BuildTableItemsContainers are just like InventoryItemContainers except that they are placed in a specific arrangement and have x/y coordinates so that items in them can be placed in a specific way to build other items */
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
