ko.bindingHandlers.drag = {
    "update": function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var newValue = ko.utils.unwrapObservable(valueAccessor());
        var $element = $(element);
        var elementIsDraggable = (typeof $(element).data("ui-draggable") !== "undefined");
        if(newValue === null && elementIsDraggable === true) {
            // if we dont have a value and our element is draggable, then we just removed an item and we need to disable the draggable aspect of this dom node
            $element.draggable("disable");
        } else if(newValue !== null && elementIsDraggable === true) {
            // if we have a value and the element is draggable, then we need enable it rather than create it
            $element.draggable("enable");
        } else if(newValue !== null && elementIsDraggable === false) {
            // if we have a value and its not draggable, then someone dropped an item on this dom element for the first time, so create the draggable
            console.log("creating draggable node");
            var draggedObject = ko.utils.unwrapObservable(valueAccessor());
            var dragElement = $(element);
            var dragOptions = {
                "helper": "clone",
                "revert": true,
                "revertDuration": 0,
                "start": function () {
                    //var draggedFrom: app.types.ui.BuildTableDropTarget = ko.dataFor(element);
                    //debugger;
                    // dragged from should be a drop target w/ an x and a y
                    ko.bindingHandlers.drag.state.hitDropTarget = false;
                    ko.bindingHandlers.drag.state.draggedObject = draggedObject;
                    ko.bindingHandlers.drag.state.draggedObjectFrom = ko.dataFor(element);
                    ko.bindingHandlers.drag.state.draggedObject.inHand(true);
                    //draggedObject = null;
                                    },
                "stop": function () {
                    if(ko.bindingHandlers.drag.state.hitDropTarget === false) {
                        // TODO: put this guy back where we got it
                        // Note: we're going to have to "pick this up" from
                        // a source and have that source handy, to accomplish this
                                            }
                    ko.bindingHandlers.drag.state.draggedObject.inHand(false);
                    // clear out the state since we're not maintaining it anymore
                    ko.bindingHandlers.drag.state.draggedObject = ko.bindingHandlers.drag.state.hitDropTarget = ko.bindingHandlers.drag.state.draggedObjectFrom = null;
                    //draggedObject = null;
                                    },
                "cursor": 'move'
            };
            dragElement.draggable(dragOptions).disableSelection();
        }
    },
    "state": {
        "hitDropTarget": null,
        "draggedObject": null
    }
};
ko.bindingHandlers.drop = {
    "init": function (element, valueAccessor, allBindingsAccessor, viewModel) {
        var dropElement = $(element);
        var dropOptions = {
            "drop": function (e, ui) {
                // indicate that we hit a drop target so the other drop doesnt think its a missed drop
                ko.bindingHandlers.drag.state.hitDropTarget = true;
                // call the callback in the valueAccessor with the what/where object
                valueAccessor()({
                    "what": ko.bindingHandlers.drag.state.draggedObject,
                    "where": ko.dataFor(this)
                });
                var draggedFrom = ko.bindingHandlers.drag.state.draggedObjectFrom;
                draggedFrom.item(null);
            },
            "hoverClass": "build-grid-square-hover"
        };
        dropElement.droppable(dropOptions);
    }
};
//#endregoin
var app;
(function (app) {
    app.init = function () {
        console.log("app.init");
        app.world.init();
        app.viewModel.init();
        ko.applyBindings(app.viewModel, $("#content")[0]);
    };
})(app || (app = {}));
var app;
(function (app) {
    (function (types) {
        /** represents a single item in the game, includes dependencies, names, etc */
        var Item = (function () {
            function Item(name, dependencies) {
                this.imageUrl = "";
                this.name = name;
                this.dependencies = dependencies;
            }
            return Item;
        })();
        types.Item = Item;        
        /** represents what a given item depends on to be crafted.  no properties should be changed after creating an instance of this */
        var Dependency = (function () {
            /** after an instance is generated, make sure to not touch any properties */
            function Dependency(buildMatrix) {
                /** the actual build matrix to build this item */
                this.buildMatrix = null;
                /** list representation of the build matrix, has Item name and qty */
                this.buildList = {
                };
                /** json string representation of the build matrix */
                this.buildString = null;
                // safety dance
                if(buildMatrix.length !== 3 || buildMatrix[0].length !== 3 || buildMatrix[1].length !== 3 || buildMatrix[2].length !== 3) {
                    throw "invalid build matrix";
                }
                this.buildMatrix = buildMatrix;
                // generate a list representation of this matrix
                for(var i = 0; i < this.buildMatrix.length; i++) {
                    for(var j = 0; j < this.buildMatrix[i].length; j++) {
                        var thisItemName = this.buildMatrix[i][j];
                        if(thisItemName === null || thisItemName === "") {
                            continue;
                        }
                        // add / increment the count of this item in the list
                        this.buildList[thisItemName] = (this.buildList[thisItemName] || 0) + 1;
                    }
                }
                this.buildString = JSON.stringify(this.buildMatrix);
            }
            return Dependency;
        })();
        types.Dependency = Dependency;        
        /** represents an item in the inventory, in inventory it has qty and will probably have more later on */
        var InventoryItem = (function () {
            function InventoryItem(item, qty) {
                this.qty = ko.observable(0);
                this.inHand = ko.observable(false);
                this.item = null;
                var _this = this;
                this.qty.subscribe(function (newQty) {
                    console.log(_this.item.name, "qty changed to", newQty);
                });
                this.item = item;
                this.qty(qty);
            }
            return InventoryItem;
        })();
        types.InventoryItem = InventoryItem;        
        (function (ui) {
            /** we use instances of these to loop over the drop target area */
            var BuildTableDropTarget = (function () {
                function BuildTableDropTarget(x, y) {
                    this.x = null;
                    this.y = null;
                    this.name = null;
                    this.item = ko.observable(null);
                    this.hasDropItem = null;
                    this.hasDropItemInHand = null;
                    var _this = this;
                    _this.x = x;
                    _this.y = y;
                    _this.name = ko.computed(function () {
                        var observedItem = _this.item();
                        if(observedItem === null) {
                            return "";
                        } else {
                            return observedItem.item.name;
                        }
                    }, _this);
                    _this.hasDropItem = ko.computed(function () {
                        return (_this.item() !== null);
                    }, _this);
                    _this.hasDropItemInHand = ko.computed(function () {
                        var thisItem = _this.item();
                        return (thisItem === null) ? false : thisItem.inHand();
                    }, _this);
                }
                return BuildTableDropTarget;
            })();
            ui.BuildTableDropTarget = BuildTableDropTarget;            
        })(types.ui || (types.ui = {}));
        var ui = types.ui;
    })(app.types || (app.types = {}));
    var types = app.types;
})(app || (app = {}));
var app;
(function (app) {
    (function (world) {
        /** all of the items in the world are listed here. this is used to access items within allitems */
        world.itemNames = {
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
        world.allItems = {
        };
        /** the same information as allItems, but in a way that we can access it via their build matrix */
        world.allItemsViaBuildString = {
        };
        /** build all of the actual item definitions that exist in the world */
        var buildAllWorldItems = function () {
            console.log("app.world.buildAllWorldItems");
            // this is just a helper to cut down on repetitive code, given an item name and a build matrix, it will add a new Item with a proper dependency to the all items list
            var addItem = function (itemName, buildMatrix) {
                if (typeof buildMatrix === "undefined") { buildMatrix = null; }
                var dependency = (buildMatrix === null) ? null : new app.types.Dependency(buildMatrix);
                var newItem = new app.types.Item(itemName, dependency);
                world.allItems[itemName] = newItem;
                if(dependency !== null) {
                    world.allItemsViaBuildString[dependency.buildString] = newItem;
                }
            };
            //#region go through and add all of the complex types
            addItem(world.itemNames.stone);
            addItem(world.itemNames.ironIngot);
            addItem(world.itemNames.stick);
            addItem(world.itemNames.stoneShovel, [
                [
                    null, 
                    world.itemNames.stone, 
                    null
                ], 
                [
                    null, 
                    world.itemNames.stick, 
                    null
                ], 
                [
                    null, 
                    world.itemNames.stick, 
                    null
                ]
            ]);
            addItem(world.itemNames.ironShovel, [
                [
                    null, 
                    world.itemNames.ironIngot, 
                    null
                ], 
                [
                    null, 
                    world.itemNames.stick, 
                    null
                ], 
                [
                    null, 
                    world.itemNames.stick, 
                    null
                ]
            ]);
            addItem(world.itemNames.stonePickaxe, [
                [
                    world.itemNames.stone, 
                    world.itemNames.stone, 
                    world.itemNames.stone
                ], 
                [
                    null, 
                    world.itemNames.stick, 
                    null
                ], 
                [
                    null, 
                    world.itemNames.stick, 
                    null
                ]
            ]);
            addItem(world.itemNames.ironPickaxe, [
                [
                    world.itemNames.ironIngot, 
                    world.itemNames.ironIngot, 
                    world.itemNames.ironIngot
                ], 
                [
                    null, 
                    world.itemNames.stick, 
                    null
                ], 
                [
                    null, 
                    world.itemNames.stick, 
                    null
                ]
            ]);
            addItem = null;
            //#endregion
                    };
        /** init the minecraft world */
        world.init = function () {
            console.log("app.world.init");
            buildAllWorldItems();
        };
    })(app.world || (app.world = {}));
    var world = app.world;
})(app || (app = {}));
var app;
(function (app) {
    (function (viewModel) {
        (function (ui) {
            ui.init = function () {
                console.log("app.viewModel.ui.init");
                // create all of the targets with the right x/y coordinates
                for(var i = 0; i < 3; i++) {
                    for(var j = 0; j < 3; j++) {
                        ui.buildTable.push(new app.types.ui.BuildTableDropTarget(j, i));
                    }
                }
                ui.buildTable[0].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stick], 1));
                ui.buildTable[1].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stick], 1));
                ui.buildTable[3].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.ironIngot], 1));
                //#region tableImage computed body
                ui.currentBuildString = ko.computed(function () {
                    var buildMatrix = [
                        [], 
                        [], 
                        []
                    ];
                    for(var i = 0; i < ui.buildTable.length; i++) {
                        var buildSlot = ui.buildTable[i];
                        var itemInBuildSlot = buildSlot.item();
                        var itemToPutInArray = (itemInBuildSlot === null) ? null : itemInBuildSlot.item.name;
                        buildMatrix[buildSlot.y].push(itemToPutInArray);
                    }
                    return JSON.stringify(buildMatrix);
                });
                //#endregion
                //#region buildableResult body
                ui.buildableResult = ko.computed(function () {
                    // this is what we want to build
                    return app.world.allItemsViaBuildString[ui.currentBuildString()];
                });
                //#endregion
                            };
            /** event handler for dropping an item */
            ui.dropItem = function (data) {
                var where = data.where;
                var what = data.what;
                // Note: the order of these two operations will be important, not sure which should be first but its important
                where.item(what);
                what.inHand(false);
            };
            /** the list of build targets */
            ui.buildTable = [];
            /** the json string representation of whats on the build table */
            ui.currentBuildString = null;
            /** if the user has the table arranged in a way that will build something, it will be here */
            ui.buildableResult = null;
        })(viewModel.ui || (viewModel.ui = {}));
        var ui = viewModel.ui;
        viewModel.init = function () {
            console.log("app.viewModel.init");
            app.viewModel.ui.init();
            addItemToInventory(app.world.itemNames.stone, 1);
            addItemToInventory(app.world.itemNames.ironIngot, 1);
            addItemToInventory(app.world.itemNames.stick, 2);
            viewModel.allItemsWithDependencies = ko.computed(function () {
                console.log("computed: allItemsWithDependencies");
                var results = [];
                for(var itemName in app.world.allItems) {
                    // just a safety check
                    if(!app.world.allItems.hasOwnProperty(itemName)) {
                        continue;
                    }
                    // get the actual item
                    var item = app.world.allItems[itemName];
                    // make sure its an item that can be built
                    if(item.dependencies === null) {
                        continue;
                    }
                    results.push(item);
                }
                return results;
            });
            //#region inventoryLookup computed body
            viewModel.inventoryLookup = ko.computed(function () {
                console.log("computed: inventoryLookup");
                var currentInventory = viewModel.inventory();
                var inventoryLookupObject = {
                };
                for(var i = 0; i < currentInventory.length; i++) {
                    var currentInventoryItem = currentInventory[i];
                    inventoryLookupObject[currentInventoryItem.item.name] = currentInventoryItem;
                }
                return inventoryLookupObject;
            });
            //#endregion
            //#region buildableItems computed body
            viewModel.buildableItems = ko.computed(function () {
                console.log("computed: buildableItems");
                var results = [];
                var itemsWithDependencies = viewModel.allItemsWithDependencies();
                var inventoryLookupObject = viewModel.inventoryLookup();
                for(var i = 0; i < itemsWithDependencies.length; i++) {
                    var currentItem = itemsWithDependencies[i];
                    if(canBuildItem(currentItem, inventoryLookupObject) === true) {
                        results.push(currentItem);
                    }
                }
                return results;
            });
            //#endregion
                    };
        viewModel.inventory = ko.observableArray([]);
        viewModel.inventoryLookup;
        // FIXME: This is a computed representation of all the items in app.world.allItems and it shouldnt be a computed and it shouldnt be on the viewmodel
        viewModel.allItemsWithDependencies;
        viewModel.buildableItems;
        var addItemToInventory = function (itemName, qty) {
            viewModel.inventory.push(new app.types.InventoryItem(app.world.allItems[itemName], qty));
        };
        var canBuildItem = function (item, currentInventory) {
            // we cant build an item without dependencies
            if(item.dependencies === null) {
                throw "items without dependencies (" + item.name + ") should not be built";
            }
            // TODO: see if there are any other preemptive checks that we can perform to return early
            // get the list of items and their quantities that we will need in order to build this item
            var buildListForItem = item.dependencies.buildList;
            // go through each item in that list of things we need to build
            for(var requiredItemName in buildListForItem) {
                // safety check
                if(!buildListForItem.hasOwnProperty(requiredItemName)) {
                    continue;
                }
                var requiredQtyToBuildItem = buildListForItem[requiredItemName];
                // if we don't even have a record of that item in our inventory then we cant build it
                if(typeof currentInventory[requiredItemName] === "undefined") {
                    return false;
                }
                if(currentInventory[requiredItemName].qty() < requiredQtyToBuildItem) {
                    return false;
                }
            }
            return true;
        };
    })(app.viewModel || (app.viewModel = {}));
    var viewModel = app.viewModel;
})(app || (app = {}));
$(function () {
    app.init();
});
//@ sourceMappingURL=app - Copy.js.map
