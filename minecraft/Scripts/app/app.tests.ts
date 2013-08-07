/// <reference path="../typings/jasmine/jasmine.d.ts" />
/// <reference path="app.ts" />
$(function () {
	app.init(false);

	describe("the app", function () {

		describe("the types", function () {

			

		});

		describe("the world", function () {

			beforeEach(function () {

			});

			it("should exist", function () {
				expect(app.world).toNotEqual(null);
			});

			it("should have some items in it", function () {
				expect(app.world.allItems[app.world.itemNames.stone].name).toBe("stone");
			});

			it("should have buildable items in it", function () {
				expect(app.world.allItems[app.world.itemNames.ironPickaxe].dependencies).toNotBe(null);
			});

			describe("the viewmodel", function () {

				describe("the ui", function () {

					describe("should have a build table", function () {

						beforeEach(function () {
							for (var i = 0; i < 9; i++) {
								app.viewModel.ui.buildTable[i].item(null);
							}
						});

						it("that is 3x3", function () {
							// make sure we're still dealing with a 3x3 build table
							expect(app.viewModel.ui.buildTable.length).toBe(9);
							expect(app.viewModel.ui.buildTable[0].x).toBe(0);
							expect(app.viewModel.ui.buildTable[0].y).toBe(0);
							expect(app.viewModel.ui.buildTable[4].x).toBe(1);
							expect(app.viewModel.ui.buildTable[4].y).toBe(1);
							expect(app.viewModel.ui.buildTable[8].x).toBe(2);
							expect(app.viewModel.ui.buildTable[8].y).toBe(2);
						});


						it("that can hold items", function () {
							var ironIngot = new app.types.InventoryItem(app.world.allItems[app.world.itemNames.ironIngot], 1);

							expect(app.viewModel.ui.buildTable[0].item()).toBe(null);

							app.viewModel.ui.buildTable[0].item(ironIngot);

							var placedItem: app.types.InventoryItem = app.viewModel.ui.buildTable[0].item();

							expect(placedItem.item.name).toBe(ironIngot.item.name)
							expect(app.viewModel.ui.buildTable[0].hasDropItem()).toBe(true);
							expect(app.viewModel.ui.buildTable[0].hasDropItemInHand()).toBe(false);

							for (var i = 1; i < 9; i++) {
								expect(app.viewModel.ui.buildTable[i].hasDropItem()).toBe(false);
								expect(app.viewModel.ui.buildTable[i].hasDropItemInHand()).toBe(false)
							}

						});


						it("should be able to build a ironShovel", function () {

							expect(typeof app.viewModel.ui.buildableResult()).toBe("undefined");

							app.viewModel.ui.buildTable[1].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.ironIngot], 1));
							app.viewModel.ui.buildTable[4].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stick], 1));
							app.viewModel.ui.buildTable[7].item(new app.types.InventoryItem(app.world.allItems[app.world.itemNames.stick], 1));

							var builtItem: app.types.Item = app.viewModel.ui.buildableResult();
							var ironShovel = app.world.allItems[app.world.itemNames.ironShovel];

							expect(builtItem).toNotBe(null);
							expect(builtItem.name).toBe(ironShovel.name);
						});
					});
				});





			});
		});
	});
});