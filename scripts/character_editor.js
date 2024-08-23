const FILE_INPUT = "#character_file";
const FILE_LOAD_BUTTON = "#character_file_load";
const FILE_SAVE_BUTTON = "#character_file_save";

const FORM_HOLDER = "form_holder";

const CHARACTER_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "id": {
            "$comment": "Internal ID used to refer to this character.",
            "type": "string"
        },
        "name": {
            "$comment": "Display name of the character.",
            "type": "string"
        },
        "sprite": {
            "type": "string"
        },
        "hitPoints": {
            "type": "integer"
        },
        "actionPoints": {
            "type": "integer"
        }
    }
};

let editor;

async function OnClickFileLoad() {
    const file = $(FILE_INPUT)[0].files[0];
    if (!file) {
        alert("No file to load");
        return;
    }

    const content = await file.text();
    const character = JSON.parse(content);

    editor.setValue(character);
}

function OnClickFileSave() {
    const file = $(FILE_INPUT)[0].files[0];

    const character = editor.getValue();

    const serialized = JSON.stringify(character);

    const fileName = file?.name ?? `${character.id}.json`;
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

$(() => {
    $(FILE_LOAD_BUTTON).click(OnClickFileLoad);
    $(FILE_SAVE_BUTTON).click(OnClickFileSave);

    const formHolder = document.getElementById(FORM_HOLDER);

    editor = new JSONEditor(formHolder, {
        schema: CHARACTER_SCHEMA,
        theme: "spectre",
        iconlib: "spectre",
        disable_edit_json: true,
        disable_properties: true,
        form_name_root: "Character",
        compact: true,
        no_additional_properties: true
    });
});