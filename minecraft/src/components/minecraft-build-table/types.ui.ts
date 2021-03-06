
/** contains all types specifically related to something that is a UI element, like a container in the inventory table or build table */
import ko = require("knockout");
import appTypes = require("./types");


/** The type that makes up a container that holds an inventory item,  this is used specifically in the UI because its the actual slot and is shared between inventory and build table */
export class InventoryItemContainer {

	/** of type string, gives u a convenient way to bind to item.name() */
	public name: KnockoutComputed<string> = null;

	/** of type app.types.InventoryItem */
	public item: KnockoutObservable<appTypes.InventoryItem> = null;

	/** of type boolean, gives u a convenient way to bind to item() !== null */
	public hasDropItem: KnockoutComputed<boolean> = null;

	/** of type boolean, gives u a convenient way to bind to item.inHand() */
	public hasDropItemInHand: KnockoutComputed<boolean> = null;

	constructor() {
		

		//require(['ko'], (ko: KnockoutStatic) => {

			this.item = ko.observable(null);

			this.name = ko.computed(() => {
				var observedItem: appTypes.InventoryItem = this.item();
				return (observedItem === null) ? "" : observedItem.item.name;
			});

			this.hasDropItem = ko.computed(() => {
				return (this.item() !== null);
			});

			this.hasDropItemInHand = ko.computed(() => {
				var thisItem: appTypes.InventoryItem = this.item();
				return (thisItem === null) ? false : thisItem.inHand();
			});
		//});
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
