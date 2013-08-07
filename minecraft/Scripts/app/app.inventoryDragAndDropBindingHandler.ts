/// <reference path="app.ts" />
// this has to affect the global interface of the same name so this has to be global, this adds the binding for the following module
interface KnockoutBindingHandlers {
	drag: any;
	drop: Object;
};

/** we need to store some stateful information that we'd like to wrap in a closurefor these binding handlers, so we'll use a module to accomplish this */
module dt.inventoryDragAndDropBindingHandler {

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