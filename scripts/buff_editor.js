const FILE_INPUT = "#buff_file";
const FILE_LOAD_BUTTON = "#buff_file_load";
const FILE_SAVE_BUTTON = "#buff_file_save";

const FORM_HOLDER = "form_holder";

const BUFF_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "id": {
            "$comment": "Used internally to refer to this buff",
            "type": "string"
        },
        "name": {
            "$comment": "Display name",
            "type": "string"
        },
        "description": {
            "$comment": "Display description",
            "type": "string"
        },
        "decrementType": {
            "$comment": "When to decrement the counter for this buff",
            "enum": [
                "Used",
                "End_Turn"
            ]
        },
        "decrementAmount": {
            "$comment": "How much to decrement the counter. -1 to completely remove.",
            "type": "integer"
        },
        "statChange": {
            "$comment": "If the buff changes a stat, it does it here.",
            "type": "object",
            "properties": {
                "type": {
                    "$comment": "Stat to change",
                    "enum": [
                        "Crit_Chance",
                        "Max_AP"
                    ]
                },
                "calculation": {
                    "$comment": "Calculation to perform on the stat",
                    "type": "string"
                }
            }
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
    const buff = JSON.parse(content);

    editor.setValue(buff);
}

function OnClickFileSave() {
    const file = $(FILE_INPUT)[0].files[0];

    const buff = editor.getValue();

    const serialized = JSON.stringify(buff);

    const fileName = file?.name ?? "new_buff.json";
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
        schema: BUFF_SCHEMA,
        theme: "spectre",
        iconlib: "spectre",
        disable_edit_json: true,
        disable_properties: true,
        form_name_root: "Character",
        compact: true,
        no_additional_properties: true
    });
});