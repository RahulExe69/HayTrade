
/* -------- scripts/Utility.js -------- */
function convertToTitleSnakeCase(phrase)
{
    if(!phrase.length)
        return phrase;

    phrase = phrase.replaceAll("_", " ");
    let words = phrase.split(" ");
    let titleCaseWords = [];
    for(let word of words)
        titleCaseWords.push(word[0].toUpperCase() + word.slice(1).toLowerCase());

    return titleCaseWords.join("_");
}

// gotten from https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
const iOSPlatformList = new Set(["iPad Simulator", "iPhone Simulator", "iPod Simulator", "iPad", "iPhone", "iPod"]);
function isRunningIOS()
{
    return iOSPlatformList.has(navigator.platform) ||
        // iPad on iOS 13 detection
        (navigator.userAgent.includes("Mac") && "ontouchend" in document);
}

function getLocaleString(num)
{
    // since this is an internal function with an optional parameter, I am worried that this might cause weird behavior, as in toLocaleString(undefined) behaving differently from toLocaleString()
    // return num.toLocaleString(shouldIgnoreLocale ? "en-US" : undefined);

    return shouldIgnoreLocale ? num.toLocaleString("en-US") : num.toLocaleString();
}


/* -------- scripts/Globals.js -------- */
let itemsPerRow = 8;
let textListSeparatorSelectedRadio = 0;

let itemsPerRowSlider, itemsPerRowLabel, itemNameInput, itemQuantityInput, itemPriceOrMultiplierInput, itemTable;
let bottomText, screenshotRegion, screenshotPriceHolder;
let settingsOverlay, importFileInput, itemListDropdown, deleteItemListButton, createItemListInput, createItemListButton, includeSettingsInItemListCheckBox, copyCurrentItemsFromItemListCheckBox, abbreviationMappingTable, bottomTextSettingInput, textListSeparatorRadios, textListCustomSeparatorInput, textListSeparatorCustomRadio, textListFormatInput, priceCalculationItemInput, showPriceInScreenshotCheckBox, showTotalInNormalModeCheckBox, hidePriceOrMultiplierCheckBox, defaultQuantityInput, defaultPriceOrMultiplierInput, refocusNameOnSubmitCheckBox, focusQuantityOnAutocompleteCheckBox, ignoreLocaleCheckBox/*, reduceAnimationsCheckBox*/;
let priceCalculationModeStateSpan;
let disableInPriceCalculationModeElems, disableOutsidePriceCalculationModeElems;
let equationVisibilityStateSpan, unselectedItemsVisibilityStateSpan;
let shouldHideUnselectedItems = false;
let totalSelectedPriceArea, totalSelectedPriceHolder, totalSelectedPriceMessageHolder, totalSelectedPriceEquationHolder;
let coinImageUrl;
let priceCalculationItem;
let priceCalculationModeSelectionInfo;
let failedCopyOverlay, contactOverlay;
let copyImageLoadingWheel;
let activeItemList;
let shouldIncludeSettingsInItemList, shouldCopyCurrentItemsFromItemList;
let shouldShowTotalInNormalMode; // FIXME -- I'm starting to think more and more that this shouldn't be a variable, since the state is already completely coupled with the checkbox; adding this variable just prevents a get...() call that queries the checkbox with jquery to check if it's checked
let shouldHidePriceOrMultiplier;
let defaultQuantity, defaultPriceOrMultiplier;
let shouldRefocusNameOnSubmit, shouldFocusQuantityOnAutocomplete, shouldIgnoreLocale;

let itemNameFuzzyMatchesHolder, priceCalculationItemFuzzyMatchesHolder;


let preparedItemNames;


let items = new Map();

let itemLists = new Map();

let abbreviationMapping = new Map([
    ["tnt", "tnt barrel"],
    ["dyn", "dynamite"],
    ["wsugar", "white sugar"],
    ["bsugar", "brown sugar"],
    ["bpop", "buttered popcorn"],
    ["cpop", "cherry popsicle"],
    ["bmuff", "blackberry muffin"],
    ["rmuff", "raspberry muffin"],
    ["vice", "vanilla ice cream"],
    ["sice", "strawberry ice cream"],
    ["gbar", "gold bar"],
    ["sbar", "silver bar"],
    ["pbar", "platinum bar"],
    ["rcoal", "refined coal"],
    ["gcheese", "goat cheese"]
]);
let isActivelyCopyingImage = false;


/* -------- scripts/Init.js -------- */
$(document).ready(() =>
{
    // Since there are risks that people will lose their item listings and/or settings with update v3.0, I am creating this backup at the very start as a countermeasure for the worst-case scenario (in which case I can roll back the update).
    if(localStorage.getItem("v2.14_backup") === null)
        localStorage.setItem("v2.14_backup", JSON.stringify(localStorage));

    setUpCustomItems();

    itemsPerRowSlider = $("#itemsPerRowSlider");
    itemsPerRowLabel = $("#itemsPerRowLabel");
    itemNameInput = $("#itemNameInput");
    itemQuantityInput = $("#itemQuantityInput");
    itemPriceOrMultiplierInput = $("#itemPriceOrMultiplierInput");
    itemTable = $("#itemTable");

    bottomText = $("#bottomText");
    screenshotRegion = $("#screenshotRegion");
    screenshotPriceHolder = $("#screenshotPriceHolder");

    settingsOverlay = new Overlay("settingsOverlay", "showButton");

    importFileInput = $("#importFileInput");
    itemListDropdown = $("#itemListDropdown");
    deleteItemListButton = $("#deleteItemListButton");
    createItemListInput = $("#createItemListInput");
    createItemListButton = $("#createItemListButton");
    includeSettingsInItemListCheckBox = $("#includeSettingsInItemListCheckBox");
    copyCurrentItemsFromItemListCheckBox = $("#copyCurrentItemsFromItemListCheckBox");
    abbreviationMappingTable = $("#abbreviationMappingTable");
    bottomTextSettingInput = $("#bottomTextSettingInput");
    textListSeparatorRadios = $("input[name='textListSeparatorGroup']");
    textListCustomSeparatorInput = $("#textListCustomSeparatorInput");
    textListSeparatorCustomRadio = $("#textListSeparatorCustomRadio");
    textListFormatInput = $("#textListFormatInput");
    priceCalculationItemInput = $("#priceCalculationItemInput");
    showPriceInScreenshotCheckBox = $("#showPriceInScreenshotCheckBox");
    showTotalInNormalModeCheckBox = $("#showTotalInNormalModeCheckBox");
    hidePriceOrMultiplierCheckBox = $("#hidePriceOrMultiplierCheckBox");
    defaultQuantityInput = $("#defaultQuantityInput");
    defaultPriceOrMultiplierInput = $("#defaultPriceOrMultiplierInput");
    refocusNameOnSubmitCheckBox = $("#refocusNameOnSubmitCheckBox");
    focusQuantityOnAutocompleteCheckBox = $("#focusQuantityOnAutocompleteCheckBox");
    ignoreLocaleCheckBox = $("#ignoreLocaleCheckBox");
    // reduceAnimationsCheckBox = $("#reduceAnimationsCheckBox");


    priceCalculationModeStateSpan = $("#priceCalculationModeStateSpan");

    disableInPriceCalculationModeElems = $(".disableInPriceCalculationMode");
    disableOutsidePriceCalculationModeElems = $(".disableOutsidePriceCalculationMode");

    equationVisibilityStateSpan = $("#equationVisibilityStateSpan");
    unselectedItemsVisibilityStateSpan = $("#unselectedItemsVisibilityStateSpan");

    totalSelectedPriceArea = $("#totalSelectedPriceArea");
    totalSelectedPriceHolder = $("#totalSelectedPriceHolder");
    totalSelectedPriceMessageHolder = $("#totalSelectedPriceMessageHolder");
    totalSelectedPriceEquationHolder = $("#totalSelectedPriceEquationHolder");

    priceCalculationModeSelectionInfo = $("#priceCalculationModeSelectionInfo");

    failedCopyOverlay = new Overlay("failedCopyOverlay", "imageHolder");

    /* TODO -- should this be called contactUsOverlay instead? */
    contactOverlay = new Overlay("contactOverlay", "showButton");

    copyImageLoadingWheel = $("#copyImageLoadingWheel");

    itemNameFuzzyMatchesHolder = $("#itemNameFuzzyMatchesHolder");
    priceCalculationItemFuzzyMatchesHolder = $("#priceCalculationItemFuzzyMatchesHolder");

    itemsPerRowSlider.on("input", (event) =>
    {
        itemsPerRow = parseInt(event.target.value); // must convert to integer/number (since I do + calculations with it and don't want it to concat like a string)
        itemsPerRowLabel.text(itemsPerRow);
        updateItemLayout();

        rescaleScreenshotRegion();
    });


    itemNameInput.on("focus", () =>
    {
        updateFuzzyMatches(itemNameInput, itemNameFuzzyMatchesHolder);
    });
    itemNameInput.on("blur", () =>
    {
        itemNameFuzzyMatchesHolder.empty();
    });

    itemNameInput.on("keydown", (e) =>
    {
        // should use key to get the value representation of the input, allowing numpad numbers to show up like normal numbers ( https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key and https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code )
        if(e.key.length !== 1 || e.key < '0' || e.key > '9')
            return;
        let selection = e.key - '0';
        if(selection === 0)
            selection = 10;

        const buttons = itemNameFuzzyMatchesHolder.find("button");
        if(buttons.length < selection)
            return;

        buttons.eq(selection - 1).trigger("mousedown", {usedKeyboard: true});
        event.preventDefault();
    });
    itemNameInput.on("keyup", (e) =>
    {
        handleAddingItem(e);

        // this should be done AFTER handling adding the item, since we want this to show no results if enter was pressed and the name input got wiped
        updateFuzzyMatches(itemNameInput, itemNameFuzzyMatchesHolder);
    });
    itemQuantityInput.on("keyup", handleAddingItem);
    itemPriceOrMultiplierInput.on("keyup", handleAddingItem);
    $("#itemSubmitButton").on("click", (e) => handleAddingItem(e, true));
    $("#itemDeleteButton").on("click", (e) =>
    {
        // want to return early if there was no item name (otherwise, the item quantity input's value would stay at 0 because handleAddingItem() would return early without doing anything)
        if(!formatItemName(itemNameInput.val()).length)
        {
            // done to be consistent with Submit; clicking Submit reselects the name field even when it is empty (when this setting is enabled)
            if(shouldRefocusNameOnSubmit)
                itemNameInput.trigger("select");

            return;
        }

        //items.delete();
        itemQuantityInput.val("0");
        handleAddingItem(e, true);
    });


    const coinImagePromise = getImageUrl("Coin")
        .then(imageUrl => coinImageUrl = imageUrl)
        .catch(e => console.log("Failed to get coin image url --", e));

    $("#copyImageToClipboardButton").on("click", copyImageToClipboard);

    // TODO -- all of this event stuff seems to be identical for both the settings and changelog popups (and probably for potential future ones as well); I should probably turn at least part of this into some function with parameters for the corresponding jquery objects/selectors (for show button, hide button, background, etc.)

    // TODO -- I might want to eventually move this css stuff to a class, then use classList to add/remove these classes from the respective elements?  https://developer.mozilla.org/en-US/docs/Web/API/Element/classList
    settingsOverlay.showButton.on("click", () =>
    {
        settingsOverlay.overlay.prop("hidden", false);
        // disables scrolling the main page and removes the scrollbar from the side while the settings button is focused ( https://stackoverflow.com/questions/9280258/prevent-body-scrolling-but-allow-overlay-scrolling )
        // have to set both due to how I'm hiding overflow-x via css (this might not actually be required; TODO -- see if the css file actually needs html and body to both have overflow set; it seems like both should be set to prevent running into issues though: https://stackoverflow.com/questions/41506456/why-body-overflow-not-working )
        $("html, body").css("overflow-y", "hidden");
        // prevents the screenshot region from shifting over to the right due to the scrollbar now missing ( https://stackoverflow.com/questions/1417934/how-to-prevent-scrollbar-from-repositioning-web-page and https://css-tricks.com/elegant-fix-jumping-scrollbar-issue/ and https://aykevl.nl/2014/09/fix-jumping-scrollbar )
        screenshotRegion.css("margin-right", "calc(100vw - 100%)");
    });
    settingsOverlay.hideButton.on("click", () =>
    {
        settingsOverlay.overlay.prop("hidden", true);
        $("html, body").css("overflow-y", "visible");
        screenshotRegion.css("margin-right", "unset");
    });
    settingsOverlay.background.on("click", () =>
    {
        settingsOverlay.hideButton.trigger("click");
    });



    loadAllFromLocalStorage();

    // want to keep this synchronous
    ensureItemsHaveMaxPriceSet();
    // I could make total price update only once at the end when in price calc mode, but I've decided to update it with every new price loaded in ensureItemsHaveMaxPriceSet(); this way, the user can see the price/errors update in real time (it's more responsive).
    /*
    .then(() => {
        if(getIsInPriceCalculationMode())
            updateTotalPrice();
    });
    */

    // want to update the layout after loading from local storage, but only after the coin image has loaded
    coinImagePromise.then(() =>
    {
        updateItemLayout();
    });



    // these must all be after local storage is loaded (since their initial values change depending on what the user's settings had saved)

    $("#ExportButton").on("click", exportAll);
    $("#ImportButton").on("click", () =>
    {
        importFileInput.trigger("click");
    });
    importFileInput.on("change", async (event) =>
    {
        const files = event.target.files;
        if(files.length)
            importAll(await files[0].text());
        event.target.value = null; // reset it to not have any file selected (so that if the user reselects the same file, it will trigger the "change" event to load/import it again)
    });

    itemListDropdown.on("change", (event) =>
    {
        deleteItemListButton.prop("disabled", event.target.value === "Default");

        storeItemList();

        activeItemList = event.target.value;

        loadItemList();
    });
    deleteItemListButton.on("click", () =>
    {
        if(activeItemList === "Default")
        {
            console.log("Attempted to delete Default item list!  This shouldn't be possible; please contact JJCUBER.");
            return;
        }

        itemLists.delete(activeItemList);

        activeItemList = "Default";

        loadItemList();
    });
    createItemListInput.on("input", (event) =>
    {
        createItemListButton.prop("disabled", itemLists.has(event.target.value));
    });
    createItemListInput.on("keyup", (event) =>
    {
        // create item list with current name upon clicking enter key (if it is a valid name)
        if(event.code === "Enter" && !createItemListButton.prop("disabled"))
            createItemListButton.trigger("click");
    });
    createItemListButton.on("click", () =>
    {
        if(itemLists.has(createItemListInput.val()))
        {
            console.log("Attempted to create an existing item list!  This shouldn't be possible; please contact JJCUBER.");
            return;
        }

        storeItemList();

        createNewItemList(createItemListInput.val());
        createItemListInput.val("");

        loadItemList();
    });
    includeSettingsInItemListCheckBox.on("click", () =>
    {
        shouldIncludeSettingsInItemList = !shouldIncludeSettingsInItemList;

        saveAllToLocalStorage();
    });
    copyCurrentItemsFromItemListCheckBox.on("click", () =>
    {
        shouldCopyCurrentItemsFromItemList = !shouldCopyCurrentItemsFromItemList;

        saveAllToLocalStorage();
    });

    // TODO -- make sure nothing related to this (including the stuff in Persist.js) needs to be called before the stuff above (for a while, this was the first section of the settings overlay, but I have since added multiple settings above it).
    setUpAbbreviationMappingTable();


    // on input for showing live modifications in the background (behind the settings popup)
    bottomTextSettingInput.on("input", event =>
    {
        bottomText[0].innerText = event.target.value;
    });
    // on change for when focus is lost to the input area, which "commits" the changes to local storage as well
    bottomTextSettingInput.on("change", event =>
    {
        bottomText[0].innerText = event.target.value;

        saveAllToLocalStorage();

        // I only do this on change and not on input because I fear that it would cause too much lag/input delay from processing this
        rescaleScreenshotRegion();
    });
    bottomText.on("click", () =>
    {
        settingsOverlay.showButton.trigger("click");
        // bottomTextSettingInput[0].scrollIntoView(false); // ensures that the textarea is visible/on screen (and puts it at the bottom so that it won't overlap with the x/close button)
        bottomTextSettingInput[0].scrollIntoView(); // ensures that the textarea is visible/on screen (and puts it at the top; for some reason, iOS doesn't do the normal behavior of shifting the page up when showing the keyboard after doing it this way)
        // TODO -- maybe this should be .focus() instead?
        bottomTextSettingInput.trigger("select");
    });


    // (only fires once the slider is released)
    itemsPerRowSlider.on("change", () =>
    {
        saveAllToLocalStorage();
    });


    // be careful; checked is a property, NOT an attribute (I originally was using .attr() -- https://api.jquery.com/attr/ )
    textListSeparatorRadios.eq(textListSeparatorSelectedRadio).prop("checked", true);
    textListCustomSeparatorInput[0].disabled = textListSeparatorRadios[textListSeparatorSelectedRadio].id !== "textListSeparatorCustomRadio";

    textListSeparatorRadios.each((i, elem) =>
    {
        $(elem).on("click", i, (event) =>
        {
            textListSeparatorSelectedRadio = event.data;

            // textListCustomSeparatorInput[0].disabled = event.target.id !== "textListSeparatorCustomRadio";
            textListCustomSeparatorInput[0].disabled = event.target !== textListSeparatorCustomRadio[0];

            saveAllToLocalStorage();
        });
    });

    textListCustomSeparatorInput.on("change", (event) =>
    {
        textListSeparatorCustomRadio.val(event.target.value);

        saveAllToLocalStorage();
    });

    textListFormatInput.on("change", () =>
    {
        saveAllToLocalStorage();
    });

    priceCalculationItemInput.on("focus", () =>
    {
        updateFuzzyMatches(priceCalculationItemInput, priceCalculationItemFuzzyMatchesHolder);
    });
    priceCalculationItemInput.on("blur", () =>
    {
        priceCalculationItemFuzzyMatchesHolder.empty();
    });
    priceCalculationItemInput.on("keydown", (e) =>
    {
        // should use key to get the value representation of the input, allowing numpad numbers to show up like normal numbers ( https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key and https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code )
        if(e.key.length !== 1 || e.key < '0' || e.key > '9')
            return;
        let selection = e.key - '0';
        if(selection === 0)
            selection = 10;

        const buttons = priceCalculationItemFuzzyMatchesHolder.find("button");
        if(buttons.length < selection)
            return;

        buttons.eq(selection - 1).trigger("mousedown", {usedKeyboard: true});
        event.preventDefault();
    });
    priceCalculationItemInput.on("keyup", (e) =>
    {
        updateFuzzyMatches(priceCalculationItemInput, priceCalculationItemFuzzyMatchesHolder);
    });
    priceCalculationItemInput.on("change", async (event) =>
    {
        let itemNameFormatted = formatItemName(event.target.value);
        let itemUrl, itemMaxPrice;
        try
        {
            itemUrl = await getImageUrl(itemNameFormatted);
            itemMaxPrice = await getMaxPrice(itemNameFormatted);
        }
        catch
        {
            // default to diamond ring for invalid item names
            itemNameFormatted = "Diamond_Ring";

            itemUrl = await getImageUrl(itemNameFormatted);
            itemMaxPrice = await getMaxPrice(itemNameFormatted);
        }

        priceCalculationItem = new Item(itemNameFormatted, undefined, itemUrl, undefined, itemMaxPrice);

        // TODO -- it might be better to just always make sure price gets immediately updated tbh (although, enabling price calc mode or showing of the price in screenshot will run update total price themselves)
        if(getIsInPriceCalculationMode() || getIsPriceShownInScreenshot())
            updateTotalPrice();
        saveAllToLocalStorage();
    });
    // want to make it fire immediately the first time; I couldn't do this inside the load all function since this must be set after the load all and after the coin image url is fetched
    priceCalculationItemInput.trigger("change");


    // TODO -- should I be using change event instead of click event for checkboxes (along with any input element variants)?  Resources such as https://stackoverflow.com/questions/3442322/jquery-checkbox-event-handling make it sound like click doesn't work for certain things, but they do seem to (which is likely due to how old this so question is).  This resource seems to better explain; in my use case, they are pretty much identical, though there is a potential distinction: https://stackoverflow.com/questions/11205957/jquery-difference-between-change-and-click-event-of-checkbox
    showPriceInScreenshotCheckBox.on("click", () =>
    {
        let wasShowing = getIsPriceShownInScreenshot();
        screenshotPriceHolder.prop("hidden", wasShowing);

        showTotalInNormalModeCheckBox.prop("disabled", wasShowing);

        if(!wasShowing)
            updateTotalPrice();
        saveAllToLocalStorage();
    });

    showTotalInNormalModeCheckBox.on("click", () =>
    {
        shouldShowTotalInNormalMode = !shouldShowTotalInNormalMode;

        updateTotalPrice();
        saveAllToLocalStorage();
    });

    hidePriceOrMultiplierCheckBox.on("click", () =>
    {
        shouldHidePriceOrMultiplier = !shouldHidePriceOrMultiplier;

        updateItemLayout();
        saveAllToLocalStorage();
    });

    defaultQuantityInput.on("change", (event) =>
    {
        // TODO -- should this instead be set within saveAllToLocalStorage()?  Probably not...
        defaultQuantity = event.target.value;

        saveAllToLocalStorage();
    });
    defaultPriceOrMultiplierInput.on("change", (event) =>
    {
        // TODO -- should this instead be set within saveAllToLocalStorage()?  Probably not...
        defaultPriceOrMultiplier = event.target.value;

        saveAllToLocalStorage();
    });
    refocusNameOnSubmitCheckBox.on("click", () =>
    {
        shouldRefocusNameOnSubmit = !shouldRefocusNameOnSubmit;

        saveAllToLocalStorage();
    });
    focusQuantityOnAutocompleteCheckBox.on("click", () =>
    {
        shouldFocusQuantityOnAutocomplete = !shouldFocusQuantityOnAutocomplete;

        saveAllToLocalStorage();
    });
    ignoreLocaleCheckBox.on("click", () =>
    {
        shouldIgnoreLocale = !shouldIgnoreLocale;

        updateTotalPrice();
        saveAllToLocalStorage();
    });
    // reduceAnimationsCheckBox.on("click", () =>
    // {
    //     // TODO -- figure out how to disable animations and transitions via js; I don't see a good way currently
    // });

    $("#copyAsTextListButton").on("click", copyAsTextListToClipboard);

    $("#clearAllButton").on("click", () =>
    {
        if(confirm("Are you sure?  This will clear the items currently added and can't be undone."))
        {
            items.clear();
            updateItemLayout();

            saveAllToLocalStorage();
        }
    });


    disableOutsidePriceCalculationModeElems.prop("disabled", true);

    $("#priceCalculationToggleButton").on("click", () =>
    {
        // MUST use currentTarget (or just reference priceCalculationToggleButton); event.target gets set to the span if it is the one actually clicked ( https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget )
        // TODO -- maybe change all even.target's to even.currentTarget in my code?
        const toggleButton = event.currentTarget;
        const wasEnabled = getIsInPriceCalculationMode();

        // make relevant buttons enabled/disabled
        disableInPriceCalculationModeElems.prop("disabled", !wasEnabled);
        disableOutsidePriceCalculationModeElems.prop("disabled", wasEnabled);

        // make relevant elements hidden/visible
        // TODO - maybe make this a class/two classes like how I did enabled/disabled buttons?  However, there aren't really enough elements to warrant that at the moment (though it could help express intent).
        totalSelectedPriceArea.prop("hidden", wasEnabled);
        priceCalculationModeSelectionInfo.prop("hidden", wasEnabled);

        if(wasEnabled)
        {
            // disable it

            priceCalculationModeStateSpan.text("Enable"); // says the "opposite," since that's what it will change the state to on click
            toggleButton.classList.remove("selected");
        }
        else
        {
            // enable it

            priceCalculationModeStateSpan.text("Disable"); // says the "opposite," since that's what it will change the state to on click
            toggleButton.classList.add("selected");
        }

        // restore previous/remove all selections/custom adornments (done by refreshing the layout)
        updateItemLayout();
    });

    $("#selectAllButton").on("click", () =>
    {
        const cells = $("#itemTable td");
        setSelectedStateAll(items.values(), cells, true);

        updateTotalPrice();

        // need to update what items are and aren't visible now that all items have been selected (even previously hidden ones)
        if(shouldHideUnselectedItems)
            updateItemLayout();
    });

    $("#clearSelectionButton").on("click", () =>
    {
        const cells = $("#itemTable td");
        setSelectedStateAll(items.values(), cells, false);

        updateTotalPrice();

        // need to update what items are and aren't visible now that all items have been deselected (even previously visible ones)
        if(shouldHideUnselectedItems)
            updateItemLayout();
    });

    $("#subtractSelectedQuantitiesButton").on("click", () =>
    {
        for(let item of items.values())
        {
            if(!item.isSelected)
                continue;

            item.quantity -= item.customQuantity ?? item.quantity;

            item.customQuantity = undefined;

            // it should be fine to remove elements from a map while iterating over it according to https://stackoverflow.com/questions/35940216/es6-is-it-dangerous-to-delete-elements-from-set-map-during-set-map-iteration
            if(item.quantity <= 0)
                items.delete(item.name);

            // TODO - Should items that have a >0 quantity left stay selected?  On the one hand, one might consider custom quantities to be all you selected; on the other hand, one might consider custom quantities to be just part of the whole currently being worked on in this moment (which means that after subtracting said amount, they still want to work with the rest of said item's quantity and/or keep it selected).
            // If I decide to deselect all, I should put an else to the if above which does item.isSelected = false;
        }

        updateItemLayout();

        saveAllToLocalStorage();
    });

    $("#deleteSelectedButton").on("click", () =>
    {
        for(let item of items.values())
        {
            if(item.isSelected)
                items.delete(item.name);
        }

        updateItemLayout();

        saveAllToLocalStorage();
    });

    $("#resetCustomValuesButton").on("click", () =>
    {
        for(let item of items.values())
        {
            item.customQuantity = undefined;
            item.customPriceOrMultiplier = undefined;
        }

        updateItemLayout();
    });

    $("#equationVisibilityToggleButton").on("click", () =>
    {
        // TODO - might want to use something like this for the price calculation toggle, since it can be tied to the total price div area
        const wasHidden = totalSelectedPriceEquationHolder.is("[hidden]");

        equationVisibilityStateSpan.text(wasHidden ? "Hide" : "Show");
        totalSelectedPriceEquationHolder.prop("hidden", !wasHidden);

        const toggleButton = event.currentTarget;
        if(wasHidden)
            toggleButton.classList.add("selected");
        else
            toggleButton.classList.remove("selected");
    });

    $("#unselectedItemsVisibilityToggleButton").on("click", () =>
    {
        const wasHidden = shouldHideUnselectedItems;
        unselectedItemsVisibilityStateSpan.text(wasHidden ? "Hide" : "Show");

        const toggleButton = event.currentTarget;
        if(wasHidden)
            toggleButton.classList.remove("selected");
        else
            toggleButton.classList.add("selected");

        shouldHideUnselectedItems = !shouldHideUnselectedItems;
        updateItemLayout();
    });








    failedCopyOverlay.hideButton.on("click", () =>
    {
        failedCopyOverlay.overlay.prop("hidden", true);
        $("html, body").css("overflow-y", "visible");
        screenshotRegion.css("margin-right", "unset");
    });
    failedCopyOverlay.background.on("click", () =>
    {
        failedCopyOverlay.hideButton.trigger("click");
    });



    contactOverlay.showButton.on("click", () =>
    {
        contactOverlay.overlay.prop("hidden", false);
        // disables scrolling the main page and removes the scrollbar from the side while the settings button is focused ( https://stackoverflow.com/questions/9280258/prevent-body-scrolling-but-allow-overlay-scrolling )
        $("html, body").css("overflow-y", "hidden");
        // prevents the screenshot region from shifting over to the right due to the scrollbar now missing ( https://stackoverflow.com/questions/1417934/how-to-prevent-scrollbar-from-repositioning-web-page and https://css-tricks.com/elegant-fix-jumping-scrollbar-issue/ and https://aykevl.nl/2014/09/fix-jumping-scrollbar )
        screenshotRegion.css("margin-right", "calc(100vw - 100%)");
    });
    contactOverlay.hideButton.on("click", () =>
    {
        contactOverlay.overlay.prop("hidden", true);
        $("html, body").css("overflow-y", "visible");
        screenshotRegion.css("margin-right", "unset");
    });
    contactOverlay.background.on("click", () =>
    {
        contactOverlay.hideButton.trigger("click");
    });

    $("#tryNewSiteButton").on("click", () =>
    {
        window.open("https://hd.jjtechdev.com/", "_blank");
    });
    $("#donateButton").on("click", () =>
    {
        window.open("https://ko-fi.com/jjcuber", "_blank");
    });



    prepareAllItemNames();



    // prevents zooming in on input/textarea focus in iOS
    // TODO -- maybe make this some class and/or css media query-related thing?
    if(isRunningIOS())
        $("input, textarea").css("font-size", "16px");


    // rescale screenshot region whenever window/page is resized (also invokes it for the first time immediately to ensure it starts scaled properly)
    $(window).on("resize", rescaleScreenshotRegion);
    rescaleScreenshotRegion();
});


/* -------- scripts/Overlay.js -------- */
// TODO -- maybe make show and hide functions?
class Overlay
{
    // TODO -- extraIds is a bad name; it should be something pertaining to extra overlay elements (showButton, imageHolder, etc.)
    // TODO - I might want to make a list of dictionary mappings from extra overlay element name to function for settings up (since I have repeated code pertaining to showButtons)
    constructor(overlayId, ...extraIds)
    {
        this.overlay = $(`#${overlayId}`);

        this.background = this.overlay.find(".overlayBackground");
        this.box = this.overlay.find(".overlayBox");
        this.hideButton = this.overlay.find(".overlayHideButton");
        this.inner = this.overlay.find(".overlayInner");

        // add the extra ids as valid this. entries
        for(let extraId of extraIds)
        {
            if(!extraId.length)
                continue;

            const extraIdFirstUpper = extraId[0].toUpperCase() + extraId.slice(1);
            this[extraId] = $(`#${overlayId}${extraIdFirstUpper}`);
        }
    }
}


/* -------- scripts/Item.js -------- */
// There are more operators than the ones here technically supported by math.js, but I feel like these are all the "reasonable" ones to support for the automatic prepending of the old quantity/custom quantity ( https://mathjs.org/docs/expressions/syntax.html )
// TODO -- I could theoretically make this a set, but that's probably not a good idea since the "keys" have differing lengths and I'm just looking for whether a given equation string starts with one of these keys
const operators = ['+', '-', '*', '/', '^', '%', "mod", '&', '|', "<<", ">>>", ">>"]; // >>> should be before >> to ensure the full operator gets removed then readded later (if >> was first, ">>> 5" would only remove the first 2 '>' leaving "> 5")
function handleAddingItem(e, usedSubmitButton = false)
{
    // only want the name box to have the invalid red border until the user starts typing again (tabbing into this textbox also cancels it; unfortunately, this gets removed almost immediately if the user starts typing right after pressing enter, since it takes a bit of time for the fetch to occur and for the invalid class to be added, if needed)
    if(itemNameInput.hasClass("invalid"))
        itemNameInput.removeClass("invalid");


    // Don't want to accept changes while trying to copy the image
    // TODO -- I don't handle actively copying image yet for anything related to price calculation mode; maybe I should do that?
    if(isActivelyCopyingImage)
        return;

    // TODO -- might want to be using e.key instead
    if(!usedSubmitButton && e.code !== "Enter")
        return;

    // at this point, the user has attempted to submit (or delete), so the input should get reselected (if the setting is enabled; this mostly just matters for people who click the submit button instead of enter)
    // note that this also occurs when Delete button gets clicked
    if(shouldRefocusNameOnSubmit)
        itemNameInput.trigger("select");

    const itemNameFormatted = formatItemName(itemNameInput.val());
    if(!itemNameFormatted.length)
        return;

    let itemQuantity, prependedQuantityOperator = "";
    let itemQuantityEquation = itemQuantityInput.val().trim();
    // only want to separate starting operator if the item already exists (if the item doesn't exist, the whole quantity should be evaluated as one equation)
    if(items.has(itemNameFormatted))
    {
        for(let operator of operators)
        {
            if(!itemQuantityEquation.startsWith(operator))
                continue;

            prependedQuantityOperator = operator;
            itemQuantityEquation = itemQuantityEquation.substr(prependedQuantityOperator.length);
            break;
        }
    }

    try
    {
        // rest of equation is calculated beforehand so that addItem() gets an actual value
        itemQuantity = itemQuantityEquation.length ? math.evaluate(itemQuantityEquation) : 0;
    }
    catch(e)
    {
        console.log("Unable to evaluate quantity --", e);
        return;
    }

    addItem(itemNameFormatted, itemQuantity, itemPriceOrMultiplierInput.val(), prependedQuantityOperator)
        .then(() => updateItemLayout())
        .catch(e =>
        {
            console.log("Failed to add item and update layout --", e);

            itemNameInput.addClass("invalid");
        });

    itemNameInput.val("");
    itemQuantityInput.val(defaultQuantity);
    itemPriceOrMultiplierInput.val(defaultPriceOrMultiplier);
}


class Item
{
    static fieldsToOmitFromLocalStorage = new Set(["customQuantity", "customPriceOrMultiplier", "isSelected"]);
    constructor(name, quantity, url, priceOrMultiplier, maxPrice)
    {
        this.name = name;
        this.quantity = quantity;
        this.url = url;
        this.priceOrMultiplier = priceOrMultiplier;
        this.maxPrice = maxPrice;

        // these should not persist across sessions (I also omit them from the JSON.stringify)
        this.customQuantity = undefined;
        this.customPriceOrMultiplier = undefined;
        this.isSelected = false;
    }

    getHumanReadableName()
    {
        return this.name.replaceAll("_", " ");
    }

    // returns [totalPrice, equation, error, warning]
    calculateTotalPrice(shouldIgnoreCustomValues = false)
    {
        let quantity = this.customQuantity ?? this.quantity,
            priceOrMultiplier = this.customPriceOrMultiplier ?? this.priceOrMultiplier,
            maxPrice = this.maxPrice;

        if(shouldIgnoreCustomValues)
        {
            quantity = this.quantity;
            priceOrMultiplier = this.priceOrMultiplier;
        }

        if(!maxPrice && !customItemNames.has(this.name))
            return [NaN, "NaN", `${this.getHumanReadableName()} doesn't have a valid maximum price (${maxPrice}).`];


        priceOrMultiplier = priceOrMultiplier.trim();

        let price, mult;
        let warning;
        if(!priceOrMultiplier.length)
        {
            mult = "1";
            warning = `The price/multiplier for ${this.getHumanReadableName()} was empty, so it was defaulted to 1x.` ;
        }
        else if(priceOrMultiplier.endsWith('x'))
        {
            // this is to handle when a custom item name without a maximum price reaches here
            if(!maxPrice)
                return [NaN, "NaN", `${this.getHumanReadableName()} is a custom item without a valid maximum price (${maxPrice}).`];

            mult = priceOrMultiplier.slice(0, -1);
        }
        else if(priceOrMultiplier.endsWith('k'))
            price = `(${priceOrMultiplier.slice(0, -1)})*10^3`;
        else if(priceOrMultiplier.endsWith('m'))
            price = `(${priceOrMultiplier.slice(0, -1)})*10^6`;
        else
            price = priceOrMultiplier;

        if(mult)
            price = `${maxPrice}*(${mult})`;
        // I'm doing this so that it can be shown to the user in full
        price = `${quantity}*(${price})`;

        try
        {
            return [math.evaluate(price), price, undefined, warning];
        }
        catch(e)
        {
            console.log(e);
            // I believe that it would only ever be an issue with the price/mult?
            // return [NaN, price, `${this.getHumanReadableName()} has some invalid value (quantity: ${quantity}, price/multiplier: ${priceOrMultiplier}, max price: ${maxPrice} -- equation: ${price}).`, warning];
            return [NaN, price, `${this.getHumanReadableName()} has an invalid price/multiplier (price/multiplier: ${priceOrMultiplier} -- equation: ${price}).`, warning];
        }
    }
}


function addItem(itemNameFormatted, itemQuantity, itemPriceOrMultiplier, prependedQuantityOperator = "")
{
    const isInPriceCalculationMode = getIsInPriceCalculationMode();

    // the itemQuantity is already completely calculated, but we need to ensure that it isn't floating-point
    if(!prependedQuantityOperator)
        itemQuantity = Math.floor(itemQuantity);

    if(items.has(itemNameFormatted))
    {
        const currItem = items.get(itemNameFormatted);

        // modifies the custom fields instead when in price calculation mode
        if(isInPriceCalculationMode)
        {
            if(prependedQuantityOperator.length)
                itemQuantity = Math.floor(math.evaluate(`${currItem.customQuantity ?? currItem.quantity} ${prependedQuantityOperator} ${itemQuantity}`));
            // only stores custom if it differs; custom quantity set to <=0 defaults back to normal quantity, and custom price/mult gets wiped if its field becomes empty (otherwise the user might try to wipe it out, only to find out that it makes the mult default to 1x)
            currItem.customQuantity = (itemQuantity > 0 && itemQuantity !== currItem.quantity) ? itemQuantity : undefined;
            currItem.customPriceOrMultiplier = (itemPriceOrMultiplier.trim().length && itemPriceOrMultiplier !== currItem.priceOrMultiplier) ? itemPriceOrMultiplier : undefined;

            // makes sure that the item just modified is selected so that the custom value is visible to the user (if the user modified the value, they likely wanted it to be selected); this is to help with the fact that clicking on a selected item's quantity/price will deselect it
            currItem.isSelected = true;

            return Promise.resolve();
        }

        if(prependedQuantityOperator.length)
            itemQuantity = Math.floor(math.evaluate(`${currItem.quantity} ${prependedQuantityOperator} ${itemQuantity}`));

        if(itemQuantity > 0)
        {
            const prevQuantity = currItem.quantity;
            currItem.quantity = itemQuantity;
            currItem.priceOrMultiplier = itemPriceOrMultiplier;

            // need to wipe out custom values if they now match the new quantity/prices
            if(currItem.customQuantity === currItem.quantity || (currItem.customQuantity > currItem.quantity && currItem.customQuantity < prevQuantity)) // after updating an item's actual quantity, custom quantities above it should reset/"snap" back to the new quantity (unless it was already above it; custom quantity won't ever equal previous quantity, since it would have just gotten reset to undefined)
                currItem.customQuantity = undefined;
            if(currItem.customPriceOrMultiplier === currItem.priceOrMultiplier)
                currItem.customPriceOrMultiplier = undefined;
        }
        else
            items.delete(itemNameFormatted);

        saveAllToLocalStorage();

        return Promise.resolve();
    }

    // don't want to add new items in this mode
    if(isInPriceCalculationMode)
        return Promise.resolve();

    if(itemQuantity <= 0)
        return Promise.resolve();

    return getImageUrl(itemNameFormatted)
        .then(async imageUrl =>
        {
            console.log(imageUrl);

            const maxPrice = await getMaxPrice(itemNameFormatted);

            items.set(itemNameFormatted, new Item(itemNameFormatted, itemQuantity, imageUrl, itemPriceOrMultiplier, maxPrice));

            saveAllToLocalStorage();
        });
}


function formatItemName(itemName)
{
    const itemNameTrimmed = itemName.trim();
    if(!itemNameTrimmed.length)
        return itemNameTrimmed;

    const unabbreviatedItemName = handleAbbreviations(itemNameTrimmed);
    const itemNameTitleSnakeCase = convertToTitleSnakeCase(unabbreviatedItemName);
    const itemNameFormatted = handleSpecialNames(itemNameTitleSnakeCase);

    return itemNameFormatted;
}

function handleAbbreviations(itemName)
{
    return abbreviationMapping.get(itemName.toLowerCase()) ?? itemName;
}

// Items with "abnormal" casing are abbreviations and items with the word "and" in them (I could just replace all and's with And, but that might not be very future-proof or have a weird edge-case)
const specialNameMapping = new Map([
    ["Tnt_Barrel", "TNT_Barrel"],
    ["Blt_Salad", "BLT_Salad"],
    ["Bacon_And_Eggs", "Bacon_and_Eggs"],
    ["Fish_And_Chips", "Fish_and_Chips"],
    ["Peanut_Butter_And_Jelly_Sandwich", "Peanut_Butter_and_Jelly_Sandwich"],
    ["Frutti_Di_Mare_Pizza", "Frutti_di_Mare_Pizza"]
]);
function handleSpecialNames(itemName)
{
    return specialNameMapping.get(itemName) ?? itemName;
}

const customItemNames = new Set(["BEM Set", "SEM Set", "TEM Set", "LEM Set"]);
function setUpCustomItems()
{
    for(let name of customItemNames)
        specialNameMapping.set(convertToTitleSnakeCase(name), name);
}

function getImageUrl(itemNameTitleSnakeCase)
{
    // the custom item names get mapped back to themselves when getting the title snake case list, so they are in their "normal" form already at this point
    if(customItemNames.has(itemNameTitleSnakeCase))
        // return Promise.resolve({url: `images/${itemNameTitleSnakeCase}.png`, isCustom: true});
        return Promise.resolve(`images/${itemNameTitleSnakeCase}.png`); // TODO -- might want to make some map for these at some point (in the event that I want the custom images to be in multiple different folders, for whatever reason)

    // https://www.mediawiki.org/wiki/API:Imageinfo
    // scaled down images don't work cross-site (it will work locally, but not on the hosted site)
    return fetch(`https://hayday.fandom.com/api.php?action=query&prop=imageinfo&iiprop=url&titles=File:${itemNameTitleSnakeCase}.png&format=json&origin=*`)
        .then(response => response.json())
        .then(data =>
        {
            // console.log(data);
            const pages = data.query.pages;
            const pageId = Object.keys(pages)[0];
            // for some reason, this works fine but the resultant wikia static image url yields a 404 from github pages ONLY when scaled down
            // return pages[pageId].imageinfo[0].thumburl;
            // return pages[pageId].imageinfo[0].thumburl.split("\/revision\/latest\/scale-to-width-down")[0];
            return pages[pageId].imageinfo[0].url.split("\/revision\/")[0]; // or split on "\/revision\/latest", but I'm worried that something might change at some point
            // return {url: pages[pageId].imageinfo[0].url.split("\/revision\/")[0], isCustom: false}; // or split on "\/revision\/latest", but I'm worried that something might change at some point
        });
}

let previousSelection;
function updateItemLayout()
{
    itemTable.empty();

    // must do this up-front to ensure that the price gets properly update in the event that 1) all the items get cleared out, or 2) all the visible items get cleared out (if in price calc mode with hide unselected)
    const shouldShowSelection = getIsInPriceCalculationMode();
    if(shouldShowSelection || getIsPriceShownInScreenshot())
        updateTotalPrice();

    if(!items.size)
        return;


    previousSelection = undefined;

    let itemsUnsorted = [...items.values()];
    // filter out unselected if the user wants them hidden
    if(shouldShowSelection && shouldHideUnselectedItems)
    {
        itemsUnsorted = itemsUnsorted.filter(item => item.isSelected);

        // nothing to show (since all of the items got filtered out), so we are done (also don't need to worry about updating the total price, since it always gets updated after clicking on any item's cell)
        if(!itemsUnsorted.length)
            return;
    }
    const itemsSortedDescending = itemsUnsorted.sort((item1, item2) => item2.quantity - item1.quantity);

    const itemCt = itemsSortedDescending.length;
    let rowCt = Math.ceil(itemCt / itemsPerRow);

    let i = 0;
    while(rowCt--)
    {
        const tableRow = document.createElement("tr");
        for(let j = 0; i < itemCt && j < itemsPerRow; i++, j++)
        {
            const currItem = itemsSortedDescending[i];
            const tableCell = document.createElement("td");
            tableCell.classList.add("itemCell");

            if(shouldShowSelection && currItem.isSelected)
                tableCell.classList.add("selected");

            // must be mouseup to execute before the on click events for image, quantity, and label (since they must select the text after it has been overridden by this)
            $(tableCell).on("mouseup", {index: i, item: currItem}, (event) =>
            {
                const item = event.data.item;
                itemNameInput.val(item.getHumanReadableName());
                itemQuantityInput.val(shouldShowSelection ? (item.customQuantity ?? item.quantity) : item.quantity);
                itemPriceOrMultiplierInput.val(shouldShowSelection ? (item.customPriceOrMultiplier ?? item.priceOrMultiplier) : item.priceOrMultiplier);

                if(!shouldShowSelection)
                    return;


                const index = event.data.index;
                const [first, last] = [index, previousSelection ?? index].sort((n1, n2) => n1 - n2);
                if(event.shiftKey) // range additive
                {
                    $("#itemTable td").slice(first, last + 1)
                        .each((k, elem) =>
                        {
                            const currItem = itemsSortedDescending[first + k];
                            setSelectedState(currItem, elem, true);
                        });
                }
                else if(event.altKey) // range subtractive; must use if else if... to make sure previousSelection always gets set
                {
                    $("#itemTable td").slice(first, last + 1)
                        .each((k, elem) =>
                        {
                            const currItem = itemsSortedDescending[first + k];
                            setSelectedState(currItem, elem, false);
                        });
                }
                else if(event.ctrlKey) // range toggle
                {
                    $("#itemTable td").slice(first, last + 1)
                        .each((k, elem) =>
                        {
                            const currItem = itemsSortedDescending[first + k];
                            setSelectedState(currItem, elem, !currItem.isSelected);
                        });
                }
                else // normal selection (individual toggle)
                {
                    const cell = event.currentTarget;
                    setSelectedState(item, cell, !item.isSelected);
                }

                updateTotalPrice();

                previousSelection = index;
            });

            const image = document.createElement("img");
            image.src = currItem.url;
            image.classList.add("itemImage");
            $(image).on("click", () =>
            {
                // only want to focus the item name input if not in price calculation mode
                // TODO -- maybe the name input should never be focused in general, since it never really makes sense to want to keep all the same price and quantities, but change the name (effectively duplicating the item info but with a different item name)?
                if(!shouldShowSelection)
                    itemNameInput.trigger("select");
                // need to update the layout to not include items that just got deselected; I am only putting this in the event handler for clicking on the image itself, since I want the user to be able to modify price/mult and quantity without the item temporarily disappearing
                // this does cause the problem of clicking the border of the cell toggling the item, but not hiding it when the user wants them hidden (since this event only listens for clicking on the image itself, not anywhere in the cell)
                // TODO -- I'm wondering if I should make clicking on quantity/price not change the state of the selection in general, though that could be a bit annoying if the user is trying to quickly select items.
                else if(shouldHideUnselectedItems)
                    updateItemLayout();
            });

            const quantityLabel = document.createElement("p");
            quantityLabel.innerText = currItem.quantity;
            quantityLabel.classList.add("label", "quantityLabel");
            $(quantityLabel).on("click", () =>
            {
                itemQuantityInput.trigger("select");
            });

            const priceLabel = document.createElement("p");
            priceLabel.innerHTML = formatItemPriceLabel(currItem.priceOrMultiplier); // using innerHTML so that coin image is shown
            priceLabel.classList.add("label", "priceLabel");
            $(priceLabel).on("click", () =>
            {
                itemPriceOrMultiplierInput.trigger("select");
            });
            if(shouldHidePriceOrMultiplier)
                priceLabel.style.display = "none";

            let customQuantityLabel, customPriceLabel;
            if(shouldShowSelection)
            {
                // TODO -- I feel like some of this stuff is redundant/repeated stuff from setSelectedState() (though this stuff isn't technically in the DOM yet)
                if(currItem.customQuantity !== undefined)
                {
                    customQuantityLabel = document.createElement("p");
                    customQuantityLabel.innerText = currItem.customQuantity;
                    customQuantityLabel.classList.add("label", "customLabel", "customQuantityLabel");
                    customQuantityLabel.hidden =  !currItem.isSelected;
                    $(customQuantityLabel).on("click", () =>
                    {
                        itemQuantityInput.trigger("select");
                    });

                    // starts less visible since item is selected and has a custom quantity
                    if(currItem.isSelected)
                        quantityLabel.style.opacity = 0.5;
                }

                if(currItem.customPriceOrMultiplier !== undefined)
                {
                    customPriceLabel = document.createElement("p");
                    customPriceLabel.innerHTML = formatItemPriceLabel(currItem.customPriceOrMultiplier); // using innerHTML so that coin image is shown
                    customPriceLabel.classList.add("label", "customLabel", "customPriceLabel");
                    customPriceLabel.hidden =  !currItem.isSelected;
                    $(customPriceLabel).on("click", () =>
                    {
                        itemPriceOrMultiplierInput.trigger("select");
                    });

                    // starts less visible since item is selected and has a custom price/mult
                    if(currItem.isSelected)
                        priceLabel.style.opacity = 0.5;
                }
            }

            tableCell.appendChild(image);
            tableCell.appendChild(quantityLabel);
            tableCell.appendChild(priceLabel);
            if(customQuantityLabel)
                tableCell.appendChild(customQuantityLabel);
            if(customPriceLabel)
                tableCell.appendChild(customPriceLabel);

            tableRow.appendChild(tableCell);
        }

        itemTable.append(tableRow);
    }

    // I don't want to call this every time, since I feel like it slows down everything (I instead only call it when relevant things resize [items per row count, window size, bottom text])
    // rescaleScreenshotRegion();
}

function formatItemPriceLabel(priceOrMultiplier)
{
    const priceStr = String(priceOrMultiplier);
    const priceStrTrimmed = priceStr.trim();
    return priceOrMultiplier + (!priceStrTrimmed.length || priceStrTrimmed.endsWith('x') ? "" : `<img class="coin" src="${coinImageUrl}">`);
}


function copyImageToClipboard()
{
    if(isActivelyCopyingImage)
        return;
    isActivelyCopyingImage = true;

    const createdBy = document.createElement("p");
    // for those of you reading this, I would appreciate if this doesn't get removed from the generated image
    createdBy.innerText = "jjcuber.github.io/hdig"; // used to say, "Tool Created by JJCUBER"
    createdBy.classList.add("watermark");
    if(!$(".watermark").length) // only append if the watermark always visible on screen didn't get removed
        screenshotRegion.append(createdBy);

    copyImageLoadingWheel.prop("hidden", false); // show loading wheel
    screenshotRegion[0].style.transform = ""; // temporarily remove screenshot region scaling so that image isn't messed up
    itemsPerRowSlider.prop("disabled", true); // temporarily disable items per row slider

    let screenshotBlob;
    let clipboardWrittenPromise;
    // In order for copying an image to clipboard on iOS to work, you HAVE to effectively do it directly in the click (more accurately, pointerup) event; this means that having some promises .then()'d is not "acceptable": https://stackoverflow.com/questions/65356108/how-to-use-clipboard-api-to-write-image-to-clipboard-in-safari  AND  https://stackoverflow.com/questions/62327358/javascript-clipboard-api-safari-ios-notallowederror-message  AND  https://webkit.org/blog/10247/new-webkit-features-in-safari-13-1/
    if(isRunningIOS())
    {
        clipboardWrittenPromise = navigator.clipboard.write(
            [new ClipboardItem(
                {
                    "image/png":
                        (async () =>
                        {
                            // need to run a second time on iOS (it sounds like just returning the .toBlob call and .then()'ing it doesn't work based on https://github.com/bubkoo/html-to-image/issues/52#issuecomment-1255708420 , so that's why I'm awaiting it here [I don't think that would really be all so different from just returning and calling .then, but I will just do it like this since it seems to work])
                            // TODO -- it sounds like this might also happen with safari on mac occasionally?  I might might also want to check for the browser being safari.
                            await htmlToImage.toBlob(screenshotRegion[0]);
                            let blob = await htmlToImage.toBlob(screenshotRegion[0]);

                            screenshotBlob = blob; // I'm pretty sure this has to be done separately, otherwise iOS gets mad (probably due to using a variable of outer scope that is "tainted")

                            return blob;
                        })()
                }
            )]
        );
    }
    else // not iOS
    {
        // htmlToImage.toBlob(..., {canvasWidth: ..., canvasHeight: ..., width: ..., height: ...}) // there are options for canvas Width/Height, along with node's Width/Height, but they aren't really what I'm looking for (zooming out far on the page itself still modifies the scaling of everything)
        clipboardWrittenPromise = htmlToImage.toBlob(screenshotRegion[0])
            .then(blob => screenshotBlob = blob) // stores the blob in case the error is caught later (had to separate this since firefox doesn't have a ClipboardItem at all; the screenShot = blob code would never get parsed and cause the failed copy overly to never show)
            .then(blob => new ClipboardItem({"image/png": blob}))
            .then(clipboardItem => navigator.clipboard.write([clipboardItem]));
    }

    clipboardWrittenPromise
        .then(createSuccessfulCopyNotification)
        .catch(e =>
        {
            console.log("Unable to generate image and/or copy it to clipboard --", e);

            createFailedCopyNotification();

            // show failed copy overlay if the screenshot was successfully generated
            if(screenshotBlob)
            {
                failedCopyOverlay.imageHolder[0].src = window.URL.createObjectURL(screenshotBlob);


                // shows the failed copy overlay

                failedCopyOverlay.overlay.prop("hidden", false);
                // disables scrolling the main page and removes the scrollbar from the side while the settings button is focused ( https://stackoverflow.com/questions/9280258/prevent-body-scrolling-but-allow-overlay-scrolling )
                $("html, body").css("overflow-y", "hidden");
                // prevents the screenshot region from shifting over to the right due to the scrollbar now missing ( https://stackoverflow.com/questions/1417934/how-to-prevent-scrollbar-from-repositioning-web-page and https://css-tricks.com/elegant-fix-jumping-scrollbar-issue/ and https://aykevl.nl/2014/09/fix-jumping-scrollbar )
                screenshotRegion.css("margin-right", "calc(100vw - 100%)");
            }
        })
        .finally(() =>
        {
            $(createdBy).remove();
            isActivelyCopyingImage = false;

            copyImageLoadingWheel.prop("hidden", true);
            rescaleScreenshotRegion(); // restore screenshot region's scaling
            itemsPerRowSlider.prop("disabled", false);
        });
}

function copyAsTextListToClipboard()
{
    const itemStrs = [];

    const format = textListFormatInput.val();
    const itemsSortedDescending = [...items.values()].sort((item1, item2) => item2.quantity - item1.quantity);
    for(let item of itemsSortedDescending)
        itemStrs.push(formatTextListItem(format, item));

    const textList = itemStrs.join(textListSeparatorRadios[textListSeparatorSelectedRadio].value);
    navigator.clipboard.writeText(textList)
        .then(createSuccessfulCopyNotification)
        //.catch(e => console.log(e));
        .catch(console.log);
}

// maybe include Item somewhere in this function name
function getMaxPrice(itemNameTitleSnakeCase)
{
    // the custom item names get mapped back to themselves when getting the title snake case list, so they are in their "normal" form already at this point
    if(customItemNames.has(itemNameTitleSnakeCase))
        return Promise.resolve(NaN);

    const properPageName = handleSpecialPageNames(itemNameTitleSnakeCase);
    const url = "https://hayday.fandom.com/api.php?" +
        new URLSearchParams({
            origin: "*",
            action: "parse",
            page: properPageName,
            format: "json",
            prop: "text", // this makes it so it only fetches the text portion; I might want to swap over to the properties portion instead?  TODO -- look more into this.
        });

    return fetch(url)
        .then(response => response.json())
        .then(json => json.parse.text["*"])
        .then(html =>
        {
            // const priceRange = $(html).find("aside.portable-infobox span[title='Coin(s)']").first().parent().text();
            const priceRange = $(html).find("aside.portable-infobox div[data-source='price']").children().text();
            const maxPrice = parseInt(priceRange.split(" to ")[1].replaceAll(",", "")); // parseInt doesn't handle separators
            console.log(itemNameTitleSnakeCase, "max price:", maxPrice);
            return maxPrice;
        }).catch(e =>
        {
            console.log(e);
            console.log(itemNameTitleSnakeCase, "max price:", NaN);

            return NaN;
        });
}

// Some hay day wiki url's have special characters and/or differ from the normal in-game names of items; the _ isn't really needed since the api used for getting the site "normalizes" the input
// I was contemplating using the api for query with search, but I don't want to risk getting the wrong page/item price for a given item
const specialPageNameMapping = new Map([
    ["Shepherds_Pie", "Shepherd's_Pie"],
    ["Caffe_Latte", "Caffè_Latte"],
    ["Caffe_Mocha", "Caffè_Mocha"]
]);
function handleSpecialPageNames(itemName)
{
    return specialPageNameMapping.get(itemName) ?? itemName;
}

async function ensureItemsHaveMaxPriceSet()
{
    let shouldSave = false;
    for(let item of items.values())
    {
        // conversion to JSON using stringify makes NaN become null, so I am adding it back here; this is to ensure any calculations with this value yield NaN, instead of something like 0 (null*5 === 0)
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
        // https://stackoverflow.com/questions/21896792/force-json-stringify-to-emit-nan-infinity-or-js-json-lib-that-does-so
        if(item.maxPrice === null)
        {
            item.maxPrice = NaN;
            continue;
        }
        if(item.maxPrice !== undefined)
            continue;

        item.maxPrice = await getMaxPrice(item.name);
        shouldSave = true;

        // updates the total price along the way if currently in price calculation mode (I'm doing this instead of only doing it once at the end so that the user can see the price updating as it gets loaded)
        // TODO -- I don't think I need || shouldShow... here currently, though I might want/need it if I allow for persistent selections at some point
        if(getIsInPriceCalculationMode() || getIsPriceShownInScreenshot())
            updateTotalPrice();
    }

    // I don't foresee any issues with this randomly saving (since this async function is called synchronously to prevent the page from getting stuck while this function executes) because any modification to the items elsewhere would ... never mind
    // this might cause issues, since it could save while in the middle of modifying an item abbreviation; if the user never "commits" these changes themself by closing out of the site (which might prevent the change event from occurring?), then some partially modified state would be saved randomly from this function; it might just be best to have this be redone each time the site loads until the user modifies something themself which forces a save all.
    // if(shouldSave)
        // saveAllToLocalStorage();


    // the solution is to only save the items, since items don't carry any intermediate state (any modification to items is immediately saved to local storage)
    if(shouldSave)
        saveItemsToLocalStorage();
}


function formatTextListItem(format, item)
{
    return format.replaceAll("{{name}}", item.getHumanReadableName())
        .replaceAll("{{quantity}}", item.quantity)
        .replaceAll("{{price}}", item.priceOrMultiplier);
}


function calculateTotalSelectedPrice()
{
    let total = 0;
    let equations = [];
    // TODO -- I should instead filter this BEFORE sorting (doesn't change anything functionally, it's just more performant that way)
    // we go through it in quantity descending order to make the equation be in the same order as the items in the grid
    // TODO -- now that this function gets called from updateItemLayout() whenever showing price in screenshot is enabled, I should probably be caching itemsSortedDescending
    // NOTE: this sorts by descending so that the price gets calculated in the same order as it is displayed (this is important for both the order of the generated price equation and for the order in which warning/error messages occur and "halt" the calculation)
    const itemsSortedDescending = [...items.values()].sort((item1, item2) => item2.quantity - item1.quantity);
    let message, isError = false;
    for(let item of itemsSortedDescending)
    {
        if(!item.isSelected)
            continue;

        let [itemTotalPrice, equation, error, warning] = item.calculateTotalPrice();

        // this is always done since it'll make sure that the total becomes NaN if there is an error
        total += itemTotalPrice;

        // should push the current equation, even if it causes an error below (so that the user can see where in the equation it happened)
        equations.push(equation);

        if(error)
        {
            console.log(error);

            message = error;
            isError = true;
            break;
        }

        if(warning)
        {
            console.log(warning);

            // only want to show first warning
            message ??= warning;
        }
    }

    const hasMessage = message !== undefined;
    if(hasMessage)
    {
        totalSelectedPriceMessageHolder.text(message);
        totalSelectedPriceMessageHolder.css("color", isError ? "red" : "purple");
    }
    totalSelectedPriceMessageHolder.prop("hidden", !hasMessage);

    totalSelectedPriceEquationHolder.text(equations.join(" + "));

    return total;
}

// calculates the total price of ALL items, selected or not (does not modify the price calculation area's message holder stuff)
function calculateTotalPrice()
{
    let total = 0;
    // TODO -- I should instead filter this BEFORE sorting (doesn't change anything functionally, it's just more performant that way)
    // we go through it in quantity descending order to make the equation be in the same order as the items in the grid
    // TODO -- now that this function gets called from updateItemLayout() whenever showing price in screenshot is enabled, I should probably be caching itemsSortedDescending
    // Technically, this doesn't need to sort by descending, since unlike the function which calculates total for the SELECTED price, this one is doing it for all; if an error occurs, the outcome of the values will be NaN regardless of order (the only thing that will be different is what gets logged in the console in the event of an error)
    const itemsSortedDescending = [...items.values()].sort((item1, item2) => item2.quantity - item1.quantity);
    for(let item of itemsSortedDescending)
    {
        let [itemTotalPrice, equation, error, warning] = item.calculateTotalPrice(true); // ignore custom values

        // this is always done since it'll make sure that the total becomes NaN if there is an error
        total += itemTotalPrice;

        if(error)
        {
            console.log(error);
            break;
        }
    }

    return total;
}

// TODO -- it might be better to check whether in price calculation mode here (and/or if price is shown in the screenshot) instead of everywhere before calling this function, though that might be slower in scenarios where I have the state (of whether being in price calculation mode or not) cached.
function updateTotalPrice()
{
    const totalSelectedPrice = calculateTotalSelectedPrice();
    const totalSelectedPriceFormatted = getLocaleString(totalSelectedPrice);

    // hasn't loaded yet
    if(!priceCalculationItem)
        return;

    const totalSelectedPriceInItems = +(totalSelectedPrice / priceCalculationItem.maxPrice).toFixed(2); // the unary + converts it back to a number, removing trailing zeroes
    const totalSelectedPriceInItemsFormatted = getLocaleString(totalSelectedPriceInItems);

    const selectedCount = getSelectedItemCount();
    const selectedCountFormatted = getLocaleString(selectedCount);

    const totalSelectedPriceHTML = `${totalSelectedPriceFormatted}<img src="${coinImageUrl}" style="width: 14px; height: 14px;"><span style="display: inline-block; width: 10px;"></span>${totalSelectedPriceInItemsFormatted}<img src="${priceCalculationItem.url}" style="width: 14px; height: 14px;"><span style="display: inline-block; width: 10px;"></span>(${selectedCountFormatted} item${selectedCount === 1 ? "" : "s"})`;

    const isInPriceCalculationMode = getIsInPriceCalculationMode();

    if(isInPriceCalculationMode)
        totalSelectedPriceHolder.html(totalSelectedPriceHTML);

    if(getIsPriceShownInScreenshot())
    {
        if(!isInPriceCalculationMode && shouldShowTotalInNormalMode)
        {
            const totalPrice = calculateTotalPrice();
            const totalPriceFormatted = getLocaleString(totalPrice);

            const totalPriceInItems = +(totalPrice / priceCalculationItem.maxPrice).toFixed(2); // the unary + converts it back to a number, removing trailing zeroes
            const totalPriceInItemsFormatted = getLocaleString(totalPriceInItems);

            const itemCount = getTotalItemCount();
            const itemCountFormatted = getLocaleString(itemCount);

            const totalPriceHTML = `${totalPriceFormatted}<img src="${coinImageUrl}" style="width: 14px; height: 14px;"><span style="display: inline-block; width: 10px;"></span>${totalPriceInItemsFormatted}<img src="${priceCalculationItem.url}" style="width: 14px; height: 14px;"><span style="display: inline-block; width: 10px;"></span>(${itemCountFormatted} item${itemCount === 1 ? "" : "s"})`;
            screenshotPriceHolder.html(totalPriceHTML);
        }
        else
            screenshotPriceHolder.html(totalSelectedPriceHTML);
    }
}


function getIsInPriceCalculationMode()
{
    return !totalSelectedPriceArea.is("[hidden]");
}

function getIsPriceShownInScreenshot()
{
    // TODO -- for this and other checkbox-related settings, should I be looking at the settings themselves for the state of things, or should I be looking at the elements that are set as visible, hidden, etc. like what I do right here?
    return !screenshotPriceHolder.prop("hidden");
}


function setSelectedState(item, cell, isSelected)
{
    item.isSelected = isSelected;

    // TODO -- classList.toggle() is a thing, maybe use this instead of the if/else?  toggle can either toggle based on whether the class is on the element or based on whether the second parameter passed is true.  https://developer.mozilla.org/en-US/docs/Web/API/DOMTokenList/toggle
    if(isSelected)
        cell.classList.add("selected");
    else
        cell.classList.remove("selected");

    const cellSelector = $(cell);
    cellSelector.find(".customLabel").prop("hidden", !isSelected);

    // make quantity/price less visible when this item is selected and has a custom value
    cellSelector.find(".quantityLabel").css("opacity", isSelected && item.customQuantity !== undefined ? 0.5 : 1);
    cellSelector.find(".priceLabel").css("opacity", isSelected && item.customPriceOrMultiplier !== undefined ? 0.5 : 1);
}

function setSelectedStateAll(items, cells, isSelected)
{
    for(let item of items)
        item.isSelected = isSelected;

    for(let cell of cells)
    {
        if(isSelected)
            cell.classList.add("selected");
        else
            cell.classList.remove("selected");

        $(cell).find(".customLabel").prop("hidden", !isSelected);
    }
}


async function prepareAllItemNames()
{
    const itemNames = await getAllItemNames();

    const prepared = [];
    for(let itemName of itemNames)
        prepared.push(fuzzysort.prepare(itemName));

    preparedItemNames = prepared;
}

// gotten from https://hayday.fandom.com/wiki/Supplies (if I got the images for these the same way as I did for everything else, there would be a ton of building images listed as items)
const suppliesNames = ["Axe", "Dynamite", "Saw", "Shovel", "TNT Barrel", "Pickaxe", "Bolt", "Brick", "Duct Tape", "Hammer", "Hand Drill", "Nail", "Paint Bucket", "Plank", "Screw", "Stone Block", "Tar Bucket", "Wood Panel", "Land Deed", "Mallet", "Map Piece", "Marker Stake"];
// extraneous "item"/image names (due to how the item names are fetched) that shouldn't be included; "Honey Mask" is a duplicate of "Honey Face Mask"
const nameBlacklist = new Set(["Chicken Feed", "Cow Feed", "Pig Feed", "Sheep Feed", "Red Lure", "Green Lure", "Blue Lure", "Purple Lure", "Gold Lure", "Fishing Net", "Mystery Net", "Goat Feed", "Lobster Trap", "Duck Trap", "Honey Mask", "Field", "Apple Tree", "Shop Icon", "Coins", "Experience", "Caffè Latte", "Caffè Mocha"]);
async function getAllItemNames()
{
    const fetchPortion = (pageName) =>
    {
        const url = "https://hayday.fandom.com/api.php?" +
            new URLSearchParams({
                origin: "*",
                action: "parse",
                page: pageName,
                format: "json",
                prop: "images", // this makes it so it only fetches the images portion
            });

        return fetch(url)
            .then(response => response.json())
            .then(json => json.parse.images)
            .then(images => images.map(image => image.split(".png")[0].replaceAll("_", " ")));
    };

    const productNames = await fetchPortion("Products");
    const cropNames = await fetchPortion("Crops");
    const animalProductNames = await fetchPortion("Animal_Goods");

    // concat it all together and include custom item names after filtering (just in case there ends up being overlap at some point in the future)
    return productNames.concat(cropNames, animalProductNames, suppliesNames).filter(name => !nameBlacklist.has(name)).concat([...customItemNames.values()]);
}

function updateFuzzyMatches(itemInput, fuzzyMatchesHolder)
{
    // don't want the list of matches popping up when the user is trying to select/deselect items (this only applies to the item name field, not the price calculation item field in settings)
    // also don't want to continue if the item names haven't been prepared yet; I could easily set a flag for this case and just call this function again when the prepared items are completely set up, but that would have an extra edge case of whether the name input is still focused (ultimately, the item names should get loaded and prepared quite quickly, so the user shouldn't really run into this in practice)
    if((itemInput === itemNameInput && getIsInPriceCalculationMode()) || !preparedItemNames)
        return;

    const matches = fuzzysort.go(itemInput.val(), preparedItemNames, {limit: 10});

    const matchHTMLs = [];
    let i = 0;
    for(let match of matches)
    {
        i++;

        const div = document.createElement("div");

        const button = document.createElement("button");
        button.tabIndex = -1;
        button.innerHTML = fuzzysort.highlight(match, "<b style='color: orange;'>", "</b>");
        $(button).on("mousedown", {itemName: match.target}, (event, customParams) =>
        {
            itemInput.val(event.data.itemName);
            // want to trigger a change immediately for the price calculation item field
            // (I have noticed that this already gets triggered automatically if the user has manually typed anything before physically clicking on one of the buttons; however, it does not trigger if the user just continues to sequentially select multiple fuzzy matches without physically editing the text in between said clicks.  As such, this manual trigger is required even though it sometimes causes a double trigger of the change event [which shouldn't cause any issues].)
            if(itemInput === priceCalculationItemInput)
                itemInput.trigger("change");

            // need to wait for the mouseup event in order to refocus/reselect the input field (using .one to make sure it only happens once, and using the document as the object to ensure this occurs no matter where on the screen the mouseup happens)
            // TODO -- I need to standardise all of my arrow functions; particularly, I need to decide whether to always include the () even for single parameter, and I need to determine whether it is a good idea to have arrow functions like this that are a single line (without {}) which calls a function (I don't know how "proper" this is, and it could easily lead to accidentally forgetting the () =>, causing it to misbehave)
            // TODO -- should I keep the matches empty after the user selects one (until they start typing again)?
            if(!customParams || !customParams.usedKeyboard) // don't want to do this if the user selected a match using the keyboard via 1-9,0
                // This must be applied to every element due to how events bubble up (if you release your mouse on an item cell after clicking down on a fuzzy match, it will trigger the item's events first before bubbling/propagating up; this means that the only solution is to put the handler on every element, stop propogation, and cancel all the remaining events added via this "namespace" (.fuzzyMatchClick)).  Unfortunately, managing to click the border of an item cell on the mouseup event will end up executing that first, likely do to having same priority but having different event added order (this event is added after).
                // TODO -- I might be able to fix this by storing the values for all 3 inputs and just modify it in my event listener below, which means that I would want to go back to using $(document) so that it has the least specificity (which means it will execute last, reverting all the values to normal).
                $("*").one("mouseup.fuzzyMatchClick", (e) =>
                {
                    if(shouldFocusQuantityOnAutocomplete && itemInput === itemNameInput)
                        itemQuantityInput.trigger("select");
                    else
                        itemInput.trigger("focus");
                    e.stopPropagation();

                    $("*").off(".fuzzyMatchClick");
                });
            else if(shouldFocusQuantityOnAutocomplete && itemInput === itemNameInput)
                itemQuantityInput.trigger("select");
        });

        const p = document.createElement("p");
        p.innerText = i === 10 ? 0 : i;


        div.appendChild(button);
        div.appendChild(p);

        matchHTMLs.push(div);
    }

    fuzzyMatchesHolder.empty();
    fuzzyMatchesHolder[0].append(...matchHTMLs);
}


function createSuccessfulCopyNotification()
{
    let notification = document.createElement("p");
    notification.innerText = "Successfully Copied!";
    notification.classList.add("notification", "notificationSuccess");
    $(notification).on("animationend", notification.remove);
    document.body.appendChild(notification);
}

function createFailedCopyNotification()
{
    let notification = document.createElement("p");
    notification.innerText = "Failed to Copy!";
    notification.classList.add("notification", "notificationFail");
    $(notification).on("animationend", notification.remove);
    document.body.appendChild(notification);
}


// TODO -- I might want to eventually be rescaling the cells, though that would be a lot of work to modify all the css
function rescaleScreenshotRegion()
{
    // If the user starts scrolling, zooming in, etc, don't want to rescale the screenshot region (I noticed this happening if a user on iOS starts scrolling in such a way where the address bar grows in size [triggering window resize])
    if(isActivelyCopyingImage)
        return;

    // I take the min of these to ensure that everything always stays on screen (it takes into account both a longer bottom text and what the width would be if all items were in the table)
    const heuristicFactor = document.documentElement.clientWidth / ((itemsPerRow + 1) * 110); // estimated width of table with all items in row filled in
    const actualFactor = 0.9 * document.documentElement.clientWidth / screenshotRegion.width(); // actual calculated width of table (including bottom text)

    const scaleFactor = Math.min(1, heuristicFactor, actualFactor); // 1 is included in the list of mins because I don't want to ever scale up, only down (if needed)
    screenshotRegion[0].style.transform = `scale(${scaleFactor})`;
}

function getSelectedItemCount()
{
    let count = 0;
    for(let item of [...items.values()])
    {
        if(item.isSelected)
            count += item.customQuantity ?? item.quantity;
    }

    return count;
}

function getTotalItemCount()
{
    let count = 0;
    for(let item of [...items.values()])
        count += item.quantity; // ignore custom quantities

    return count;
}


/* -------- scripts/Settings.js -------- */
function setUpAbbreviationMappingTable()
{
    for(let [abbreviation, abbreviationExpanded] of abbreviationMapping)
        addAbbreviationMappingTableRow(abbreviation, abbreviationExpanded);

    ensureExtraAbbreviationMappingTableRow();
}

function addAbbreviationMappingTableRow(abbreviation, abbreviationExpanded)
{
    const abbreviationTableRow = document.createElement("tr");

    const abbreviationCell = document.createElement("td");
    const abbreviationExpandedCell = document.createElement("td");

    const abbreviationInput = document.createElement("input");
    const abbreviationInputSelector = $(abbreviationInput);
    abbreviationInputSelector.on("change", handleAbbreviationChange);
    abbreviationInput.type = "text";
    abbreviationInput.style.maxWidth = "8em";
    abbreviationInput.value = abbreviation;
    abbreviationInput.dataset.previousValue = abbreviation;

    const abbreviationExpandedInput = document.createElement("input");
    const abbreviationExpandedInputSelector = $(abbreviationExpandedInput);
    abbreviationExpandedInputSelector.on("change", handleAbbreviationChange);
    abbreviationExpandedInput.type = "text";
    abbreviationExpandedInput.style.maxWidth = "8em";
    abbreviationExpandedInput.value = abbreviationExpanded;
    // abbreviationExpandedInput.dataset.previousValue = abbreviationExpanded;

    // TODO -- important: not relevant here, but whenever the callback function for a jquery event returns false, this automatically causes event.stopPropagation() and event.preventDefault() to be called ( said in https://api.jquery.com/on/ and  https://stackoverflow.com/questions/2457246/jquery-click-function-exclude-children )

    // make clicking the border/cell itself still focus the relevant input
    // .target is where the event originated from/got triggered from, and .currentTarget is where the current event callback is attached to (so if the user clicks in the input field, the target is the input field, but the current target is the td, meaning I don't need to trigger focus: https://stackoverflow.com/questions/10086427/what-is-the-exact-difference-between-currenttarget-property-and-target-property )
    $(abbreviationCell).on("click", (e) =>
    {
        // only need to focus if the cell is what was actually clicked on (target is what was clicked on [might be input or td], current target is what this callback is binded to [td])
        if(e.target === e.currentTarget)
            abbreviationInputSelector.trigger("focus");
    });
    $(abbreviationExpandedCell).on("click", (e) =>
    {
        // only need to focus if the cell is what was actually clicked on (target is what was clicked on [might be input or td], current target is what this callback is binded to [td])
        if(e.target === e.currentTarget)
            abbreviationExpandedInputSelector.trigger("focus");
    });


    abbreviationCell.appendChild(abbreviationInput);
    abbreviationExpandedCell.appendChild(abbreviationExpandedInput);

    abbreviationTableRow.appendChild(abbreviationCell);
    abbreviationTableRow.appendChild(abbreviationExpandedCell);

    abbreviationMappingTable.append(abbreviationTableRow);
}

function handleAbbreviationChange(event)
{
    const previousValue = event.target.dataset.previousValue;

    const row = $(event.target).closest("tr");
    const cells = row.find("input");
    const abbreviation = cells.eq(0);

    if(!abbreviation.val().length)
    {
        removeAbbreviation(previousValue);
        row.remove();

        ensureExtraAbbreviationMappingTableRow();

        return;
    }
    const abbreviationExpanded = cells.eq(1);

    abbreviation.val(abbreviation.val().trim().toLowerCase());
    abbreviationExpanded.val(abbreviationExpanded.val().trim().toLowerCase());

    updateAbbreviation(previousValue, abbreviation.val(), abbreviationExpanded.val());

    abbreviation[0].dataset.previousValue = abbreviation.val();

    ensureExtraAbbreviationMappingTableRow();
};


function removeAbbreviation(abbreviation)
{
    abbreviationMapping.delete(abbreviation);

    saveAllToLocalStorage();
}

function updateAbbreviation(oldAbbreviation, newAbbreviation, abbreviationExpanded)
{
    abbreviationMapping.set(newAbbreviation, abbreviationExpanded);

    if(oldAbbreviation !== newAbbreviation)
        removeAbbreviation(oldAbbreviation);
    else
        saveAllToLocalStorage(); // removeAbbreviation() handles saving when called; no need to do it twice in that case
}


function ensureExtraAbbreviationMappingTableRow()
{
    const lastRow = abbreviationMappingTable.find("tr").last();
    const abbreviation = lastRow.find("input").first();

    if(!abbreviation.length || abbreviation.val().length)
        addAbbreviationMappingTableRow("", "");
}

// TODO -- double check to make sure that there are no issues arising when in price calculation mode while importing
function exportAll()
{
    let blob = new Blob([JSON.stringify(JSON.stringify(localStorage))], {type: "application/json"}); // need to do it twice to get double quotes properly escaped

    let aElement = document.createElement("a");
    aElement.href = URL.createObjectURL(blob);
    aElement.download = `Full Export -- ${(new Date()).toISOString()}.json`;
    aElement.hidden = true;
    document.body.appendChild(aElement);

    aElement.click();
    aElement.remove();
}

function importAll(jsonBlob)
{
    const json = JSON.parse(JSON.parse(jsonBlob));
    // TODO -- should I be wiping local storage entirely before doing this?  (Basically, should I force all "missing" settings from this imported json to be defaulted to whatever value it should have, or should I leave those missing settings the same as how they currently are?)
    for(let [key, value] of Object.entries(json))
        localStorage.setItem(key, value);

    loadAllFromLocalStorage();
    updateItemLayout();
}

// Both settings directly pertaining to item lists are excluded since it is confusing to have them also be tied to item lists.
const excludeFromItemLists = ["activeItemList", "itemLists", "includeSettingsInItemList", "copyCurrentItemsFromItemList", "lastUsedVersion", "v2.14_backup"];
function createItemListObject(shouldIncludeItems)
{
    let obj = {};
    if(shouldIncludeSettingsInItemList)
    {
        // grab everything (other than excluded)
        obj = {...localStorage};
        for(let key of excludeFromItemLists)
            delete obj[key];
    }
    // grab items if allowed
    obj.items = shouldIncludeItems ? localStorage.items : JSON.stringify([]);

    return obj;
}

function createNewItemList(name)
{
    const obj = createItemListObject(shouldCopyCurrentItemsFromItemList || name === "Default");

    activeItemList = name;
    deleteItemListButton.prop("disabled", activeItemList === "Default");

    const option = new Option(activeItemList);
    itemListDropdown.append(option);
    $(option).prop("selected", true);

    itemLists.set(activeItemList, obj);
}

function storeItemList()
{
    const obj = createItemListObject(true);
    itemLists.set(activeItemList, obj);

    saveAllToLocalStorage();
}

function loadItemList()
{
    // Need to save first to make sure information on the active item list is up to date (including the data within itemLists itself).
    saveAllToLocalStorage();

    // update local storage where relevant
    const obj = itemLists.get(activeItemList);
    for(let key of Object.keys(obj))
        localStorage[key] = obj[key];

    // load in changes made to local storage (this also makes the Create button disabled, as desired)
    loadAllFromLocalStorage();
    updateItemLayout();
}


/* -------- scripts/Persist.js -------- */
function loadAllFromLocalStorage()
{
    const sItems = localStorage.getItem("items");
    if(sItems)
    {
        // converts each "object" back into an object of type Item (not sure if I really need to do this)
        let kvps = JSON.parse(sItems);
        for(let i in kvps)
            kvps[i][1] = Object.assign(new Item(), kvps[i][1]);
        items = new Map(kvps);
    }

    const sIncludeSettingsInItemList = (localStorage.getItem("includeSettingsInItemList") ?? "true") === "true"; // default to true
    shouldIncludeSettingsInItemList = sIncludeSettingsInItemList;
    includeSettingsInItemListCheckBox.prop("checked", sIncludeSettingsInItemList);

    const sCopyCurrentItemsFromItemList = (localStorage.getItem("copyCurrentItemsFromItemList") ?? "false") === "true"; // default to false
    shouldCopyCurrentItemsFromItemList = sCopyCurrentItemsFromItemList;
    copyCurrentItemsFromItemListCheckBox.prop("checked", sCopyCurrentItemsFromItemList);

    activeItemList = localStorage.getItem("activeItemList") ?? "Default";
    deleteItemListButton.prop("disabled", activeItemList === "Default");

    // The item and settings for the currently selected item list should already be "active" when loading the page (they were loaded when the user selected the respective item list last time, or if there is no item list yet, then what they have loaded/active is what is created as "Default").
    // I've decided to treat it kind of as transactions; when a new item list is selected, the active main items and settings are stored into the previously selected item list, then the new item list is loaded.  This makes the most sense since it avoids issues with things related to needing to only save items to localStorage in async functions.
    const sItemLists = localStorage.getItem("itemLists");
    if(sItemLists)
    {
        let kvps = JSON.parse(sItemLists);
        itemLists = new Map(kvps);
    }
    itemListDropdown.empty();
    for(let name of itemLists.keys())
    {
        const option = new Option(name);
        itemListDropdown.append(option);
        if(activeItemList === name)
            $(option).prop("selected", true);
    }
    if(!itemLists.has("Default"))
        createNewItemList("Default");
    // The input for creating an item list starts empty; if one of the item lists is named the empty string (which is allowed), then the button needs to start disabled.
    // createItemListButton.prop("disabled", itemLists.has(""));
    // This should instead use the actual value of the input field since this function can be called by import all while this field is populated with something other than ""
    createItemListButton.prop("disabled", itemLists.has(createItemListInput.val()));

    const sAbbreviationMapping = localStorage.getItem("abbreviationMapping");
    if(sAbbreviationMapping)
        abbreviationMapping = new Map(JSON.parse(sAbbreviationMapping));

    const sBottomText = localStorage.getItem("bottomText") ?? "Partials Accepted"; // just like the abbreviations, I give a "reasonable" default
    bottomTextSettingInput.val(sBottomText);
    // must use innerText to preserve newline; jquery .text() doesn't (.innerText is used instead of .text() in all bottom text-related code)
    // I could alternatively use .html(), but that would cause issues with how the user might want to format their message, such as <Partials Accepted>
    bottomText[0].innerText = sBottomText;

    // clientWidth found from https://stackoverflow.com/questions/1248081/how-to-get-the-browser-viewport-dimensions
    const sItemsPerRow = localStorage.getItem("itemsPerRow") ?? Math.min(Math.floor(document.documentElement.clientWidth / 110), 8); // default up to 8 (however much fits; the exact calculation for the width a cell takes up is 8 + ct*100 + (ct-1)*10  AKA  110*ct - 2, but I rounded it slightly)
    itemsPerRowSlider.val(sItemsPerRow);
    itemsPerRowLabel.text(sItemsPerRow);
    itemsPerRow = parseInt(sItemsPerRow); // must "type cast" since localstorage doesn't retain type

    textListSeparatorSelectedRadio = parseInt(localStorage.getItem("textListSeparatorSelectedRadio") ?? 0); // don't really need to do this, but it would be best to treat it as an integer/number
    const sTextListCustomSeparator = localStorage.getItem("textListCustomSeparator") ?? "";
    textListSeparatorCustomRadio.val(sTextListCustomSeparator);
    textListCustomSeparatorInput.val(sTextListCustomSeparator);

    const sTextListFormat = localStorage.getItem("textListFormat") ?? "{{quantity}} {{name}} ({{price}})"; // default format on right
    textListFormatInput.val(sTextListFormat);

    const sPriceCalculationItem = localStorage.getItem("priceCalculationItem") ?? "Diamond Ring"; // default to rings
    priceCalculationItemInput.val(sPriceCalculationItem);

    // TODO -- finish up "Selections category and add it here; might want to combine thing right below this into this"

    const sShowPriceInScreenshot = (localStorage.getItem("showPriceInScreenshot") ?? "true") === "true"; // default to true; localStorage only uses strings, so need to make sure to compare to "true" not true
    showPriceInScreenshotCheckBox.prop("checked", sShowPriceInScreenshot);
    screenshotPriceHolder.prop("hidden", !sShowPriceInScreenshot);
    showTotalInNormalModeCheckBox.prop("disabled", !sShowPriceInScreenshot);

    const sShowTotalInNormalMode = (localStorage.getItem("showTotalInNormalMode") ?? (sShowPriceInScreenshot ? "true" : "false")) === "true"; // default to true so long as show price in screenshot is also enabled; localStorage only uses strings, so need to make sure to compare to "true" not true
    shouldShowTotalInNormalMode = sShowTotalInNormalMode;
    showTotalInNormalModeCheckBox.prop("checked", sShowTotalInNormalMode);

    const sHidePriceOrMultiplier = (localStorage.getItem("hidePriceOrMultiplier") ?? "false") === "true"; // default to false
    shouldHidePriceOrMultiplier = sHidePriceOrMultiplier;
    hidePriceOrMultiplierCheckBox.prop("checked", sHidePriceOrMultiplier);

    const sDefaultQuantity = localStorage.getItem("defaultQuantity") ?? "1"; // default to 1; not parsing as int since I want to allow equations
    defaultQuantity = sDefaultQuantity;
    defaultQuantityInput.val(sDefaultQuantity);
    itemQuantityInput.val(sDefaultQuantity);

    const sDefaultPriceOrMultiplier = localStorage.getItem("defaultPriceOrMultiplier") ?? "5x"; // default to 5x
    defaultPriceOrMultiplier = sDefaultPriceOrMultiplier;
    defaultPriceOrMultiplierInput.val(sDefaultPriceOrMultiplier);
    itemPriceOrMultiplierInput.val(sDefaultPriceOrMultiplier);

    const sRefocusNameOnSubmit = (localStorage.getItem("refocusNameOnSubmit") ?? "true") === "true"; // default to true // TODO -- is this a good idea (default: true)?
    shouldRefocusNameOnSubmit = sRefocusNameOnSubmit;
    refocusNameOnSubmitCheckBox.prop("checked", sRefocusNameOnSubmit);

    const sFocusQuantityOnAutocomplete = (localStorage.getItem("focusQuantityOnAutocomplete") ?? "true") === "true"; // default to true // TODO -- is this a good idea (default: true)?
    shouldFocusQuantityOnAutocomplete = sFocusQuantityOnAutocomplete;
    focusQuantityOnAutocompleteCheckBox.prop("checked", sFocusQuantityOnAutocomplete);

    const sIgnoreLocale = (localStorage.getItem("ignoreLocale") ?? "false") === "true"; // default to false
    shouldIgnoreLocale = sIgnoreLocale;
    ignoreLocaleCheckBox.prop("checked", sIgnoreLocale);
}

function saveAllToLocalStorage()
{
    saveItemsToLocalStorage();

    localStorage.setItem("includeSettingsInItemList", shouldIncludeSettingsInItemList);
    localStorage.setItem("copyCurrentItemsFromItemList", shouldCopyCurrentItemsFromItemList);
    localStorage.setItem("activeItemList", activeItemList);
    localStorage.setItem("itemLists", JSON.stringify([...itemLists]));

    localStorage.setItem("abbreviationMapping", JSON.stringify([...abbreviationMapping]));
    localStorage.setItem("bottomText", bottomText[0].innerText); // must use innerText for newlines to be handled properly
    // localStorage.setItem("bottomText", bottomTextSettingInput.val()); // can just use the setting input's value instead, though maybe I should keep it consistent with the loadAll, due to the way I load it into the bottom text then into the setting
    localStorage.setItem("itemsPerRow", itemsPerRow);
    localStorage.setItem("textListSeparatorSelectedRadio", textListSeparatorSelectedRadio);
    localStorage.setItem("textListCustomSeparator", textListCustomSeparatorInput.val());
    localStorage.setItem("textListFormat", textListFormatInput.val());
    localStorage.setItem("priceCalculationItem", priceCalculationItemInput.val());

    // TODO -- finish up "Selections category and add it here; might want to combine thing right below this into this"

    localStorage.setItem("showPriceInScreenshot", showPriceInScreenshotCheckBox.prop("checked")); // TODO -- I should make my use of a separate variable vs using the checkbox directly consistent
    localStorage.setItem("showTotalInNormalMode", shouldShowTotalInNormalMode);

    localStorage.setItem("hidePriceOrMultiplier", shouldHidePriceOrMultiplier);

    localStorage.setItem("defaultQuantity", defaultQuantity);
    localStorage.setItem("defaultPriceOrMultiplier", defaultPriceOrMultiplier);

    localStorage.setItem("refocusNameOnSubmit", shouldRefocusNameOnSubmit);
    localStorage.setItem("focusQuantityOnAutocomplete", shouldFocusQuantityOnAutocomplete);
    localStorage.setItem("ignoreLocale", shouldIgnoreLocale);
}

function saveItemsToLocalStorage()
{
    localStorage.setItem("items", JSON.stringify([...items], (key, value) => Item.fieldsToOmitFromLocalStorage.has(key) ? undefined : value));
}


