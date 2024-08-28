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
        "isNegative": {
            "$comment": "Whether or not the buff is considered negative.",
            "type": "boolean"
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
                        "Max_AP",
                        "Max_HP",
                        "Accuracy",
                        "Damage",
                        "Defence",
                        "Target_Weight",
                        "Disabled",
                        "Injury_Chance"
                    ]
                },
                "calculation": {
                    "$comment": "Calculation to perform on the stat",
                    "type": "string"
                }
            }
        },
        "triggers": {
            "$comment": "If the buff does something in response to an event, it does it here.",
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "trigger": {
                        "$comment": "The type of trigger",
                        "enum": [
                            "Turn_Start",
                            "Ally_Turn_Start",
                            "Enemy_Turn_Start",
                            "Self_Turn_Start",
                            "Turn_End",
                            "Ally_Turn_End",
                            "Enemy_Turn_End",
                            "Self_Turn_End",

                            "Ability_Finished",
                            "Self_Ability_Finished"
                        ]
                    },
                    "behaviours": {
                        "$comment": "What effects will occur",
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
const BEHAVIOUR_SCHEMA = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "properties": {
        "targetting": {
            "type": "object",
            "properties": {
                "entityType": {
                    "enum": [
                        "Enemy",
                        "Ally",
                        "Both"
                    ]
                },
                "chooseMode": {
                    "enum": [
                        "Manual",
                        "All",
                        "Random"
                    ]
                },
                "amount": {
                    "type": "integer"
                },
                "targetSelf": {
                    "enum": [
                        "No",
                        "Yes",
                        "Only"
                    ]
                },
                "targetDead": {
                    "enum": [
                        "No",
                        "Yes",
                        "Only"
                    ]
                },
                "condition": {
                    "type": "string"
                },
                "priority": {
                    "type": "string"
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
                            "Log",
                            "Modify_Buffs",
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
                            },
                            "critSpecial": {
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
                    "breakCap": {
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

BUFF_SCHEMA.type = "object";
BEHAVIOUR_SCHEMA.type = "object";

BUFF_SCHEMA.properties.triggers.items.properties.behaviours.items.$ref = BEHAVIOUR_REF;
BEHAVIOUR_SCHEMA.properties.effects.items.properties.onHit.items.$ref = BEHAVIOUR_REF;
BEHAVIOUR_SCHEMA.properties.effects.items.properties.onMiss.items.$ref = BEHAVIOUR_REF;
BEHAVIOUR_SCHEMA.properties.effects.items.properties.onKill.items.$ref = BEHAVIOUR_REF;
BEHAVIOUR_SCHEMA.properties.effects.items.properties.onCrit.items.$ref = BEHAVIOUR_REF;

delete BUFF_SCHEMA.$schema
delete BEHAVIOUR_SCHEMA.$schema

BUFF_SCHEMA.definitions = {
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
    const buff = JSON.parse(content);

    editor.setValue(buff);
}

function OnClickFileSave() {
    const file = $(FILE_INPUT)[0].files[0];

    const buff = editor.getValue();

    const serialized = JSON.stringify(buff);

    const fileName = file?.name ?? `${buff.id}.json`;
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