(async () => {
  // --- CONFIGURE YOUR MACROS HERE ---
  const myMacros = [
    {
        "name": "+1 Risk",
        "type": "script",
        "command": "// Get all tokens currently targeted\nconst targets = game.user.targets;\n\n// Check if any tokens are targeted\nif (targets.size === 0) {\n  ui.notifications.warn(\"Please target at least one token!\");\n} else {\n  // Loop through targeted tokens\n  for (let token of targets) {\n    const actor = token.actor;\n    const currentRisk = actor.system.risk.value ?? 0;\n    \n    // Decrease risk but don't let it go below 0\n    const newRisk = Math.max(0, currentRisk + 1);\n\n    // Update the value\n    await actor.update({ \"system.risk.value\": newRisk });\n    \n    // Notification\n    ui.notifications.info(`${token.name} gains 1 Risk. (Now: ${newRisk})`);\n  }\n}",
        "img": "icons/svg/dice-target.svg",
        "author": "1UcMxAmfsWqm5yjt",
        "scope": "global",
        "folder": null,
        "flags": {},
        "_stats": {
            "compendiumSource": null,
            "duplicateSource": null,
            "exportSource": {
            "worldId": "plume",
            "uuid": "Macro.yfrdJ0Bd2j21LPTz",
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0"
            },
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0",
            "createdTime": 1772777885825,
            "modifiedTime": 1772778245889,
            "lastModifiedBy": "1UcMxAmfsWqm5yjt"
        },
        "ownership": {
            "default": 0
        }
    },
    {
        "name": "-1 Risk",
        "type": "script",
        "command": "// Get all tokens currently targeted\nconst targets = game.user.targets;\n\n// Check if any tokens are targeted\nif (targets.size === 0) {\n  ui.notifications.warn(\"Please target at least one token!\");\n} else {\n  // Loop through targeted tokens\n  for (let token of targets) {\n    const actor = token.actor;\n    const currentRisk = actor.system.risk.value ?? 0;\n    \n    // Decrease risk but don't let it go below 0\n    const newRisk = Math.max(0, currentRisk - 1);\n\n    // Update the value\n    await actor.update({ \"system.risk.value\": newRisk });\n    \n    // Notification\n    ui.notifications.info(`${token.name} loses 1 Risk. (Now: ${newRisk})`);\n  }\n}",
        "img": "icons/svg/dice-target.svg",
        "author": "1UcMxAmfsWqm5yjt",
        "scope": "global",
        "folder": null,
        "flags": {},
        "_stats": {
            "compendiumSource": null,
            "duplicateSource": null,
            "exportSource": {
            "worldId": "plume",
            "uuid": "Macro.9uvoJyh2Xp3lkhAh",
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0"
            },
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0",
            "createdTime": 1772781264487,
            "modifiedTime": 1772785191374,
            "lastModifiedBy": "1UcMxAmfsWqm5yjt"
        },
        "ownership": {
            "default": 0
        }
    },
    {
        "name": "Break",
        "type": "script",
        "command": "// Get all tokens currently targeted\nconst targets = game.user.targets;\n\nif (targets.size === 0) {\n  ui.notifications.warn(\"Please target at least one token!\");\n} else {\n  // Create and execute the roll\n  const damageRoll = await new Roll(\"4d6 + 7\").evaluate();\n  \n  // Show the roll in chat so players see the result\n  let content = `<div class=\"dice-roll\"><div class=\"dice-result\">`;\n  content += `<div style=\"margin-bottom: 4px;  font-size: 14px;\">`\n  content += `</div> <div style=\"margin-bottom: 8px;  font-size: 12px;\"> </div>`;\n  content += `<div style=\"display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; justify-content: space-between;\">`;\n  content += `\n  <div style=\"flex: 1; max-width: 90px; text-align: center; border: 1px solid #777; border-radius: 3px; \n  padding: 4px; background: rgba(0,0,0,0.05);\">\n  <div style=\"font-size: 0.7em; text-transform: uppercase; \n  font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;\"> BREAK </div>\n  <div class=\"dice-total\" style=\"border:none; background:none; padding:0; line-height: 1;\"> ${damageRoll.total} </div>\n  </div>`;\n  content += `</div></div></div>`;\n\n  await ChatMessage.create({\n    speaker: ChatMessage.getSpeaker({ actor: this.actor }),\n    content: content,\n  });\n\n  const reduction = damageRoll.total;\n\n  for (let token of targets) {\n    const actor = token.actor;\n    const currentSpirit = actor.system.spirit.value ?? 0;\n    const currentRisk = actor.system.risk.value ?? 0;\n    \n    // Calculate new spirit (preventing it from going below 0)\n    const newSpirit = Math.max(0, currentSpirit - reduction);\n    const newRisk = Math.max(0, currentRisk + 2);\n\n    // Update the value\n    await actor.update({ \"system.spirit.value\": newSpirit });\n    await actor.update({ \"system.risk.value\": newRisk });\n    \n    ui.notifications.info(`${token.name} breaks, losing ${reduction} Spirit. (Now: ${newSpirit})`);\n  }\n}",
        "img": "icons/svg/dice-target.svg",
        "author": "1UcMxAmfsWqm5yjt",
        "scope": "global",
        "folder": null,
        "flags": {},
        "_stats": {
            "compendiumSource": null,
            "duplicateSource": null,
            "exportSource": {
            "worldId": "plume",
            "uuid": "Macro.y0OAAVqD4U7IBiCE",
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0"
            },
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0",
            "createdTime": 1772778505770,
            "modifiedTime": 1772781089536,
            "lastModifiedBy": "1UcMxAmfsWqm5yjt"
        },
        "ownership": {
            "default": 0
        }
    },
    {
        "name": "Combat Ends",
        "type": "script",
        "command": "// Get all currently selected tokens on the canvas\nconst tokens = game.user.targets;\n\n// Check if any tokens are selected\nif (tokens.length === 0) {\n  ui.notifications.warn(\"Please select at least one token!\");\n} else {\n  // Loop through each selected token and update its actor's HP\n  for (let token of tokens) {\n    const actor = token.actor;\n    const maxHP = actor.system.health.max; // Path for V10+ systems\n    \n    // Update the actor's current HP to match their max HP\n    await actor.update({ \"system.health.value\": maxHP });\n    await actor.update({ \"system.risk.value\": 0 });\n  }\n  ui.notifications.info(`${token.name} ends combat!`);\n}",
        "img": "icons/svg/dice-target.svg",
        "author": "1UcMxAmfsWqm5yjt",
        "scope": "global",
        "folder": null,
        "flags": {},
        "_stats": {
            "compendiumSource": null,
            "duplicateSource": null,
            "exportSource": {
            "worldId": "plume",
            "uuid": "Macro.sT1ifEhVrzIU8Q2B",
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0"
            },
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0",
            "createdTime": 1772778303568,
            "modifiedTime": 1772778332228,
            "lastModifiedBy": "1UcMxAmfsWqm5yjt"
        },
        "ownership": {
            "default": 0
        }
    },
    {
        "name": "Cum",
        "type": "script",
        "command": "// Get all tokens currently targeted\nconst targets = game.user.targets;\n\nif (targets.size === 0) {\n  ui.notifications.warn(\"Please target at least one token!\");\n} else {\n  // Create and execute the roll\n  const damageRoll = await new Roll(\"1d20!\").evaluate();\n  const cumRoll = await new Roll(\"6d12!\").evaluate();\n  \n  // Show the roll in chat so players see the result\n  let content = `<div class=\"dice-roll\"><div class=\"dice-result\">`;\n  content += `<div style=\"margin-bottom: 4px;  font-size: 14px;\">`\n  content += `</div> <div style=\"margin-bottom: 8px;  font-size: 12px;\"> </div>`;\n  content += `<div style=\"display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; justify-content: space-between;\">`;\n  content += `\n  <div style=\"flex: 1; max-width: 90px; text-align: center; border: 1px solid #777; border-radius: 3px; \n  padding: 4px; background: rgba(0,0,0,0.05);\">\n  <div style=\"font-size: 0.7em; text-transform: uppercase; \n  font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;\"> Impregnation </div>\n  <div class=\"dice-total\" style=\"border:none; background:none; padding:0; line-height: 1;\"> ${damageRoll.total} </div>\n  </div>`;\n  content += `\n  <div style=\"flex: 1; max-width: 90px; text-align: center; border: 1px solid #777; border-radius: 3px; \n  padding: 4px; background: rgba(0,0,0,0.05);\">\n  <div style=\"font-size: 0.7em; text-transform: uppercase; \n  font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;\"> CUM ml </div>\n  <div class=\"dice-total\" style=\"border:none; background:none; padding:0; line-height: 1;\"> ${cumRoll.total} </div>\n  </div>`;\n  content += `</div></div></div>`;\n\n  for (let token of targets) {\n    await ChatMessage.create({\n      speaker: ChatMessage.getSpeaker({ token: this.actor }),\n      content: content,\n    });\n  }\n\n  \n}",
        "img": "icons/svg/dice-target.svg",
        "author": "1UcMxAmfsWqm5yjt",
        "scope": "global",
        "folder": null,
        "flags": {},
        "_stats": {
            "compendiumSource": null,
            "duplicateSource": null,
            "exportSource": {
            "worldId": "plume",
            "uuid": "Macro.XhowVQXrGuJnpq0Q",
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0"
            },
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0",
            "createdTime": 1772784959642,
            "modifiedTime": 1772785104802,
            "lastModifiedBy": "1UcMxAmfsWqm5yjt"
        },
        "ownership": {
            "default": 0
        }
    },
    {
        "name": "Poise Break",
        "type": "script",
        "command": "// Get all tokens currently targeted\nconst targets = game.user.targets;\n\nif (targets.size === 0) {\n  ui.notifications.warn(\"Please target at least one token!\");\n} else {\n  // Create and execute the roll\n  const damageRoll = await new Roll(\"1d6 + 7\").evaluate();\n  \n  // Show the roll in chat so players see the result\n  let content = `<div class=\"dice-roll\"><div class=\"dice-result\">`;\n  content += `<div style=\"margin-bottom: 4px;  font-size: 14px;\">`\n  content += `</div> <div style=\"margin-bottom: 8px;  font-size: 12px;\"> </div>`;\n  content += `<div style=\"display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; justify-content: space-between;\">`;\n  content += `\n  <div style=\"flex: 1; max-width: 90px; text-align: center; border: 1px solid #777; border-radius: 3px; \n  padding: 4px; background: rgba(0,0,0,0.05);\">\n  <div style=\"font-size: 0.7em; text-transform: uppercase; \n  font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;\"> POISE BREAK </div>\n  <div class=\"dice-total\" style=\"border:none; background:none; padding:0; line-height: 1;\"> ${damageRoll.total} </div>\n  </div>`;\n  content += `</div></div></div>`;\n\n  await ChatMessage.create({\n    speaker: ChatMessage.getSpeaker({ actor: this.actor }),\n    content: content,\n  });\n\n  const reduction = damageRoll.total;\n\n  for (let token of targets) {\n    const actor = token.actor;\n    const currentSpirit = actor.system.spirit.value ?? 0;\n    const currentRisk = actor.system.risk.value ?? 0;\n    \n    // Calculate new spirit (preventing it from going below 0)\n    const newSpirit = Math.max(0, currentSpirit - reduction);\n    const newRisk = Math.max(0, currentRisk + 1);\n\n    // Update the value\n    await actor.update({ \"system.spirit.value\": newSpirit });\n    await actor.update({ \"system.risk.value\": newRisk });\n    \n    ui.notifications.info(`${token.name} breaks, losing ${reduction} Spirit. (Now: ${newSpirit})`);\n  }\n}",
        "img": "icons/svg/dice-target.svg",
        "author": "1UcMxAmfsWqm5yjt",
        "scope": "global",
        "folder": null,
        "flags": {},
        "_stats": {
            "compendiumSource": null,
            "duplicateSource": null,
            "exportSource": {
            "worldId": "plume",
            "uuid": "Macro.xM9XUmXnZBT55UCv",
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0"
            },
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0",
            "createdTime": 1772781180744,
            "modifiedTime": 1773074780372,
            "lastModifiedBy": "1UcMxAmfsWqm5yjt"
        },
        "ownership": {
            "default": 0
        }
    },
    {
        "name": "Reset Health",
        "type": "script",
        "command": "// Get all currently selected tokens on the canvas\nconst tokens = game.user.targets;\n\n// Check if any tokens are selected\nif (tokens.length === 0) {\n  ui.notifications.warn(\"Please select at least one token!\");\n} else {\n  // Loop through each selected token and update its actor's HP\n  for (let token of tokens) {\n    const actor = token.actor;\n    const maxHP = actor.system.health.max; // Path for V10+ systems\n    const maxSP = actor.system.spirit.max; // Path for V10+ systems\n    \n    // Update the actor's current HP to match their max HP\n    await actor.update({ \"system.health.value\": maxHP });\n    await actor.update({ \"system.spirit.value\": maxSP });\n  }\n  ui.notifications.info(`Healed ${token.name} to full health.`);\n}",
        "img": "icons/svg/dice-target.svg",
        "author": "1UcMxAmfsWqm5yjt",
        "scope": "global",
        "folder": null,
        "flags": {},
        "_stats": {
            "compendiumSource": null,
            "duplicateSource": null,
            "exportSource": {
            "worldId": "plume",
            "uuid": "Macro.2g4gFokMMZtiuz6G",
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0"
            },
            "coreVersion": "13.351",
            "systemId": "plume",
            "systemVersion": "1.2.0",
            "createdTime": 1772777591492,
            "modifiedTime": 1772777786753,
            "lastModifiedBy": "1UcMxAmfsWqm5yjt"
        },
        "ownership": {
            "default": 0
        }
    }
  ];

  // 1. Create a folder for the macros
  let folder = game.folders.find(f => f.name === "macros" && f.type === "Macro");
  if (!folder) {
    folder = await Folder.create({
      name: "macros",
      type: "Macro"
    });
  }

  // 2. Create the macros
  for (let data of myMacros) {
    // Avoid duplicates
    if (game.macros.find(m => m.name === data.name)) continue;

    await Macro.create({
      name: data.name,
      type: "script",
      img: data.img || "icons/svg/dice-target.svg",
      command: data.command,
      folder: folder.id,
      ownership: { default: 3 } // Give everyone 'Observer' or change to 3 for 'Owner'
    });
  }

  ui.notifications.info(`Imported ${myMacros.length} macros into ${folder.name}!`);
})();
