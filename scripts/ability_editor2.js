const FILE_INPUT = "#ability_file";
const FILE_LOAD_BUTTON = "#ability_file_load";
const FILE_SAVE_BUTTON = "#ability_file_save";

const FORM_HOLDER = "form_holder";

const ABILITY_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "required": [
        "id",
        "name",
        "description",
        "character",
        "actionPoints",
        "quotes",
        "behaviour"
    ],
    "properties": {
        "id": {
            "$comment": "Internal ID used to refer to this attack.",
            "type": "string"
        },
        "name": {
            "$comment": "Display name of the ability.",
            "type": "string"
        },
        "description": {
            "$comment": "Display description of the ability.",
            "type": "string"
        },
        "character": {
            "$comment": "Internal ID of the character this ability belongs to.",
            "type": "string"
        },
        "quotes": {
            "type": "array",
            "items": {
                "type": "string"
            },
            "default": []
        },
        "actionPoints": {
            "$comment": "Number of Action Points the ability requires.",
            "type": "integer"
        },
        "conditions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "target": {
                        "enum": [
                            "Self",
                            "Allies",
                            "Enemies"
                        ]
                    },
                    "comparison": {
                        "type": "string"
                    }
                }
            }
        },
        "behaviour": {
            "type": "array",
            "items": {
                "$ref": ".ability_behaviour_schema.json"
            },
            "default": []
        }
    }
};
const BEHAVIOUR_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "targetting": {
            "type": "object",
            "properties": {
                "type": {
                    "enum": [
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
                },
                "amount": {
                    "type": "integer"
                }
            }
        },
        "effects": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "type": {
                        "enum": [
                            "Damage",
                            "Buff",
                            "Action_Points",
                            "Heal",
                            "Log"
                        ]
                    },
                    "amount": {
                        "type": "object",
                        "properties": {
                            "min": {
                                "type": "integer"
                            },
                            "max": {
                                "type": "integer"
                            },
                            "special": {
                                "type": "string"
                            }
                        }
                    },
                    "id": {
                        "type": "string"
                    },
                    "ignoreInjuries": {
                        "type": "boolean"
                    },
                    "accuracy": {
                        "type": "integer"
                    },
                    "quotes": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "onHit": {
                        "type": "array",
                        "items": {
                            "$ref": "#"
                        }
                    },
                    "onMiss": {
                        "type": "array",
                        "items": {
                            "$ref": "#"
                        }
                    },
                    "onCrit": {
                        "type": "array",
                        "items": {
                            "$ref": "#"
                        }
                    },
                    "onKill": {
                        "type": "array",
                        "items": {
                            "$ref": "#"
                        }
                    }
                }
            }
        }
    }
};

const BEHAVIOUR_REF = "#/definitions/behaviour"

ABILITY_SCHEMA.type = "object";
BEHAVIOUR_SCHEMA.type = "object";

ABILITY_SCHEMA.properties.behaviour.items.$ref = BEHAVIOUR_REF;
BEHAVIOUR_SCHEMA.properties.effects.items.properties.onHit.items.$ref = BEHAVIOUR_REF;
BEHAVIOUR_SCHEMA.properties.effects.items.properties.onMiss.items.$ref = BEHAVIOUR_REF;
BEHAVIOUR_SCHEMA.properties.effects.items.properties.onKill.items.$ref = BEHAVIOUR_REF;
BEHAVIOUR_SCHEMA.properties.effects.items.properties.onCrit.items.$ref = BEHAVIOUR_REF;

delete ABILITY_SCHEMA.$schema
delete BEHAVIOUR_SCHEMA.$schema

ABILITY_SCHEMA.definitions = {
    "behaviour": BEHAVIOUR_SCHEMA
};

let editor;

async function OnClickFileLoad() {
    const file = $(FILE_INPUT)[0].files[0];
    if (!file) {
        alert("No file to load");
        return;
    }

    const content = await file.text();
    const ability = JSON.parse(content);

    editor.setValue(ability);
}

function OnClickFileSave() {
    const file = $(FILE_INPUT)[0].files[0];

    const ability = editor.getValue();

    const serialized = JSON.stringify(ability);

    const fileName = file?.name ?? `${ability.id}.json`;
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
        schema: ABILITY_SCHEMA,
        theme: "spectre",
        iconlib: "spectre",
        disable_edit_json: true,
        disable_properties: true,
        form_name_root: "Ability",
        compact: true,
        no_additional_properties: true
    });
});