const FILE_INPUT = "#ability_file";
const FILE_LOAD_BUTTON = "#ability_file_load";
const FILE_SAVE_BUTTON = "#ability_file_save";

const ID_INPUT = "#ability_id";
const NAME_INPUT = "#ability_name";
const DESC_INPUT = "#ability_description";
const CHAR_INPUT = "#ability_character";
const AP_INPUT = "#ability_ap";

const QUOTES_CONTAINER = "#ability_quotes";
const QUOTES_INPUT = "#ability_quote";
const ADD_QUOTE_BUTTON = "#ability_add_quote";

const BASE_BEHAVIOUR_CONTAINER = "#ability_effects";
const ADD_BEHAVIOUR_BUTTON = "#add_ability_effect";

const TARGETTING_TYPES = [
    "Enemy",
    "Ally",
    "Anyone",
    "Ally_No_Self",
    "Anyone_No_Self",
    "Self",
    "All_Enemies",
    "All_Allies",
    "All",
    "All_Allies_No_Self",
    "All_No_Self",
    "Random_Ally"
]
const EFFECT_TYPES = [
    "Damage",
    "Buff",
    "Action_Points",
    "Heal"
]


function AddQuote(quote) {
    const newQuote = $("<li></li>").text(quote + " ");
    newQuote.css("font-family", "monospace");

    const removeButton = $("<button></button>").text("Remove");
    removeButton.click(() => newQuote.remove());
    newQuote.append(removeButton);

    $(QUOTES_CONTAINER).append(newQuote);
}


async function OnClickFileLoad() {
    const file = $(FILE_INPUT)[0].files[0];
    if (!file) {
        alert("No file to load");
        return;
    }

    const content = await file.text();
    const ability = JSON.parse(content);

    $(ID_INPUT).val(ability.id);
    $(NAME_INPUT).val(ability.name);
    $(DESC_INPUT).val(ability.description);
    $(CHAR_INPUT).val(ability.character);
    $(AP_INPUT).val(ability.actionPoints);

    $(QUOTES_CONTAINER).empty();
    ability.quotes.forEach(quote => AddQuote(quote));

    $(BASE_BEHAVIOUR_CONTAINER).children("div").remove();
    ability.behaviour.forEach(behaviour => {
        OnClickAddBehaviour($(ADD_BEHAVIOUR_BUTTON), behaviour);
    });
}


async function OnClickFileSave() {
    const file = $(FILE_INPUT)[0].files[0];

    const ability = {
        id: $(ID_INPUT).val(),
        name: $(NAME_INPUT).val(),
        description: $(DESC_INPUT).val(),
        character: $(CHAR_INPUT).val(),
        actionPoints: parseInt($(AP_INPUT).val())
    };

    const quotes = [];

    const children = $(QUOTES_CONTAINER).children("li");
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const quote = child.innerText.replace(/(Remove)$/, '').trim();
        quotes.push(quote);
    }
    ability.quotes = quotes;

    ability.behaviour = GetBehaviours($(BASE_BEHAVIOUR_CONTAINER));

    const serialized = JSON.stringify(ability);

    const fileName = file?.name ?? "new_ability.json";
    const myFile = new Blob([serialized], { type: 'application/json' });

    window.URL = window.URL || window.webkitURL;

    var element = document.createElement('a');
    element.setAttribute("href", window.URL.createObjectURL(myFile));
    element.setAttribute("download", fileName);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


function GetBehaviours(container) {
    const children = container.children("div");
    const behaviours = []

    for (let i = 0; i < children.length; i++) {
        const element = children[i];
        const divChildren = element.children;

        const targettingRows = divChildren[1].children[0].children;
        const targettingType = targettingRows[0].children[1].children[0].value;
        const targettingAmount = targettingRows[1].children[1].children[0].value;

        const behaviour = {}

        behaviour.targetting = {
            type: targettingType,
            amount: parseInt(targettingAmount)
        }

        const effects = []
        for (let o = 3; o < divChildren.length - 3; o++) {
            const effectContainer = divChildren[o];

            effects.push(GetEffect(effectContainer));
        }

        behaviour.effects = effects;

        behaviours.push(behaviour);
    }

    return behaviours;
}


function GetEffect(container) {
    const children = container.children;
    const mainRows = children[0].children[0].children;

    const effectType = mainRows[0].children[1].children[0].value;

    const amountRows = mainRows[1].children[0].children[1].children[0].children;
    const amountMin = amountRows[0].children[1].children[0].value;
    const amountMax = amountRows[1].children[1].children[0].value;
    const amountSpecial = amountRows[2].children[1].children[0].value;
    const amount = {
        min: parseInt(amountMin),
        max: parseInt(amountMax),
        special: amountSpecial
    }

    const effectAccuracy = parseInt(mainRows[2].children[1].children[0].value);

    const effectId = mainRows[3].children[1].children[0].value;

    const effect = {
        type: effectType,
        amount: amount,
        accuracy: effectAccuracy,
        id: effectId,
        onHit: GetBehaviours($(children[1])),
        onMiss: GetBehaviours($(children[2])),
        onCrit: GetBehaviours($(children[3])),
        onKill: GetBehaviours($(children[4]))
    }

    return effect;
}


function OnClickAddQuote() {
    const quoteInput = $(QUOTES_INPUT);

    AddQuote(quoteInput.val());
    quoteInput.val("");
}


function OnClickAddEffect(button, effect) {
    const newEffectContainer = $("<div></div>");
    newEffectContainer.css("padding", "1%");
    newEffectContainer.css("margin", "1%");
    newEffectContainer.css("border-style", "dashed");
    newEffectContainer.css("border-color", "grey");

    const formTable = $("<table></table>");
    const tableBody = $("<tbody></tbody>");

    //Row for effect type
    const effectTypeRow = $("<tr></tr>");

    const effectTypeLabelData = $("<td></td>");
    const effectTypeLabel = $("<label></label>").text("Type:");
    effectTypeLabelData.append(effectTypeLabel);

    const effectTypeInputData = $("<td></td>");
    const effectTypeInput = $("<select></select>");
    EFFECT_TYPES.forEach((effectType) => {
        const effectTypeOption = $("<option></option>").text(effectType.replaceAll("_", " "));
        effectTypeOption.attr("value", effectType);

        effectTypeInput.append(effectTypeOption);
    });
    effectTypeInputData.append(effectTypeInput);

    effectTypeRow.append(effectTypeLabelData, effectTypeInputData);

    //Row for amount
    const effectAmountRow = $("<tr></tr>");
    const effectAmountData = $("<td></td>");
    effectAmountData.attr("colspan", "2");

    const effectAmountLabel = $("<label></label>").text("Amount:");

    const amountFormTable = $("<table></table>");
    amountFormTable.css("margin-left", "5%")
    const amountTableBody = $("<tbody></tbody>");

    //Row for min
    const amountMinRow = $("<tr></tr>");

    const amountMinLabelData = $("<td></td>");
    const amountMinLabel = $("<label></label>").text("Minimum:");
    amountMinLabelData.append(amountMinLabel);

    const amountMinInputData = $("<td></td>");
    const amountMinInput = $("<input></input>");
    amountMinInput.attr("type", "number");
    amountMinInput.attr("min", "0");
    amountMinInputData.append(amountMinInput);

    amountMinRow.append(amountMinLabelData, amountMinInputData);

    //Row for max
    const amountMaxRow = $("<tr></tr>");

    const amountMaxLabelData = $("<td></td>");
    const amountMaxLabel = $("<label></label>").text("Maximum:");
    amountMaxLabelData.append(amountMaxLabel);

    const amountMaxInputData = $("<td></td>");
    const amountMaxInput = $("<input></input>");
    amountMaxInput.attr("type", "number");
    amountMaxInput.attr("min", "0");
    amountMaxInputData.append(amountMaxInput);

    amountMaxRow.append(amountMaxLabelData, amountMaxInputData);

    //Row for special
    const amountSpecialRow = $("<tr></tr>");

    const amountSpecialLabelData = $("<td></td>");
    const amountSpecialLabel = $("<label></label>").text("Special:");
    amountSpecialLabelData.append(amountSpecialLabel);

    const amountSpecialInputData = $("<td></td>");
    const amountSpecialInput = $("<input></input>");
    amountSpecialInput.attr("type", "text");
    amountSpecialInputData.append(amountSpecialInput);

    amountSpecialRow.append(amountSpecialLabelData, amountSpecialInputData);

    amountTableBody.append(amountMinRow, amountMaxRow, amountSpecialRow);
    amountFormTable.append(amountTableBody);
    effectAmountData.append(effectAmountLabel, amountFormTable);
    effectAmountRow.append(effectAmountData);

    //Row for accuracy
    const effectAccuracyRow = $("<tr></tr>");

    const effectAccuracyLabelData = $("<td></td>");
    const effectAccuracyLabel = $("<label></label>").text("Accuracy:");
    effectAccuracyLabelData.append(effectAccuracyLabel);

    const effectAccuracyInputData = $("<td></td>");
    const effectAccuracyInput = $("<input></input>");
    effectAccuracyInput.attr("type", "number");
    effectAccuracyInputData.append(effectAccuracyInput);

    effectAccuracyRow.append(effectAccuracyLabelData, effectAccuracyInputData);

    //Row for id
    const effectIRow = $("<tr></tr>");

    const effectIdLabelData = $("<td></td>");
    const effectIdLabel = $("<label></label>").text("Id to use:");
    effectIdLabelData.append(effectIdLabel);

    const effectIdInputData = $("<td></td>");
    const effectIdInput = $("<input></input>");
    effectIdInput.attr("type", "text");
    effectIdInputData.append(effectIdInput);

    effectIRow.append(effectIdLabelData, effectIdInputData);

    tableBody.append(effectTypeRow, effectAmountRow, effectAccuracyRow, effectIRow)
    formTable.append(tableBody);

    //On hit behaviours
    const onHitDiv = $("<div></div>");
    const onHitLabel = $("<label></label>").text("On Hit:");
    const addOnHitButton = $("<button></button>").text("Add on hit behaviour");
    addOnHitButton.click(() => OnClickAddBehaviour(addOnHitButton));
    onHitDiv.append(onHitLabel, addOnHitButton);

    //On miss behaviours
    const onMissDiv = $("<div></div>");
    const onMissLabel = $("<label></label>").text("On Miss:");
    const addOnMissButton = $("<button></button>").text("Add on miss behaviour");
    addOnMissButton.click(() => OnClickAddBehaviour(addOnMissButton));
    onMissDiv.append(onMissLabel, addOnMissButton);

    //On crit behaviours
    const onCritLabel = $("<label></label>").text("On Crit:");
    const onCritDiv = $("<div></div>");
    const addOnCritButton = $("<button></button>").text("Add on crit behaviour");
    addOnCritButton.click(() => OnClickAddBehaviour(addOnCritButton));
    onCritDiv.append(onCritLabel, addOnCritButton);

    //On kill behaviours
    const onKillLabel = $("<label></label>").text("On Kill:");
    const onKillDiv = $("<div></div>");
    const addOnKillButton = $("<button></button>").text("Add on kill behaviour");
    addOnKillButton.click(() => OnClickAddBehaviour(addOnKillButton));
    onKillDiv.append(onKillLabel, addOnKillButton)

    //Remove
    const removeButton = $("<button></button>").text("Remove effect");
    removeButton.css("margin-top", "1%");
    removeButton.click(() => newEffectContainer.remove());

    newEffectContainer.append(
        formTable,
        onHitDiv,
        onMissDiv,
        onCritDiv,
        onKillDiv,
        removeButton
    );

    if (effect) {
        effectTypeInput.val(effect.type);

        amountMinInput.val(effect.amount.min);
        amountMaxInput.val(effect.amount.max);
        amountSpecialInput.val(effect.amount.special);

        effectIdInput.val(effect.id);
        const acc = effect.accuracy ?? 100;
        effectAccuracyInput.val(acc);

        if (effect.onHit) {
            effect.onHit.forEach(x => OnClickAddBehaviour(addOnHitButton, x));
        }

        if (effect.onMiss) {
            effect.onMiss.forEach(x => OnClickAddBehaviour(addOnMissButton, x));
        }

        if (effect.onCrit) {
            effect.onCrit.forEach(x => OnClickAddBehaviour(addOnCritButton, x));
        }

        if (effect.onKill) {
            effect.onKill.forEach(x => OnClickAddBehaviour(addOnKillButton, x));
        }
    }

    button.before(newEffectContainer);
}


function OnClickAddBehaviour(button, behaviour) {
    const newBehaviourContainer = $("<div></div>");
    newBehaviourContainer.css("padding", "1%");
    newBehaviourContainer.css("margin", "1%");
    newBehaviourContainer.css("border-style", "solid");
    newBehaviourContainer.css("border-color", "black");

    const targettingTitle = $("<label></label>").text("Targetting:");

    const targettingTable = $("<table></table>");
    targettingTable.css("margin-left", "3%");
    const targettingTableBody = $("<tbody></tbody>");

    //Row for targetting type
    const targettingTableTypeRow = $("<tr></tr>");

    const targettingTableTypeLabelData = $("<td></td>");
    const targettingTableTypeLabel = $("<label></label>").text("Type:");
    targettingTableTypeLabelData.append(targettingTableTypeLabel);

    const targettingTableTypeInputData = $("<td></td>");
    const targettingTableTypeInput = $("<select></select>");
    TARGETTING_TYPES.forEach((targetType) => {
        const targettingTypeOption = $("<option></option>").text(targetType.replaceAll("_", " "));
        targettingTypeOption.attr("value", targetType);

        targettingTableTypeInput.append(targettingTypeOption);
    });
    targettingTableTypeInputData.append(targettingTableTypeInput);

    targettingTableTypeRow.append(targettingTableTypeLabelData, targettingTableTypeInputData);

    //Row for targetting amount
    const targettingTableAmountRow = $("<tr></tr>");

    const targettingTableAmountLabelData = $("<td></td>");
    const targettingTableAmountLabel = $("<label></label>").text("Amount:");
    targettingTableAmountLabelData.append(targettingTableAmountLabel);

    const targettingTableAmountInputData = $("<td></td>");
    const targettingTableAmountInput = $("<input></input>");
    targettingTableAmountInput.attr("type", "number");
    targettingTableAmountInputData.append(targettingTableAmountInput);

    targettingTableAmountRow.append(targettingTableAmountLabelData, targettingTableAmountInputData);

    //Add both rows
    targettingTableBody.append(targettingTableTypeRow, targettingTableAmountRow);
    targettingTable.append(targettingTableBody);

    //Effects
    const effectsLabel = $("<label</label>").text("Effects:");
    const addEffectButton = $("<button></button>").text("Add effect");
    addEffectButton.click(() => OnClickAddEffect(addEffectButton));

    //Remove
    const removeButton = $("<button></button>").text("Remove behaviour");
    removeButton.css("margin-top", "1%");
    removeButton.click(() => newBehaviourContainer.remove());

    newBehaviourContainer.append(
        targettingTitle,
        targettingTable,
        effectsLabel,
        addEffectButton,
        "<br>",
        removeButton
    );

    if (behaviour) {
        targettingTableTypeInput.val(behaviour.targetting.type);
        targettingTableAmountInput.val(behaviour.targetting.amount);

        behaviour.effects.forEach(effect => OnClickAddEffect(addEffectButton, effect));
    }

    button.before(newBehaviourContainer);
}


$(() => {
    $(FILE_LOAD_BUTTON).click(OnClickFileLoad);
    $(FILE_SAVE_BUTTON).click(OnClickFileSave);

    $(ADD_QUOTE_BUTTON).click(OnClickAddQuote);

    const baseAddBehaviourButton = $(ADD_BEHAVIOUR_BUTTON);
    baseAddBehaviourButton.click(() => OnClickAddBehaviour(baseAddBehaviourButton));
});
