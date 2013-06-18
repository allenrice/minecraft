;
var genericContainerBinding;
(function (genericContainerBinding) {
    var genericContainerBinding = function (element, valueAccessor, allBindingsAccessor, viewModel, context, slotType) {
        console.debug(slotType, ".init");
        var $element = $(element).addClass("build-grid-square");
        var value = ko.utils.unwrapObservable(valueAccessor());
        var $root = context.$root;
        ko.applyBindingsToNode(element, {
            "drag": value,
            "drop": $root.ui.dropItem,
            "text": value.name,
            "css": {
                "build-grid-square-selected": value.hasDropItem,
                "item-in-hand": value.hasDropItemInHand
            }
        }, viewModel);
        value.item.subscribe(function (newItemValue) {
            $element.draggable((newItemValue) ? "enable" : "disable");
        });
        value.item.valueHasMutated();
    };
    genericContainerBinding.containerTypes = {
        buildTable: "buildSlotContainer",
        inventory: "inventoryContainer"
    };
    ko.bindingHandlers.inventoryContainer = {
        "init": function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
            genericContainerBinding(element, valueAccessor, allBindingsAccessor, viewModel, context, genericContainerBinding.containerTypes.inventory);
        }
    };
    ko.bindingHandlers.buildSlotContainer = {
        "init": function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
            genericContainerBinding(element, valueAccessor, allBindingsAccessor, viewModel, context, genericContainerBinding.containerTypes.buildTable);
        }
    };
})(genericContainerBinding || (genericContainerBinding = {}));
;
var inventoryDragAndDropBindingHandler;
(function (inventoryDragAndDropBindingHandler) {
    var state;
    (function (state) {
        state.hitDropTarget = false;
        state.draggedObject = null;
        state.draggedObjectFrom = null;
    })(state || (state = {}));
    ko.bindingHandlers.drag = {
        "init": function (element, valueAccessor, allBindingsAccessor, viewModel, context) {
            console.debug("drag.init");
            var draggedObjectContainer = ko.utils.unwrapObservable(valueAccessor());
            var dragElement = $(element);
            var dragOptions = {
                "helper": "clone",
                "revert": true,
                "revertDuration": 0,
                "start": function () {
                    console.debug("drag starting");
                    state.hitDropTarget = false;
                    state.draggedObject = draggedObjectContainer.item();
                    state.draggedObjectFrom = draggedObjectContainer;
                    state.draggedObject.inHand(true);
                },
                "stop": function () {
                    console.debug("drag stopping");
                    if(state.hitDropTarget === false) {
                    }
                    state.draggedObject.inHand(false);
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
            var dropElement = $(element);
            var dropOptions = {
                "drop": function (e, ui) {
                    console.debug("drop fired");
                    state.hitDropTarget = true;
                    valueAccessor()({
                        "what": state.draggedObject,
                        "where": ko.dataFor(this)
                    });
                    var draggedFrom = state.draggedObjectFrom;
                    draggedFrom.item(null);
                },
                "hoverClass": "build-grid-square-hover"
            };
            dropElement.droppable(dropOptions);
        }
    };
})(inventoryDragAndDropBindingHandler || (inventoryDragAndDropBindingHandler = {}));
var app;
(function (app) {
    app.init = function (useDemoBuildTable) {
        if (typeof useDemoBuildTable === "undefined") { useDemoBuildTable = true; }
        console.log("app.init");
        app.world.init();
        app.viewModel.init(useDemoBuildTable);
        ko.applyBindings(app.viewModel, $("#content")[0]);
    };
})(app || (app = {}));
var app;
(function (app) {
    (function (types) {
        var Item = (function () {
            function Item(name, dependencies) {
                this.imageUrl = "";
                this.name = name;
                this.dependencies = dependencies;
            }
            return Item;
        })();
        types.Item = Item;        
        var Dependency = (function () {
            function Dependency(buildMatrix) {
                this.buildMatrix = null;
                this.buildList = {
                };
                this.buildString = null;
                if(buildMatrix.length !== 3 || buildMatrix[0].length !== 3 || buildMatrix[1].length !== 3 || buildMatrix[2].length !== 3) {
                    throw "invalid build matrix";
                }
                this.buildMatrix = buildMatrix;
                for(var i = 0; i < this.buildMatrix.length; i++) {
                    for(var j = 0; j < this.buildMatrix[i].length; j++) {
                        var thisItemName = this.buildMatrix[i][j];
                        if(thisItemName === null || thisItemName === "") {
                            continue;
                        }
                        this.buildList[thisItemName] = (this.buildList[thisItemName] || 0) + 1;
                    }
                }
                this.buildString = JSON.stringify(this.buildMatrix);
            }
            return Dependency;
        })();
        types.Dependency = Dependency;        
        var InventoryItem = (function () {
            function InventoryItem(item, qty) {
                this.qty = ko.observable(0);
                this.inHand = ko.observable(false);
                this.item = null;
                var _this = this;
                this.qty.subscribe(function (newQty) {
                    console.debug(_this.item.name, "qty changed to", newQty);
                });
                this.item = item;
                this.qty(qty);
            }
            return InventoryItem;
        })();
        types.InventoryItem = InventoryItem;        
        (function (ui) {
            var InventoryItemContainer = (function () {
                function InventoryItemContainer(x, y) {
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
                    });
                    _this.hasDropItem = ko.computed(function () {
                        return (_this.item() !== null);
                    });
                    _this.hasDropItemInHand = ko.computed(function () {
                        var thisItem = _this.item();
                        return (thisItem === null) ? false : thisItem.inHand();
                    });
                }
                return InventoryItemContainer;
            })();
            ui.InventoryItemContainer = InventoryItemContainer;            
        })(types.ui || (types.ui = {}));
        var ui = types.ui;
    })(app.types || (app.types = {}));
    var types = app.types;
})(app || (app = {}));
var app;
(function (app) {
    (function (world) {
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
        world.allItems = {
        };
        world.allItemsViaBuildString = {
        };
        var buildAllWorldItems = function () {
            console.log("app.world.buildAllWorldItems");
            var addItem = function (itemName, buildMatrix) {
                if (typeof buildMatrix === "undefined") { buildMatrix = null; }
                var dependency = (buildMatrix === null) ? null : new app.types.Dependency(buildMatrix);
                var newItem = new app.types.Item(itemName, dependency);
                world.allItems[itemName] = newItem;
                if(dependency !== null) {
                    world.allItemsViaBuildString[dependency.buildString] = newItem;
                }
            };
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
        };
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
            ui.init = function (useDemoBuildTable) {
                console.log("app.viewModel.ui.init");
                for(var i = 0; i < 3; i++) {
                    for(var j = 0; j < 3; j++) {
                        ui.buildTable.push(new app.types.ui.InventoryItemContainer(j, i));
                    }
                }
                for(var i = 0; i < 7; i++) {
                    for(var j = 0; j < 2; j++) {
                        ui.inventoryTable.push(new app.types.ui.InventoryItemContainer(j, i));
                    }
                }
                if(useDemoBuildTable === true) {
                    ui.buildTable[0].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stick], 1));
                    ui.buildTable[1].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stick], 1));
                    ui.buildTable[3].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.ironIngot], 1));
                }
                ui.inventoryTable[0].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stick], 64));
                ui.inventoryTable[1].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stone], 32));
                ui.inventoryTable[2].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.ironIngot], 5));
                ui.inventoryTable[3].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.ironIngot], 5));
                ui.inventoryTable[4].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.ironIngot], 5));
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
                ui.buildableResult = ko.computed(function () {
                    return app.world.allItemsViaBuildString[ui.currentBuildString()];
                });
            };
            ui.dropItem = function (data) {
                var where = data.where;
                var what = data.what;
                where.item(what);
                what.inHand(false);
            };
            ui.inventoryTable = [];
            ui.buildTable = [];
            ui.currentBuildString = null;
            ui.buildableResult = null;
        })(viewModel.ui || (viewModel.ui = {}));
        var ui = viewModel.ui;
        viewModel.init = function (useDemoBuildTable) {
            console.log("app.viewModel.init");
            app.viewModel.ui.init(useDemoBuildTable);
            viewModel.allItemsWithDependencies = ko.computed(function () {
                console.debug("computed: allItemsWithDependencies");
                var results = [];
                for(var itemName in app.world.allItems) {
                    if(!app.world.allItems.hasOwnProperty(itemName)) {
                        continue;
                    }
                    var item = app.world.allItems[itemName];
                    if(item.dependencies === null) {
                        continue;
                    }
                    results.push(item);
                }
                return results;
            });
            viewModel.inventoryLookup = ko.computed(function () {
                console.log("computed: inventoryLookup");
                var currentInventory = [];
                for(var i = 0; i < ui.inventoryTable.length; i++) {
                    var item = ui.inventoryTable[i].item();
                    if(item) {
                        currentInventory.push(item);
                    }
                }
                var inventoryLookupObject = {
                };
                for(var i = 0; i < currentInventory.length; i++) {
                    var currentInventoryItem = currentInventory[i];
                    inventoryLookupObject[currentInventoryItem.item.name] = currentInventoryItem;
                }
                return inventoryLookupObject;
            });
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
        };
        viewModel.allItemsWithDependencies;
        viewModel.buildableItems;
        viewModel.inventoryLookup;
        var canBuildItem = function (item, currentInventory) {
            if(item.dependencies === null) {
                throw "items without dependencies (" + item.name + ") should not be built";
            }
            var buildListForItem = item.dependencies.buildList;
            for(var requiredItemName in buildListForItem) {
                if(!buildListForItem.hasOwnProperty(requiredItemName)) {
                    continue;
                }
                var requiredQtyToBuildItem = buildListForItem[requiredItemName];
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
