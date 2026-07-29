// Import character-sheet.
import CharacterData from "./character.mjs";
import ItemData from "./item.mjs";

const PLUME = {};

Hooks.on("init", () => {
  CONFIG.Actor.dataModels.character = CharacterData;
  CONFIG.Item.dataModels.item = ItemData;
});

const systemID = "plume";

/**
 * Translates repository paths to Foundry Data paths
 * @param {string} path - A path relative to the root of this repository
 * @returns {string} The path relative to the Foundry data folder
 */
const systemPath = (path) => `systems/${systemID}/${path}`;

/**
 * Searches through an object recursively and localizes strings
 * @param {Record<string, unknown>} object
 */
function localizeHelper(object) {
  for (const [key, value] of Object.entries(object)) {
    // const type = foundry.utils.getType(value)
    switch (typeof value) {
      case "object":
        if (value) localizeHelper(value);
        break;
      case "string":
        if (key === "label") object[key] = game.i18n.localize(value);
        break;
    }
  }
}

const {api: api$1, sheets: sheets$1} = foundry.applications;

/**
 * Extend the basic ActorSheet with some very simple modifications
 */
class PLUMEActorSheet extends api$1.HandlebarsApplicationMixin(sheets$1.ActorSheet) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    classes: ["plume", "actor", "standard-form"],
    position: {
      width: 600,
      height: 850
    },
    actions: {
      viewDoc: this.#viewDoc,
      createDoc: this.#createDoc,
      deleteDoc: this.#deleteDoc,
      toggleEffect: this.#toggleEffect,
      roll: this.#onRoll,
      editTokenArt: this.#onEditTokenArt,
      addItem: this.#onAddItem,
      addItem2: this.#onAddItem2,
      addItem3: this.#onAddItem3,
      deleteItem: this.#onDeleteItem,
      deleteItem2: this.#onDeleteItem2,
      deleteItem3: this.#onDeleteItem3,
      roguelike: this.#roguelike,
      roguelike2: this.#roguelike2,
      roguelike3: this.#roguelike3,
      roguelike4: this.#roguelike4
    },
    window: {
      resizable: true,
      scrollable: [".window-content", ".sheet-body"]
    },
    form: {
      submitOnChange: true
    }
  };

      /**
   * Handle clickable rolls.
   *
   * @this PlumeActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #onRoll(event, target) {
    event.preventDefault();
    const dataset = target.dataset;
    const actorData = this.actor.getRollData();
    const targetToken = game.user.targets.first();
    let content = `<div class="dice-roll"><div class="dice-result">`;

    // Handle item rolls.
    switch (dataset.rollType) {
		case 'item':
			const item = this._getEmbeddedDocument(target);
			if (item) return item.roll();
    case 'multi':
        const results = [];
        const rollsToProcess = [
          { formula: dataset.roll, label: dataset.text },
          { formula: dataset.roll2, label: dataset.text2 },
          { formula: dataset.roll3, label: dataset.text3 },
          { formula: dataset.roll4, label: dataset.text4 }
        ];

        // Build Target HTML
        content += `<div style="margin-bottom: 8px;  font-size: 12px;">`;
        if (targetToken) { 
          const target = targetToken.name; 
          content += `vs ${target} `;
          if (dataset.move=='atk') {
            const number = targetToken?.actor?.system?.evasionTotal || 0 ;
            content += ` | EVA: ${number}`;
          }
        } 

        // Get the evasion, defense, willpower, resistance value from the target (default to 0 if no target)
        const defReduction = targetToken?.actor?.system?.defTotal || 0;
        const willReduction = targetToken?.actor?.system?.willTotal || 0;
        const resReduction = targetToken?.actor?.system?.resTotal || 0;
        const dexTarget = targetToken?.actor?.system?.dexTotal || 0;
        const vigTarget = targetToken?.actor?.system?.vigTotal || 0;
        const magTarget = targetToken?.actor?.system?.magTotal || 0;
        const fthTarget = targetToken?.actor?.system?.fthTotal || 0;
        const evaTarget = targetToken?.actor?.system?.evasionTotal || 0;

        // 1. Evaluate all rolls
        for (let item of rollsToProcess) {
          if (item.formula) {
            const roll = new Roll(item.formula, actorData);
            await roll.evaluate(); 

            // REDUCTION LOGIC:
            // Check if the label is 'damage', 'crit', or 'crit damage' (case insensitive)
            const lowerLabel = item.label?.toLowerCase() || "";
            if (lowerLabel.includes("damage")) {
              // checks if scaling is sexual or not, then reduces using def or res
              switch (dataset.move)
              {
                case "atk":
                  roll._total += (-1*defReduction);
                  break;
                case "save":
                  roll._total += (-1*defReduction);
                  break;
                case "sex":
                  roll._total += (-1*resReduction);
                  break;
              }
              if (lowerLabel == 'damage') {
                if (dataset.move == 'sex') {roll._total = roll.total + (-1*(evaTarget-10));}
              }
              if (lowerLabel == 'crit damage') {roll._total = roll.total + (-2*dexTarget) + (-2*fthTarget);}
            }

            if (lowerLabel.includes("crit")) {
              switch (dataset.move)
              {
                case "atk":
                  roll._total += (-1*vigTarget) +(-1*defReduction);
                  break;
                case "save":
                  roll._total += (-1*vigTarget) +(-1*defReduction);
                  break;
                case "sex":
                  roll._total += (-1*vigTarget) +(-1*resReduction);
                  break;
              }
            }

            if (lowerLabel.includes("save")) {
              // call enemy save
              if (dataset.move == 'save') {

                const selectedKey = dataset.vs || "mag";
                switch (selectedKey) 
                {
                  case "dex":
                    roll._total += dexTarget + willReduction;
                    break;
                  case "vig":
                    roll._total += vigTarget + willReduction;
                    break;
                  case "mag":
                    roll._total += magTarget + willReduction;
                    break;
                }

              }
            }

            // Attach the label to the roll options so the Hook can see it for the pop-up
            roll.options.label = item.label;
            results.push({ roll, label: item.label });
          }
        }

        // 2. Build the HTML (Same as your previous code)
        content += `<div style="margin-bottom: 4px;  font-size: 14px;">`
        content += `</div> <div style="margin-bottom: 8px;  font-size: 12px;"> ${dataset.label} </div>`;
        content += `<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; justify-content: space-between;">`;

        results.forEach(res => {
          content += `
            <div class="roll-container" style="flex: 1; min-width: 60px; max-width: 60px; text-align: center; border: 1px solid #777; border-radius: 3px; padding: 4px; background: rgba(0,0,0,0.05);">
              <div style="font-size: 0.7em; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;">${res.label}</div>
              <div class="dice-total" style="border:none; background:none; padding:0; line-height: 1;">${res.roll.total}</div>
            </div>`;
        });

        content += `</div></div></div>`;

        // 3. Create the message
        return await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: content,
          rolls: results.map(r => r.roll.toJSON()) 
        });

    case 'hit':
      const roll = new Roll(dataset.roll, actorData);
      await roll.evaluate(); 
      // Build HTML
      if (dataset.label) 
        {
          content += `<div style="margin-bottom: 8px;  font-size: 12px;">`;
          if (targetToken) { 
            const target2 = targetToken.name; content += `vs ${target2} | `;
          } 
          content += `${dataset.label}</div>`;
          content += `<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; justify-content: space-between;">`;
        }
      content += `
        <div style="flex: 1; max-width: 60px; text-align: center; border: 1px solid #777; border-radius: 3px; padding: 4px; background: rgba(0,0,0,0.05);">
          <div style="font-size: 0.7em; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;"> ${dataset.label2} </div>
          <div class="dice-total" style="border:none; background:none; padding:0; line-height: 1;">${roll.total}</div>
        </div>`;
      if (targetToken) {
        if (dataset.move2=='strip') {
            content += `
            <div style="flex: 1; max-width: 60px; text-align: center; border: 1px solid #777; border-radius: 3px; padding: 4px; background: rgba(0,0,0,0.05);">
              <div style="font-size: 0.7em; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;"> - </div>
              <div class="dice-total" style="border:none; background:none; padding:0; line-height: 1;"> - </div>
            </div>`;
          }
        if (dataset.move=='grab') {
          const number = targetToken?.actor?.system?.escapeDC || 0 ;
          content += `
          <div style="flex: 1; max-width: 60px; text-align: center; border: 1px solid #777; border-radius: 3px; padding: 4px; background: rgba(0,0,0,0.05);">
            <div style="font-size: 0.7em; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;"> Escape DC </div>
            <div class="dice-total" style="border:none; background:none; padding:0; line-height: 1;">${number}</div>
          </div>`;
        }
        if (dataset.move=='strip' || dataset.move2=='strip') {
          const number = targetToken?.actor?.system?.gripDC || 0 ;
          content += `
          <div style="flex: 1; max-width: 60px; text-align: center; border: 1px solid #777; border-radius: 3px; padding: 4px; background: rgba(0,0,0,0.05);">
            <div style="font-size: 0.7em; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;"> Grip DC </div>
            <div class="dice-total" style="border:none; background:none; padding:0; line-height: 1;">${number}</div>
          </div>`;
        } 
      } 
      if (dataset.move=='second') {
          const roll2 = new Roll(dataset.roll3, actorData);
          await roll2.evaluate(); 
          content += `
          <div style="flex: 1; max-width: 60px; text-align: center; border: 1px solid #777; border-radius: 3px; padding: 4px; background: rgba(0,0,0,0.05);">
            <div style="font-size: 0.7em; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;"> ${dataset.label3} </div>
            <div class="dice-total" style="border:none; background:none; padding:0; line-height: 1;">${roll2.total}</div>
          </div>`;
        }
      content += `</div></div></div>`;
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: content,
      });
      return roll;
    case 'talk':
      // Build HTML
      if(dataset.label2){
        content += `<div style="margin-bottom: 2px;  font-size: 14px;">${dataset.label2}</div>`;
      }
      if(dataset.label3){
        content += `<div style="margin-bottom: 2px;  font-size: 14px;">${dataset.label3}</div>`;
      }
      if(dataset.label4){
        content += `<div style="margin-bottom: 2px;  font-size: 12px;">${dataset.label4}</div>`;
      }
      if(dataset.label5){
        content += `<div style="margin-bottom: 2px;  font-size: 12px;">${dataset.label5}</div>`;
      }
      content += `<div style="margin-bottom: 8px;  font-size: 12px;">${dataset.label}</div>`;
      content += `<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; justify-content: space-between;">`;
      content += `</div></div></div>`;
      return await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this.actor }),
          content: content,
          sound: CONFIG.sounds.dice
        });
    case 'scan':
      const slots = [];
      const slots2 = [];
      const stats = [
        { formula: dataset.roll, label: dataset.text },
        { formula: dataset.roll2, label: dataset.text2 },
        { formula: dataset.roll3, label: dataset.text3 },
        { formula: dataset.roll4, label: dataset.text4 },
        { formula: dataset.roll5, label: dataset.text5 }
      ];

      const stats2 = [
        { formula: dataset.broll, label: dataset.btext },
        { formula: dataset.broll2, label: dataset.btext2 },
        { formula: dataset.broll3, label: dataset.btext3 },
        { formula: dataset.broll4, label: dataset.btext4 },
        { formula: dataset.broll5, label: dataset.btext5 },
        { formula: dataset.broll6, label: dataset.btext6 },
        { formula: dataset.broll7, label: dataset.btext7 },
        { formula: dataset.broll8, label: dataset.btext8 },
        { formula: dataset.broll9, label: dataset.btext9 }
      ];

      // 1. Evaluate all rolls
      for (let item of stats) {
        if (item.formula) {
          const roll = new Roll(item.formula, actorData);
          await roll.evaluate(); 
          slots.push({ roll, label: item.label });
        }
      }

      for (let item of stats2) {
        if (item.formula) {
          const roll = new Roll(item.formula, actorData);
          await roll.evaluate(); 
          slots2.push({ roll, label: item.label });
        }
      }

      // 2. Build the HTML
      content += `<div style="margin-bottom: 4px;  font-size: 14px;">`
      content += `</div> <div style="margin-bottom: 8px;  font-size: 12px;"> ${dataset.label} </div>`;
      content += `<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; justify-content: space-between;">`;

      slots.forEach(res => {
        content += `
          <div style="flex: 1; min-width: 48px; text-align: center; border: 1px solid #777; border-radius: 3px; padding: 4px; background: rgba(0,0,0,0.05);">
            <div style="font-size: 0.7em; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;">${res.label}</div>
            <div class="dice-total" style="border:none; background:none; padding:0; line-height: 1;">${res.roll.total}</div>
          </div>`;
      });

      content += `<div></div>`;

      slots2.forEach(res => {
        content += `
          <div style="flex: 1; min-width: 24px; text-align: center; border: 1px solid #777; border-radius: 3px; padding: 4px; background: rgba(0,0,0,0.05);">
            <div style="font-size: 0.6em; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;">${res.label}</div>
            <div class="dice-total" style="border:none; background:none; padding:0; line-height: 1; font-size: 1em;">${res.roll.total}</div>
          </div>`;
      });

      content += `</div></div></div>`;

      // 3. Create the message using .toJSON() 
      return await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: content,
        sound: CONFIG.sounds.dice
      });
    case 'scan2':
      const slots3 = [];
      const stats3 = [
        { formula: dataset.roll, label: dataset.text },
        { formula: dataset.roll2, label: dataset.text2 },
        { formula: dataset.roll3, label: dataset.text3 },
        { formula: dataset.roll4, label: dataset.text4 },
        { formula: dataset.roll5, label: dataset.text5 }
      ];

      // 1. Evaluate all rolls
      for (let item of stats3) {
        if (item.formula) {
          const roll = new Roll(item.formula, actorData);
          await roll.evaluate(); 
          slots3.push({ roll, label: item.label });
        }
      }

      // 2. Build the HTML
      content += `<div style="margin-bottom: 4px;  font-size: 14px;">`
      content += `</div> <div style="margin-bottom: 8px;  font-size: 12px;"> ${dataset.label} </div>`;
      content += `<div style="display: flex; flex-direction: row; flex-wrap: wrap; gap: 4px; justify-content: space-between;">`;

      slots3.forEach(res => {
        content += `
          <div style="flex: 1; min-width: 48px; text-align: center; border: 1px solid #777; border-radius: 3px; padding: 4px; background: rgba(0,0,0,0.05);">
            <div style="font-size: 0.7em; text-transform: uppercase; font-weight: bold; border-bottom: 1px solid #777; margin-bottom: 4px;">${res.label}</div>
            <div class="dice-total" style="border:none; background:none; padding:0; line-height: 1;">${res.roll.total}</div>
          </div>`;
      });

    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      console.log('ROLL DONE');
      let label = dataset.label ? `${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }

  }


  /* -------------------------------------------------- */

  static TABS = {
    primary: {
      tabs: [
        {
          id: "actions",
          label: "Actions"
        },
        {
          id: "gear",
          label: "Gear"
        },
        {
          id: "skills",
          label: "Skills"
        },
        {
          id: "feats",
          label: "Feats"
        },
        {
          id: "items",
          label: "Items"
        },
        {
          id: "stats",
          label: "Stats"
        },
        {
          id: "notes",
          label: "Notes"
        }
      ],
      initial: "gear",
      labelPrefix: " "
    }
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    header: {
      template: systemPath("tabs/header.hbs")
    },
    tabs: {
      template: "templates/generic/tab-navigation.hbs"
    },
    actions: {
      template: systemPath("tabs/actions.hbs"),
      scrollable: [""]
    },
    gear: {
      template: systemPath("tabs/gear.hbs"),
      scrollable: [""]
    },
    skills: {
      template: systemPath("tabs/skills.hbs"),
      scrollable: [""]
    },
    feats: {
      template: systemPath("tabs/feats.hbs"),
      scrollable: [""]
    },
    items: {
      template: systemPath("tabs/items.hbs"),
      scrollable: [""]
    },
    stats: {
      template: systemPath("tabs/stats.hbs"),
      scrollable: [""]
    },
    notes: {
      template: systemPath("tabs/notes.hbs"),
      scrollable: [""]
    }
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  _initializeApplicationOptions(options) {
    const initialized = super._initializeApplicationOptions(options);

    initialized.classes.push(initialized.document.type);

    return initialized;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    Object.assign(context, {
      owner: this.document.isOwner,
      limited: this.document.limited,
      actor: this.actor,
      system: this.actor.system,
      target: game.user.targets.first(),
      flags: this.actor.flags,
      actorFields: this.actor.schema.fields,
      config: CONFIG
    });

    context.bossOptions = [
      {value: "", label: ""}, 
      {value: "BOSS", label: "BOSS"},
      {value: "RAID BOSS", label: "RAID BOSS"}
    ]

    context.hitOptions = [
      {value: "str", label: "+(STR)"}, 
      {value: "dex", label: "+(DEX)"},
      {value: "dex2", label: "+(GUN)"}, 
      {value: "vig", label: "+(VIG)"}, 
      {value: "mag", label: "+(MAG)"}, 
      {value: "fth", label: "+(FTH)"}
    ]

    context.elementOptions = [
      {value: "Holy | Empty | You are a blank vessel.", label: "Holy | Empty"},
      {value: "Holy | Chosen | You are the chosen one!", label: "Holy | Chosen"},
      {value: "Holy | Submissive | You are submissive.. and cute!", label: "Holy | Submissive"},
      {value: "Wind | Conceited | You think too highly of yourself!", label: "Wind | Conceited"},
      {value: "Wind | Envious | You are jealous of people..!", label: "Wind | Envious"},
      {value: "Wind | Aloof | You don't really notice much.", label: "Wind | Aloof"},
      {value: "Unholy | Fallen | You are fallen, from once noble origins!", label: "Unholy | Fallen"},
      {value: "Unholy | Ancient | You are timeless, before now!", label: "Unholy | Ancient"},
      {value: "Unholy | Dominating | You are dominating, and kind of a jerk!", label: "Unholy | Dominating"},
      {value: "Fire | Insatiable | You desire more and more!", label: "Fire | Insatiable"},
      {value: "Fire | Starved | You are without, and burn for what you're denied!", label: "Fire | Starved"},
      {value: "Fire | Enraged | You are quick to anger!", label: "Fire | Enraged"},
      {value: "Cold | Arrogant | You look down on others!", label: "Cold | Arrogant"},
      {value: "Cold | Pathetic | You have cripplingly low self-esteem..", label: "Cold | Pathetic"},
      {value: "Cold | Regretful | You regret your past..", label: "Cold | Regretful"},
      {value: "Lightning | Violent | You LOVE fighting!", label: "Lightning | Violent"},
      {value: "Lightning | Hesitant | You are quick to refuse..", label: "Lightning | Hesitant"},
      {value: "Lightning | Impulsive | You act without thought! ", label: "Lightning | Impulsive"},
      {value: "Earth | Greedy | You fucking LOVE money.", label: "Earth | Greedy"},
      {value: "Earth | Naive | You aren't that bright.", label: "Earth | Naive"},
      {value: "Earth | Forsaken | You have nothing left.", label: "Earth | Forsaken"},
      {value: "Time | Lazy | You're pretty lazy!", label: "Time | Lazy"},
      {value: "Time | Servile | You live to serve others.", label: "Time | Servile"},
      {value: "Time | Foolish | You consistently make the worse decisions ever.", label: "Time | Foolish"},
      {value: "Mind | Erotic | You're really fucking lewd!", label: "Mind | Erotic"},
      {value: "Mind | Repressed | You're shy... but also secretly lewd.", label: "Mind | Repressed"},
      {value: "Mind | Broken | You've been broken by a lot of sex..!", label: "Mind | Broken"}
    ]

    context.saveDCOptions = [
      {value: "str", label: "STR"}, 
      {value: "dex", label: "DEX"}, 
      {value: "vig", label: "VIG"}, 
      {value: "mag", label: "MAG"}, 
      {value: "fth", label: "FTH"},
      {value: "none", label: "-"}
    ]

    context.saveDCOptions2 = [
      {value: "str", label: "STR"}, 
      {value: "dex", label: "DEX"}, 
      {value: "vig", label: "VIG"}, 
      {value: "mag", label: "MAG"}, 
      {value: "fth", label: "FTH"},
      {value: "none", label: "-"}
    ]

    context.alignmentOptions = [
      {value: "Good", label: "Good"},
      {value: "Evil", label: "Evil"},
      {value: "Neutral", label: "Neutral"},
      {value: "Lawful", label: "Lawful"},
      {value: "Chaotic", label: "Chaotic"}
    ]

    context.saveVSOptions = [
      {value: "dex", label: "(DEX):"}, 
      {value: "vig", label: "(VIG):"}, 
      {value: "mag", label: "(MAG):"}, 
      {value: "none", label: "(-):"}
    ]

    context.skillOptions = [
      {value: "Skill", label: "Skill"}, 
      {value: "Technique", label: "Technique"}, 
      {value: "Reaction", label: "Reaction"}, 
      {value: "Spell", label: "Spell"}, 
      {value: "Focus", label: "Focus"}, 
      {value: "Cantrip", label: "Cantrip"}
    ]

    context.sexOptions = [
      {value: "Teasing", label: "Teasing"}, 
      {value: "Foreplay", label: "Foreplay"}, 
      {value: "Sex", label: "Sex"}, 
      {value: "Punish", label: "Punish"}
    ]

    context.sexDMGOptions = [
      {value: "Lewd", label: "Lewd"}, 
      {value: "Desire", label: "Desire"}, 
      {value: "Erotic", label: "Erotic"}, 
      {value: "Strain", label: "Strain"}, 
      {value: "None", label: "None"}
    ]

    context.basicsexOptions = [
      {value: "Sex | Quick. You take 9 Recoil! Gain CDMG-UP for 2 turns. | 2d10 Lewd", label: "Sex | Quick. You take 9 Recoil! Gain CDMG-UP for 2 turns. | 2d10 Lewd"},
      {value: "Punish | Deal MARK for 2 turns! | 1d8 Strain", label: "Punish | Deal MARK for 2 turns! | 1d8 Strain"}, 
      {value: "Teasing | Deal TIMID for 2 turns. | 1d10 Lewd", label: "Teasing | Deal TIMID for 2 turns. | 1d10 Lewd"}, 
      {value: "Foreplay | Quick. You remove a debuff from yourself! | 2d8 Lewd", label: "Foreplay | Quick. You remove a debuff from yourself! | 2d8 Lewd"}
    ]

    context.breakOptions = [
      {value: "Break", label: "Break"}, 
      {value: "Stagger", label: "Stagger"}, 
      {value: "Poise", label: "Poise"}
    ]

    context.scalingOptions = [
      {value: "Normal", label: "Normal"}, 
      {value: "Minion", label: "Minion"}, 
      {value: "Elite", label: "Elite"}
    ]

    return context;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _preparePartContext(partId, context) {
    switch (partId) {
      case "gear":
        context.tab = context.tabs[partId];
        break;
      case "skills":
        context.tab = context.tabs[partId];
        break;
      case "feats":
        context.tab = context.tabs[partId];
        break;
      case "items":
        context.tab = context.tabs[partId];
        break;
      case "stats":
        context.tab = context.tabs[partId];
        break;
      case "notes":
        context.tab = context.tabs[partId];
        break;
    }
    return context;
  }

  /* -------------------------------------------------- */

  /**
   * Handles the system fields for the form-fields generic
   * @returns {object[]}
   */
  async _getFields() {
    const doc = this.actor;
    const source = doc._source;
    const systemFields = CONFIG.Actor.dataModels[doc.type]?.schema.fields;
    const fieldSets = [];
    // TODO: Find a clever way to handle enrichment
    for (const field of Object.values(systemFields ?? {})) {
      const path = `system.${field.name}`;
      if (field instanceof foundry.data.fields.SchemaField) {
        const fieldset = {fieldset: true, legend: field.label, fields: []};
        await this.#addSystemFields(fieldset, field.fields, source, path);
        fieldSets.push(fieldset);
      } else {
        fieldSets.push({outer: {field, value: foundry.utils.getProperty(source, path)}});
      }
    }
    return fieldSets;
  }

  /* -------------------------------------------------- */

  /**
   * Recursively add system model fields to the fieldset.
   */
  async #addSystemFields(fieldset, schema, source, _path = "system") {
    for (const field of Object.values(schema)) {
      const path = `${_path}.${field.name}`;
      if (field instanceof foundry.data.fields.SchemaField) {
        this.#addSystemFields(fieldset, field.fields, source, path);
      } else if (field.constructor.hasFormSupport) {
        fieldset.fields.push({field, value: foundry.utils.getProperty(source, path)});
      }
    }
  }

  /* -------------------------------------------------- */

  /**
   * Adapted from Actor#itemTypes
   */
  _getItems() {
    const types = Object.fromEntries(game.documentTypes.Item.map((t) => {
      return [t, {label: game.i18n.localize(CONFIG.Item.typeLabels[t]), items: []}];
    }));
    for (const item of this.actor.items) {
      types[item.type].items.push(item);
    }
    // Only show Base if it's actually being used
    if (types.base.items.length === 0) delete types.base;
    return types;
  }

  /* -------------------------------------------------- */

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   * @inheritdoc
   */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this.#disableOverrides();
  }

  /* -------------------------------------------------- */
  /*   Event handlers                                   */
  /* -------------------------------------------------- */

  /**
   * Renders an embedded document's sheet
   *
   * @this PLUMEActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #viewDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.sheet.render(true);
  }

  /* -------------------------------------------------- */

  /**
   * Handles item deletion
   *
   * @this PLUMEActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #deleteDoc(event, target) {
    const doc = this._getEmbeddedDocument(target);
    doc.delete();
  }

  /* -------------------------------------------------- */

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this PLUMEActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #createDoc(event, target) {
    const docCls = getDocumentClass(target.dataset.documentClass);
    const docData = {
      name: docCls.defaultName({
        type: target.dataset.type,
        parent: this.actor
      })
    };
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      if (["action", "documentClass"].includes(dataKey)) continue;
      foundry.utils.setProperty(docData, dataKey, value);
    }
    docCls.create(docData, {parent: this.actor});
  }

  /* -------------------------------------------------- */

  /**
   * Determines effect parent to pass to helper
   *
   * @this PLUMEActorSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #toggleEffect(event, target) {
    const effect = this._getEmbeddedDocument(target);
    effect.update({disabled: !effect.disabled});
  }



  /* -------------------------------------------------- */
  /*   Helper functions                                 */
  /* -------------------------------------------------- */

  /**
   * Fetches the embedded document representing the containing HTML element
   *
   * @param {HTMLElement} target      The element subject to search
   * @returns {Item|ActiveEffect}     The embedded Item or ActiveEffect
   */
  _getEmbeddedDocument(target) {
    const docRow = target.closest("li[data-document-class]");
    if (docRow.dataset.documentClass === "Item") {
      return this.actor.items.get(docRow.dataset.itemId);
    } else if (docRow.dataset.documentClass === "ActiveEffect") {
      const parent = docRow.dataset.parentId === this.actor.id ?
        this.actor :
        this.actor.items.get(docRow?.dataset.parentId);
      return parent.effects.get(docRow.dataset.effectId);
    } else {
      console.warn("Could not find document class");
    }
  }

  /* -------------------------------------------------- */
  /*   Actor override handling                          */
  /* -------------------------------------------------- */

  /**
   * Submit a document update based on the processed form data.
   * @param {SubmitEvent} event                   The originating form submission event
   * @param {HTMLFormElement} form                The form element that was submitted
   * @param {object} submitData                   Processed and validated form data to be used for a document update
   * @returns {Promise<void>}
   * @protected
   * @inheritdoc
   */
  async _processSubmitData(event, form, submitData) {
    const overrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const k of Object.keys(overrides)) delete submitData[k];
    this.document.update(submitData);
  }

  /* -------------------------------------------------- */

  /**
   * Disables inputs subject to active effects
   */
  #disableOverrides() {
    const flatOverrides = foundry.utils.flattenObject(this.actor.overrides);
    for (const override of Object.keys(flatOverrides)) {
      const input = this.element.querySelector(`[name="${override}"]`);
      if (input) input.disabled = true;
    }
  }

  // click on art -> upload art
static async #onEditTokenArt(event, target) {
    const actor = this.document; 
    if ( !actor?.isOwner ) return ui.notifications.warn("No permission.");

    const current = actor.prototypeToken.texture.src;
    const worldPath = `worlds/${game.world.id}/assets`;

    new foundry.applications.apps.FilePicker.implementation({
      type: "image",
      displayMode: "tiles",
      current: current,
      callback: async (path) => {
        await actor.update({ 
            "img": path,
            "prototypeToken.texture.src": path 
        });
      }
    }).browse(worldPath);
}

  // 
  static async #onAddItem(event, target) {
      const inventory = Array.from(this.document.system.inventory || []);

      // 1. Check if the limit has been reached
      if (inventory.length >= 8) {
          return ui.notifications.warn("Maximum of 8 entries allowed!");
      }
      
      // 2. Proceed if under the limit
      inventory.push({ 
          NAME: "", 
          NOTES: "", 
          NUMBER: "0" 
      });

      await this.document.update({ "system.inventory": inventory });
  }

  static async #onAddItem2(event, target) {
      const inventory2 = Array.from(this.document.system.inventory2 || []);

      // 1. Check if the limit has been reached
      if (inventory2.length >= 8) {
          return ui.notifications.warn("Maximum of 8 entries allowed!");
      }
      
      // 2. Proceed if under the limit
      inventory2.push({ 
          NAME: "", 
          NOTES: "", 
          NUMBER: "0" 
      });

      await this.document.update({ "system.inventory2": inventory2 });
  }

  static async #onAddItem3(event, target) {
      const inventory3 = Array.from(this.document.system.inventory3 || []);

      // 1. Check if the limit has been reached
      if (inventory3.length >= 7) {
          return ui.notifications.warn("Maximum of 9 entries allowed!");
      }
      
      // 2. Proceed if under the limit
      inventory3.push({ 
          NAME: "", 
          NOTES: "", 
          NUMBER: "0" 
      });

      await this.document.update({ "system.inventory3": inventory3 });
  }

  static async #onDeleteItem(event, target) {
    const btn = target.closest('[data-index]');
    const index = parseInt(btn?.dataset.index);
    if (Number.isNaN(index)) return;

    const inventory = Array.from(this.document.system.inventory || []);
    
    // Use toSpliced for a clean, non-mutated update
    const updatedInventory = inventory.toSpliced(index, 1);

    await this.document.update({ "system.inventory": updatedInventory });
  }

  static async #onDeleteItem2(event, target) {
    const btn = target.closest('[data-index]');
    const index = parseInt(btn?.dataset.index);
    if (Number.isNaN(index)) return;

    const inventory2 = Array.from(this.document.system.inventory2 || []);
    
    // Use toSpliced for a clean, non-mutated update
    const updatedInventory2 = inventory2.toSpliced(index, 1);

    await this.document.update({ "system.inventory2": updatedInventory2 });
  }

  static async #onDeleteItem3(event, target) {
    const btn = target.closest('[data-index]');
    const index = parseInt(btn?.dataset.index);
    if (Number.isNaN(index)) return;

    const inventory3 = Array.from(this.document.system.inventory3 || []);
    
    // Use toSpliced for a clean, non-mutated update
    const updatedinventory3 = inventory3.toSpliced(index, 1);

    await this.document.update({ "system.inventory3": updatedinventory3 });
  }
  // WIP

  static async #roguelike(event) {
    event.preventDefault(); // Prevents the browser from doing anything else
    const actor = this.document;

    // 1. Bulletproof way to get the index, even if you click an icon inside the button
    const button = event.target.closest('[data-index]');
    const index = button?.dataset?.index;

    // 2. Safety check: If index is missing, stop the code before it crashes
    if (!index) {
        console.error("Roguelike: Button clicked, but no data-index was found.");
        return;
    }

    console.log(`DEBUG | Randomizing Sex Slot: ${index}`);

    // Define paths in arrays for easier management
    const filePaths = [
      "systems/plume/modules/sex/name.txt",
      "systems/plume/modules/sex/notes.txt",
      "systems/plume/modules/sex/damage.txt",
      "systems/plume/modules/sex/type.txt"
    ];

    const fieldPaths = [
      `system.sex${index}.NAME`,
      `system.sex${index}.NOTES`,
      `system.sex${index}.DAMAGE`,
      `system.sex${index}.TYPE`
    ];

    const otherPath = [
      `system.sex${index}.DMGTYPE`
    ];

    try {
      // 1. Fetch all files in parallel
      const responses = await Promise.all(filePaths.map(path => fetch(path)));
      
      // Check if any fetch failed
      if (responses.some(r => !r.ok)) throw new Error("One or more skill files could not be found.");

      // 2. Convert all responses to text and split into arrays
      const allFilesContent = await Promise.all(responses.map(r => r.text()));
      const allLines = allFilesContent.map(text => text.split(/\r?\n/).map(l => l.trim()));

      // 3. Determine the number of available skills (based on the first file)
      const rowCount = allLines[0].filter(l => l).length;
      if (rowCount === 0) throw new Error("The skill files are empty.");

      // 4. Pick one RANDOM INDEX to use for ALL files
      const randomIndex = Math.floor(Math.random() * rowCount);

      // 5. Build the update object
      const updateData = {};
      
      // Process each field
      for (let i = 0; i < fieldPaths.length; i++) {
        let value = allLines[i][randomIndex] || "";

        // SPECIAL CASE: If this is the DAMAGE file (index 2)
      if (i === 2) {
        const parts = value.split(' '); // Split "2d10 Lewd" -> ["2d10", "Lewd"]
        
        const diceFormula = parts[0] || ""; // "2d10"
        const typeString = parts.slice(1).join(' ') || ""; // "Lewd" (handles multiple words)

        // Set the DAMAGE field to just the dice
        updateData[fieldPaths[2]] = diceFormula;
        updateData[otherPath[0]] = typeString;
        
        continue; // Skip the default assignment for these two since we handled them
      }

      updateData[fieldPaths[i]] = value;

      }

      // 6. Perform a single update call
      await actor.update(updateData);

    } catch (error) {
      console.error("Roguelike Action Error:", error);
      ui.notifications.error("Failed to sync skill data. Check console.");
    }
  }

  // WIP

  static async #roguelike2(event) {
    event.preventDefault(); // Prevents the browser from doing anything else
    const actor = this.document;

    // 1. Bulletproof way to get the index, even if you click an icon inside the button
    const button = event.target.closest('[data-index]');
    const index = button?.dataset?.index;

    // 2. Safety check: If index is missing, stop the code before it crashes
    if (!index) {
        console.error("Roguelike: Button clicked, but no data-index was found.");
        return;
    }

    console.log(`DEBUG | Randomizing Skill Slot: ${index}`);

    // Define paths in arrays for easier management
    const filePaths = [
      "systems/plume/modules/skills/name.txt",
      "systems/plume/modules/skills/notes.txt",
      "systems/plume/modules/skills/type.txt"
    ];

    const fieldPaths = [
      `system.skill${index}.NAME`,
      `system.skill${index}.NOTES`,
      `system.skill${index}.TYPE`
    ];

    try {
      // 1. Fetch all files in parallel
      const responses = await Promise.all(filePaths.map(path => fetch(path)));
      
      // Check if any fetch failed
      if (responses.some(r => !r.ok)) throw new Error("One or more skill files could not be found.");

      // 2. Convert all responses to text and split into arrays
      const allFilesContent = await Promise.all(responses.map(r => r.text()));
      const allLines = allFilesContent.map(text => text.split(/\r?\n/).map(l => l.trim()));

      // 3. Determine the number of available skills (based on the first file)
      const rowCount = allLines[0].filter(l => l).length;
      if (rowCount === 0) throw new Error("The skill files are empty.");

      // 4. Pick one RANDOM INDEX to use for ALL files
      const randomIndex = Math.floor(Math.random() * rowCount);

      // 5. Build the update object
      const updateData = {};
      
      // Process each field
      for (let i = 0; i < fieldPaths.length; i++) {
        let value = allLines[i][randomIndex] || "";

      updateData[fieldPaths[i]] = value;

      }

      // 6. Perform a single update call
      await actor.update(updateData);

    } catch (error) {
      console.error("Roguelike Action Error:", error);
      ui.notifications.error("Failed to sync skill data. Check console.");
    }
  }

  // WIP

  static async #roguelike3(event) {
    event.preventDefault(); // Prevents the browser from doing anything else
    const actor = this.document;

    // 1. Bulletproof way to get the index, even if you click an icon inside the button
    const button = event.target.closest('[data-index]');
    const index = button?.dataset?.index;

    // 2. Safety check: If index is missing, stop the code before it crashes
    if (!index) {
        console.error("Roguelike: Button clicked, but no data-index was found.");
        return;
    }

    console.log(`DEBUG | Randomizing Skill Slot: ${index}`);

    // Define paths in arrays for easier management
    const filePaths = [
      "systems/plume/modules/edges/name.txt",
      "systems/plume/modules/edges/notes.txt"
    ];

    const fieldPaths = [
      `system.edge${index}.NAME`,
      `system.edge${index}.NOTES`
    ];

    try {
      // 1. Fetch all files in parallel
      const responses = await Promise.all(filePaths.map(path => fetch(path)));
      
      // Check if any fetch failed
      if (responses.some(r => !r.ok)) throw new Error("One or more skill files could not be found.");

      // 2. Convert all responses to text and split into arrays
      const allFilesContent = await Promise.all(responses.map(r => r.text()));
      const allLines = allFilesContent.map(text => text.split(/\r?\n/).map(l => l.trim()));

      // 3. Determine the number of available skills (based on the first file)
      const rowCount = allLines[0].filter(l => l).length;
      if (rowCount === 0) throw new Error("The skill files are empty.");

      // 4. Pick one RANDOM INDEX to use for ALL files
      const randomIndex = Math.floor(Math.random() * rowCount);

      // 5. Build the update object
      const updateData = {};
      
      // Process each field
      for (let i = 0; i < fieldPaths.length; i++) {
        let value = allLines[i][randomIndex] || "";

      updateData[fieldPaths[i]] = value;

      }

      // 6. Perform a single update call
      await actor.update(updateData);

    } catch (error) {
      console.error("Roguelike Action Error:", error);
      ui.notifications.error("Failed to sync skill data. Check console.");
    }
  }

  // WIP

  static async #roguelike4() {
    const data = [
      52000, 51100, 43100, 42200, 42111, 33111, 32211, 32220, 22222
    ];

    // 1. Evaluate asynchronously (Required for dice in V12+)
    const roll = await Roll.create("1d9 - 1").evaluate();
    const roll2 = await Roll.create("1d6 - 1").evaluate();

    // 2. Convert number to string, ensure it's 5 digits, then to array of numbers
    // This handles cases where a number starts with 0 (e.g. 05210)
    let line = Array.from(data[roll.total].toString().padStart(5, "0"), Number);

    // 3. Shift the leftmost digit to the right roll2.total times
    for (let i = 0; i < roll2.total; i++) {
      line.push(line.shift());
    }

    // 4. Update the actor's system data
    await this.actor.update({
      "system.str.value": line[0],
      "system.dex.value": line[1],
      "system.mag.value": line[2],
      "system.vig.value": line[3],
      "system.fth.value": line[4]
    });

  }

  // WIP

}

class PLUMECombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  /** @inheritdoc */
  _getCombatContextOptions() {
    const options = super._getCombatContextOptions();
    options.unshift({
      name: "PLUME.Combat.AddPlayer",
      icon: "<i class=\"fa-solid fa-user\"></i>",
      condition: () => game.user.isGM,
      callback: () => this.viewed.addPlayer()
    });
    return options;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _onCombatCreate(event, target) {
    if (Combat.TYPES.length > 1) {
      const combat = await getDocumentClass("Combat").createDialog();
      if (combat) combat.activate({render: false});
    }
    else super._onCombatCreate(event, target);
  }
}

/** @import CombatantConfig from "@client/applications/sheets/combatant-config.mjs" */
/** @import PLUMECombatant from "../../documents/PLUMECombatant.mjs" */

/**
 *
 * @param {CombatantConfig} app
 * @param {HTMLDivElement[]} jquery
 * @param {object} context
 */
function renderCombatantConfig(app, [html], context) {
  /** @type {PLUMECombatant} */
  const combatant = app.document;
  if (combatant.type === "player") {
    const form = html.querySelector("form");
    const userGroup = combatant.system.schema.getField("user").toFormGroup({}, {value: combatant.system.user.id});
    form.prepend(userGroup);
    app.setPosition({height: app.position.height + 30});
  }
}

const {api, sheets} = foundry.applications;

/**
 * Extend the basic ItemSheet with some very simple modifications
 */
class PLUMEItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheet) {
  /** @inheritdoc */
  static DEFAULT_OPTIONS = {
    position: {
      width: 600
    },
    classes: ["plume", "item", "standard-form"],
    actions: {
      viewDoc: this.#viewEffect,
      createDoc: this.#createEffect,
      deleteDoc: this.#deleteEffect,
      toggleEffect: this.#toggleEffect
    },
    form: {
      submitOnChange: true,
      closeOnSubmit: false
    },
    // Custom property that's merged into `this.options`
    dragDrop: [{dragSelector: ".draggable", dropSelector: null}]
  };

  /* -------------------------------------------------- */

  static TABS = {
    primary: {
      tabs: [
        {
          id: "properties"
        },
        {
          id: "effects"
        }
      ],
      initial: "properties",
      labelPrefix: "PLUME.Sheets.Tabs"
    }
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static PARTS = {
    header: {
      template: systemPath("templates/item/header.hbs")
    },
    tabs: {
      // Foundry-provided generic template
      template: "templates/generic/tab-navigation.hbs"
    },
    properties: {
      template: systemPath("templates/shared/properties.hbs"),
      scrollable: [""]
    },
    effects: {
      template: systemPath("templates/shared/effects.hbs"),
      scrollable: [""]
    }
  };

  /* -------------------------------------------------- */

  /** @inheritdoc */
  _initializeApplicationOptions(options) {
    const initialized = super._initializeApplicationOptions(options);

    initialized.classes.push(initialized.document.type);

    return initialized;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);

    Object.assign(context, {
      owner: this.document.isOwner,
      limited: this.document.limited,
      item: this.item,
      actor: this.actor,
      system: this.item.system,
      flags: this.item.flags,
      itemFields: this.item.schema.fields,
      config: CONFIG
    });

    return context;
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _preparePartContext(partId, context) {
    // TODO: Come up with clever way to automatically handle enriching HTML fields
    switch (partId) {
      case "effects":
        context.effects = prepareActiveEffectCategories(this.item.effects);
        context.tab = context.tabs[partId];
        break;
      case "properties":
        context.fields = await this._getFields();
        context.tab = context.tabs[partId];
        break;
    }
    return context;
  }

  /* -------------------------------------------------- */

  /**
   * Handles the system fields for the form-fields generic
   */
  async _getFields() {
    const doc = this.item;
    const source = doc._source;
    const systemFields = CONFIG.Item.dataModels[doc.type]?.schema.fields;
    const fieldSets = [];
    // TODO: Find a clever way to handle enrichment
    for (const field of Object.values(systemFields ?? {})) {
      const path = `system.${field.name}`;
      if (field instanceof foundry.data.fields.SchemaField) {
        const fieldset = {fieldset: true, legend: field.label, fields: []};
        await this.#addSystemFields(fieldset, field.fields, source, path);
        fieldSets.push(fieldset);
      } else {
        fieldSets.push({outer: {field, value: foundry.utils.getProperty(source, path)}});
      }
    }
    return fieldSets;
  }

  /* -------------------------------------------------- */

  /**
   * Recursively add system model fields to the fieldset.
   */
  async #addSystemFields(fieldset, schema, source, _path = "system") {
    for (const field of Object.values(schema)) {
      const path = `${_path}.${field.name}`;
      if (field instanceof foundry.data.fields.SchemaField) {
        this.#addSystemFields(fieldset, field.fields, source, path);
      } else if (field.constructor.hasFormSupport) {
        fieldset.fields.push({field, value: foundry.utils.getProperty(source, path)});
      }
    }
  }

  /* -------------------------------------------------- */

  /**
   * Actions performed after any render of the Application.
   * Post-render steps are not awaited by the render process.
   * @param {ApplicationRenderContext} context      Prepared context data
   * @param {RenderOptions} options                 Provided render options
   * @protected
   */
  _onRender(context, options) {
    this.#dragDrop.forEach((d) => d.bind(this.element));
  }

  /* -------------------------------------------------- */
  /*   Event handlers                                   */
  /* -------------------------------------------------- */

  /**
   * Renders an embedded document's sheet
   *
   * @this PLUMEItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #viewEffect(event, target) {
    const effect = this._getEffect(target);
    effect.sheet.render(true);
  }

  /* -------------------------------------------------- */

  /**
   * Handles item deletion
   *
   * @this PLUMEItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @protected
   */
  static async #deleteEffect(event, target) {
    const effect = this._getEffect(target);
    effect.delete();
  }

  /* -------------------------------------------------- */

  /**
   * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
   *
   * @this PLUMEItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #createEffect(event, target) {
    const aeCls = getDocumentClass("ActiveEffect");
    const effectData = {
      name: aeCls.defaultName({
        type: target.dataset.type,
        parent: this.item
      })
    };
    for (const [dataKey, value] of Object.entries(target.dataset)) {
      if (["action", "documentClass"].includes(dataKey)) continue;
      foundry.utils.setProperty(effectData, dataKey, value);
    }

    aeCls.create(effectData, {parent: this.item});
  }

  /* -------------------------------------------------- */

  /**
   * Determines effect parent to pass to helper
   *
   * @this PLUMEItemSheet
   * @param {PointerEvent} event   The originating click event
   * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
   * @private
   */
  static async #toggleEffect(event, target) {
    const effect = this._getEffect(target);
    effect.update({disabled: !effect.disabled});
  }

  /* -------------------------------------------------- */
  /*   Helper functions                                 */
  /* -------------------------------------------------- */

  /**
   * Fetches the row with the data for the rendered embedded document
   *
   * @param {HTMLElement} target  The element with the action
   * @returns {HTMLLIElement} The document's row
   */
  _getEffect(target) {
    const li = target.closest(".effect");
    return this.item.effects.get(li?.dataset?.effectId);
  }

  /* -------------------------------------------------- */
  /*   Drag and drop                                    */
  /* -------------------------------------------------- */

  /**
   * Define whether a user is able to begin a dragstart workflow for a given drag selector
   * @param {string} selector       The candidate HTML selector for dragging
   * @returns {boolean}             Can the current user drag this selector?
   * @protected
   */
  _canDragStart(selector) {
    return this.isEditable;
  }

  /* -------------------------------------------------- */

  /**
   * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
   * @param {string} selector       The candidate HTML selector for the drop target
   * @returns {boolean}             Can the current user drop on this selector?
   * @protected
   */
  _canDragDrop(selector) {
    return this.isEditable;
  }

  /* -------------------------------------------------- */

  /**
   * Callback actions which occur at the beginning of a drag start workflow.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ("link" in event.target.dataset) return;

    let dragData = null;

    if (li.dataset.effectId) {
      const effect = this.item.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    if (!dragData) return;

    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }

  /* -------------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is over a drop target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  _onDragOver(event) {}

  /* -------------------------------------------------- */

  /**
   * Callback actions which occur when a dragged element is dropped on a target.
   * @param {DragEvent} event       The originating DragEvent
   * @protected
   */
  async _onDrop(event) {
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const item = this.item;
    const allowed = Hooks.call("dropItemSheetData", item, this, data);
    if (allowed === false) return;

    // Handle different data types
    switch (data.type) {
      case "ActiveEffect":
        return this._onDropActiveEffect(event, data);
      case "Actor":
        return this._onDropActor(event, data);
      case "Item":
        return this._onDropItem(event, data);
      case "Folder":
        return this._onDropFolder(event, data);
    }
  }

  /* -------------------------------------------------- */

  /**
   * Handle the dropping of ActiveEffect data onto an Actor Sheet
   * @param {DragEvent} event                  The concluding DragEvent which contains drop data
   * @param {object} data                      The data transfer extracted from the event
   * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
   * @protected
   */
  async _onDropActiveEffect(event, data) {
    const aeCls = getDocumentClass("ActiveEffect");
    const effect = await aeCls.fromDropData(data);
    if (!this.item.isOwner || !effect) return false;

    if (this.item.uuid === effect.parent?.uuid) return this._onEffectSort(event, effect);
    aeCls.create(effect, {parent: this.item});
  }

  /* -------------------------------------------------- */

  /**
   * Sorts an Active Effect based on its surrounding attributes
   *
   * @param {DragEvent} event
   * @param {ActiveEffect} effect
   */
  _onEffectSort(event, effect) {
    const effects = this.item.effects;
    const dropTarget = event.target.closest("[data-effect-id]");
    if (!dropTarget) return;
    const target = effects.get(dropTarget.dataset.effectId);

    // Don't sort on yourself
    if (effect.id === target.id) return;

    // Identify sibling items based on adjacent HTML elements
    const siblings = [];
    for (let el of dropTarget.parentElement.children) {
      const siblingId = el.dataset.effectId;
      if (siblingId && (siblingId !== effect.id)) siblings.push(effects.get(el.dataset.effectId));
    }

    // Perform the sort
    const sortUpdates = SortingHelpers.performIntegerSort(effect, {
      target,
      siblings
    });
    const updateData = sortUpdates.map((u) => {
      const update = u.update;
      update._id = u.target._id;
      return update;
    });

    // Perform the update
    this.item.updateEmbeddedDocuments("ActiveEffect", updateData);
  }

  /* -------------------------------------------------- */

  /**
   * Handle dropping of an Actor data onto another Actor sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
   *                                     not permitted.
   * @protected
   */
  async _onDropActor(event, data) {
    if (!this.item.isOwner) return false;
  }

  /* -------------------------------------------------- */

  /**
   * Handle dropping of an item reference or item data onto an Actor Sheet
   * @param {DragEvent} event            The concluding DragEvent which contains drop data
   * @param {object} data                The data transfer extracted from the event
   * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
   * @protected
   */
  async _onDropItem(event, data) {
    if (!this.item.isOwner) return false;
  }

  /* -------------------------------------------------- */

  /**
   * Handle dropping of a Folder on an Actor Sheet.
   * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
   * @param {DragEvent} event     The concluding DragEvent which contains drop data
   * @param {object} data         The data transfer extracted from the event
   * @returns {Promise<Item[]>}
   * @protected
   */
  async _onDropFolder(event, data) {
    if (!this.item.isOwner) return [];
  }

  /* -------------------------------------------------- */
  /*   The following pieces set up drag                 */
  /*   handling and are unlikely to need modification   */
  /* -------------------------------------------------- */

  // This is marked as private because there's no real need
  // for subclasses or external hooks to mess with it directly
  #dragDrop = this.#createDragDropHandlers();

  /**
   * Returns an array of DragDrop instances
   * @type {DragDrop[]}
   */
  get dragDrop() {
    return this.#dragDrop;
  }

  /* -------------------------------------------------- */

  /**
   * Create drag-and-drop workflow handlers for this Application
   * @returns {DragDrop[]}     An array of DragDrop handlers
   * @private
   */
  #createDragDropHandlers() {
    return this.options.dragDrop.map((d) => {
      d.permissions = {
        dragstart: this._canDragStart.bind(this),
        drop: this._canDragDrop.bind(this)
      };
      d.callbacks = {
        dragstart: this._onDragStart.bind(this),
        dragover: this._onDragOver.bind(this),
        drop: this._onDrop.bind(this)
      };
      return new foundry.applications.ux.DragDrop(d);
    });
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class PLUMEActiveEffect extends foundry.documents.ActiveEffect {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {PLUMEActiveEffect} effect      The effect preparing derived data.
     */
    Hooks.callAll("PLUME.prepareActiveEffectData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class PLUMEActor extends foundry.documents.Actor {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {PLUMEActor} actor      The actor preparing derived data.
     */
    Hooks.callAll("PLUME.prepareActorData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class PLUMECard extends foundry.documents.Card {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {PLUMECard} card      The card preparing derived data.
     */
    Hooks.callAll("PLUME.prepareCardData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class PLUMECards extends foundry.documents.Cards {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {PLUMECards} cards      The cards preparing derived data.
     */
    Hooks.callAll("PLUME.prepareCardsData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class PLUMEChatMessage extends foundry.documents.ChatMessage {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {PLUMEChatMessage} message      The chat message preparing derived data.
     */
    Hooks.callAll("PLUME.prepareChatMessageData", this);
  }
}

/**
 * A "turns belong to users rather than tokens" variant of combatant
 */
class Player extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["PLUME.Combat.player"];

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    return {
      user: new foundry.data.fields.ForeignDocumentField(foundry.documents.User)
    };
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class PLUMECombat extends foundry.documents.Combat {
  /** @inheritdoc */
  prepareDerivedData() {

    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {PLUMECombat} combat      The combat preparing derived data.
     */
    Hooks.callAll("PLUME.prepareCombatData", this);
  }

  /* -------------------------------------------------- */

  /**
   * Adds a player combatant to the current combat
   * @returns {Promise<import("./PLUMECombatant.mjs").default>} The created Combatant
   */
  async addPlayer() {
    const data = {
      type: "player",
      system: {}
    };
    const fdObject = await foundry.applications.api.DialogV2.input({
      window: {title: "PLUME.Combat.AddPlayerCombatTracker"},
      content: Player.schema.getField("user").toFormGroup().outerHTML
    });
    foundry.utils.mergeObject(data, fdObject);
    const user = game.users.get(data.system.user);
    if (!user) return;
    data.name = user.name;
    data.img = user.avatar;
    const created = await this.createEmbeddedDocuments("Combatant", [data]);
    return created.shift();
  }

  /* -------------------------------------------------- */

  /**
   * @remarks Variant createDialog that includes the Base type
   * @inheritdoc
   * @param {import("@common/types.mjs").CombatData} data
   * @param {import("@common/abstract/_types.mjs").DatabaseCreateOperation} createOptions
   * @param {context} context Options forwarded to DialogV2.prompt
   * @param {string[]} [context.types]   A restriction of the selectable sub-types of the Dialog.
   * @param {string} [context.template]  A template to use for the dialog contents instead of the default.
   * @returns {Promise<PLUMECombat|null>}   A Promise which resolves to the created Document, or null if the dialog was
    *                                     closed.
   */
  static async createDialog(data = {}, createOptions = {}, {types, template, ...dialogOptions} = {}) {
    const applicationOptions = {
      top: "position", left: "position", width: "position", height: "position", scale: "position", zIndex: "position",
      title: "window", id: "", classes: "", jQuery: ""
    };

    for (const [k, v] of Object.entries(createOptions)) {
      if (k in applicationOptions) {
        foundry.utils.logCompatibilityWarning("The ClientDocument.createDialog signature has changed. "
          + "It now accepts database operation options in its second parameter, "
          + "and options for DialogV2.prompt in its third parameter.", {since: 13, until: 15, once: true});
        const dialogOption = applicationOptions[k];
        if (dialogOption) foundry.utils.setProperty(dialogOptions, `${dialogOption}.${k}`, v);
        else dialogOptions[k] = v;
        delete createOptions[k];
      }
    }

    const {parent, pack} = createOptions;
    const cls = this.implementation;

    // Identify allowed types
    const documentTypes = [];
    let defaultType = CONFIG[this.documentName]?.defaultType;
    let defaultTypeAllowed = false;
    let hasTypes = false;
    if (types?.length === 0) throw new Error("The array of sub-types to restrict to must not be empty");

    // Register supported types
    for (const type of this.TYPES) {
      if (types && !types.includes(type)) continue;
      let label = CONFIG[this.documentName]?.typeLabels?.[type];
      label = label && game.i18n.has(label) ? game.i18n.localize(label) : type;
      documentTypes.push({value: type, label});
      if (type === defaultType) defaultTypeAllowed = true;
    }
    if (!documentTypes.length) throw new Error("No document types were permitted to be created");

    if (!defaultTypeAllowed) defaultType = documentTypes[0].value;
    // Sort alphabetically
    documentTypes.sort((a, b) => a.label.localeCompare(b.label, game.i18n.lang));

    // Collect data
    const label = game.i18n.localize(this.metadata.label);
    const title = game.i18n.format("DOCUMENT.Create", {type: label});
    const type = data.type || defaultType;

    // Render the document creation form
    template ??= systemPath("templates/combat/create-dialog.hbs");
    const html = await renderTemplate(template, {
      hasTypes, type,
      name: data.name || "",
      defaultName: cls.defaultName({type, parent, pack}),
      hasFolders: false,
      types: documentTypes
    });

    // Render the confirmation dialog window
    return foundry.applications.api.DialogV2.prompt(foundry.utils.mergeObject({
      content: html,
      window: {title},
      position: {width: 360},
      ok: {
        label: title,
        callback: (event, button) => {
          const fd = new foundry.applications.ux.FormDataExtended(button.form);
          foundry.utils.mergeObject(data, fd.object);
          if (!data.name?.trim()) data.name = cls.defaultName({type: data.type, parent, pack});
          return cls.create(data, {renderSheet: false, ...createOptions});
        }
      }
    }, dialogOptions));
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class PLUMECombatant extends foundry.documents.Combatant {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {PLUMECombatant} combatant      The combatant preparing derived data.
     */
    Hooks.callAll("PLUME.prepareCombatantData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class PLUMEItem extends foundry.documents.Item {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {PLUMEItem} item      The item preparing derived data.
     */
    Hooks.callAll("PLUME.prepareItemData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class PLUMEScene extends foundry.documents.Scene {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {PLUMEScene} scene      The scene preparing derived data.
     */
    Hooks.callAll("PLUME.prepareSceneData", this);
  }
}

/**
 * A simple extension that adds a hook at the end of data prep
 */
class PLUMEUser extends foundry.documents.User {
  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();

    /**
     * Flexible hook for modules to alter derived document data.
     * @param {PLUMEUser} user      The user preparing derived data.
     */
    Hooks.callAll("PLUME.prepareUserData", this);
  }
}

var documents = /*#__PURE__*/Object.freeze({
  __proto__: null,
  PLUMEActiveEffect: PLUMEActiveEffect,
  PLUMEActor: PLUMEActor,
  PLUMECard: PLUMECard,
  PLUMECards: PLUMECards,
  PLUMEChatMessage: PLUMEChatMessage,
  PLUMECombat: PLUMECombat,
  PLUMECombatant: PLUMECombatant,
  PLUMEItem: PLUMEItem,
  PLUMEScene: PLUMEScene,
  PLUMEUser: PLUMEUser
});

/**
 * Simple data model for chess pieces as a type of actor
 */
class ChessModel extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["PLUME.Chess"];

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    return {
      piece: new foundry.data.fields.StringField({
        required: true,
        choices: CONFIG.PLUME.chess.pieces,
        initial: "pawn"
      })
    };
  }
}

/**
 * Simple data model for game tokens as a type of actor
 */
class GameTokenModel extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static LOCALIZATION_PREFIXES = ["PLUME.GameToken"];

  /* -------------------------------------------------- */

  /** @inheritdoc */
  static defineSchema() {
    const {SchemaField, NumberField} = foundry.data.fields;
    return {
      count: new NumberField(),
      resource: new SchemaField({
        value: new NumberField(),
        max: new NumberField()
      })
    };
  }

  /* -------------------------------------------------- */

  /** @inheritdoc */
  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    if (!foundry.utils.hasProperty(data, "prototypeToken.bar1.attribute")) {
      this.parent.updateSource({"prototypeToken.bar1.attribute": "count"});
    }
  }
}

const config$1 = {
  token: GameTokenModel
};

const config = {
  player: Player
};

Hooks.once("init", () => {
  CONFIG.PLUME = PLUME;

  // Assign document classes
  for (const docCls of Object.values(documents)) {
    CONFIG[docCls.documentName].documentClass = docCls;
  }

  Object.assign(CONFIG.Actor.dataModels, config$1);
  Object.assign(CONFIG.Combatant.dataModels, config);

  CONFIG.Actor.defaultType = "token";

  // Document Sheets
  foundry.documents.collections.Actors.registerSheet("plume", PLUMEActorSheet, {
    makeDefault: true, label: "PLUME.Sheets.Labels.ActorSheet",
    types: ["character"],
    label: "PLUME Actor Sheet"
  });
  foundry.documents.collections.Items.registerSheet("plume", PLUMEItemSheet, {
    makeDefault: true, label: "PLUME.Sheets.Labels.ActorSheet",
    label: "PLUME Item Sheet"
  });

  // Sidebar tabs
  CONFIG.ui.combat = PLUMECombatTracker;
});

Hooks.once("i18nInit", () => {
  // Localizing the system's CONFIG object
  localizeHelper(CONFIG.PLUME);
});

Hooks.on("renderCombatantConfig", renderCombatantConfig);

Hooks.on("renderChatMessageHTML", (message, html, data) => {
  if (!message.rolls?.length) return;

  // 1. Find the containers we labeled in the macro
  const containers = html.querySelectorAll(".roll-container");

  containers.forEach((el, index) => {
    // 2. Match this HTML box to the corresponding Roll object
    const roll = message.rolls[index];
    if (!roll) return;

    // 3. Check for natural 12 on a d12
    // Works for both Roll objects and toJSON() data
    const dice = roll.dice || roll.terms?.filter(t => t.faces === 12) || [];
    const hasNat12 = dice.some(die => 
      die.results.some(r => r.result === 12 && (r.active !== false))
    );

    if (hasNat12) {
      // 4. Color the specific total in this container
      const total = el.querySelector(".dice-total");
      if (total) {
        total.style.setProperty("color", "green", "important");
        total.style.setProperty("font-weight", "bold", "important");
      }
    }
  });
});


Hooks.on("renderChatMessageHTML", (message, html, context) => {
  const diceTotalElements = html.querySelectorAll(".dice-total");
  
  if (diceTotalElements.length && message.rolls?.length > 0) {
    diceTotalElements.forEach((element, index) => {
      const roll = message.rolls[index];
      
      if (roll) {
        // 1. Map the die results into a readable string like [8, 4, 12]
        const dieResults = roll.dice.map(d => 
          `[${d.results.map(r => r.result).join(", ")}]`
        ).join(" + ");

        // 2. Combine formula and results for the tooltip
        const tooltipText = `${roll.formula} : ${dieResults}`;

        element.addEventListener("mouseenter", event => {
          game.tooltip.activate(event.currentTarget, {
            text: tooltipText,
            direction: "UP"
          });
        });

        element.addEventListener("mouseleave", () => {
          game.tooltip.deactivate();
        });
      }
    });
  }
});

// WIP

Hooks.once("ready", async () => {
    if (!game.user.isGM) return;

    const folderName = "Plume Macros";
    // Define the paths to your local JSON files here
    const macroPaths = [
        { path: "systems/plume/macros/Edit_HP.json", slot: 1 },
        { path: "systems/plume/macros/Edit_RISK.json", slot: 2 },
        { path: "systems/plume/macros/Edit_SP.json", slot: 3 },
        { path: "systems/plume/macros/Edit_SP_HP.json", slot: 4 },
        { path: "systems/plume/macros/Reset_HP_Risk.json", slot: 5 },
        { path: "systems/plume/macros/Reset_HP_SP.json", slot: 6 },
        { path: "systems/plume/macros/Break.json", slot: 7 },
        { path: "systems/plume/macros/Break_Poise.json", slot: 8 },
        { path: "systems/plume/macros/Fatigue.json", slot: 9 },
        { path: "systems/plume/macros/Cum.json", slot: 10 }
    ];

    // 1. Find or Create the Folder
    let folder = game.folders.find(f => f.name === folderName && f.type === "Macro");
    if (!folder) {
        folder = await Folder.create({ name: folderName, type: "Macro", color: "#2ecc71" });
    }

    // 2. Fetch and Create the Macros
    for (let item of macroPaths) {
        try {
            const response = await fetch(item.path);
            if (!response.ok) throw new Error(`Could not find file at ${item.path}`);
            
            const data = await response.json();

            // 1. Find or Create the Macro
            let macro = game.macros.find(m => m.name === data.name);
            
            if (!macro) {
                macro = await Macro.create({
                    name: data.name,
                    type: data.type || "script",
                    img: data.img || "icons/svg/dice-target.svg",
                    command: data.command,
                    folder: folder.id,
                    ownership: { default: 3 }
                });
                console.log(`Plume | Imported Macro: ${data.name}`);
            }

            // 2. Assign to Hotbar Slot
            // This will put the macro in the specified slot for the current user
            await game.user.assignHotbarMacro(macro, item.slot);

        } catch (err) {
            console.error(`Plume | Failed to import macro from ${item.path}:`, err);
        }
    }
});

//WIP

// 1. Force defaults onto every new Actor (Prototype Token)
Hooks.on("preCreateActor", (actor, data, options, userId) => {
  const updates = {
    "prototypeToken.displayBars": 50,
    "prototypeToken.displayName": 50,
    "prototypeToken.lockRotation": true
  };
  actor.updateSource(updates);
  console.log("Plume | Forced Prototype Token defaults on new Actor.");
});

// 2. Force defaults onto every new Token dragged to a map
Hooks.on("preCreateToken", (token, data, options, userId) => {
  const updates = {
    displayBars: 50,
    displayName: 30,
    lockRotation: true
  };
  token.updateSource(updates);
  console.log("Plume | Forced Token defaults on map placement.");
});

// 3. Force defaults onto every new Scene
Hooks.on("preCreateScene", (scene, data, options, userId) => {
  const updates = {
    "grid.size": 128,
    "grid.type": 1,
    backgroundColor: "#FFFFFF"
  };
  scene.updateSource(updates);
  console.log("Plume | Forced Scene defaults.");
});

Hooks.once("ready", async () => {
    // 1. Only the GM should modify global permissions
    if (!game.user.isGM) return;

    // 2. Define the permission keys and roles to ensure (1 = Player, 2 = Trusted)
    const keysToUpdate = ["FILES_UPLOAD", "FILES_BROWSE", "TOKEN_CREATE", "TOKEN_DELETE", "ACTOR_CREATE", "DRAWING_CREATE", "TOKEN_CONFIGURE"];
    const rolesToGrant = [1, 2];
    
    // 3. Get current permissions
    const currentPermissions = foundry.utils.deepClone(game.settings.get("core", "permissions"));
    let needsUpdate = false;

    // 4. Iterate through each key and check if roles are missing
    for (const key of keysToUpdate) {
        // Ensure the permission array exists
        currentPermissions[key] ??= [];

        for (const role of rolesToGrant) {
            if (!currentPermissions[key].includes(role)) {
                currentPermissions[key].push(role);
                needsUpdate = true;
            }
        }
    }

    // 5. Save only if changes were actually made
    if (needsUpdate) {
        await game.settings.set("core", "permissions", currentPermissions);
        console.log("Plume | Permissions updated: Players/Trusted can now upload files and manage tokens.");
        ui.notifications.info("Plume | File upload and Token management permissions updated.");
    }
});

Hooks.once("init", () => {
  // Replace the entire status effects array with your own custom list
  CONFIG.statusEffects = [
    {
      id: "a_clothes",
      name: "CLOTHES",
      img: "systems/plume/icons/clothes.png"
    },
    {
      id: "a_grab",
      name: "GRABBING",
      img: "systems/plume/icons/grab.png"
    },
    {
      id: "a_grabbed",
      name: "GRABBED",
      img: "systems/plume/icons/grab2.png"
    },
    {
      id: "bow",
      name: "ranged weapon",
      img: "systems/plume/icons/!!bow.png"
    },
    {
      id: "acc-down",
      name: "ACC-DOWN",
      img: "systems/plume/icons/!acc-down.png"
    },
    {
      id: "acc-up",
      name: "ACC-UP",
      img: "systems/plume/icons/!acc-up.png"
    },
    {
      id: "atk-down",
      name: "ATK-DOWN",
      img: "systems/plume/icons/!atk-down.png"
    },
    {
      id: "atk-up",
      name: "ATK-UP",
      img: "systems/plume/icons/!atk-up.png"
    },
    {
      id: "cdmg-down",
      name: "CDMG-DOWN",
      img: "systems/plume/icons/!cdmg-down.png"
    },
    {
      id: "cdmg-up",
      name: "CDMG-UP",
      img: "systems/plume/icons/!cdmg-up.png"
    },
    {
      id: "crit-down",
      name: "CRIT-DOWN",
      img: "systems/plume/icons/!crit-down.png"
    },
    {
      id: "crit-up",
      name: "CRIT-UP",
      img: "systems/plume/icons/!crit-up.png"
    },
    {
      id: "def-down",
      name: "DEF-DOWN",
      img: "systems/plume/icons/!def-down.png"
    },
    {
      id: "def-up",
      name: "DEF-UP",
      img: "systems/plume/icons/!def-up.png"
    },
    {
      id: "ext-down",
      name: "EXT-DOWN",
      img: "systems/plume/icons/!ext-down.png"
    },
    {
      id: "ext-up",
      name: "EXT-UP",
      img: "systems/plume/icons/!ext-up.png"
    },
    {
      id: "res-down",
      name: "RES-DOWN",
      img: "systems/plume/icons/!res-down.png"
    },
    {
      id: "res-up",
      name: "RES-UP",
      img: "systems/plume/icons/!res-up.png"
    },
    {
      id: "tgh-down",
      name: "TGH-DOWN",
      img: "systems/plume/icons/!tgh-down.png"
    },
    {
      id: "tgh-up",
      name: "TGH-UP",
      img: "systems/plume/icons/!tgh-up.png"
    },
    {
      id: "will-down",
      name: "WILL-DOWN",
      img: "systems/plume/icons/!will-down.png"
    },
    {
      id: "will-up",
      name: "WILL-UP",
      img: "systems/plume/icons/!will-up.png"
    },
    {
      id: "ammo",
      name: "GUN1",
      img: "systems/plume/icons/ammo.png"
    },
    {
      id: "ammo2",
      name: "GUN2",
      img: "systems/plume/icons/ammo2.png"
    },
    {
      id: "bless",
      name: "BLESS",
      img: "systems/plume/icons/bless.png"
    },
    {
      id: "bomb",
      name: "BOMB",
      img: "systems/plume/icons/bomb.png"
    },
    {
      id: "burn",
      name: "BURN",
      img: "systems/plume/icons/burn.png"
    },
    {
      id: "chill",
      name: "CHILL",
      img: "systems/plume/icons/chill.png"
    },
    {
      id: "curse",
      name: "CURSE",
      img: "systems/plume/icons/curse.png"
    },
    {
      id: "daze",
      name: "DAZE",
      img: "systems/plume/icons/daze.png"
    },
    {
      id: "enrage",
      name: "ENRAGE",
      img: "systems/plume/icons/enrage.png"
    },
    {
      id: "female",
      name: "FEMALE",
      img: "systems/plume/icons/female.png"
    },
    {
      id: "haste",
      name: "HASTE",
      img: "systems/plume/icons/haste.png"
    },
    {
      id: "immune",
      name: "IMMUNE",
      img: "systems/plume/icons/immune.png"
    },
    {
      id: "male",
      name: "MALE",
      img: "systems/plume/icons/male.png"
    },
    {
      id: "mark",
      name: "MARK",
      img: "systems/plume/icons/MARK.png"
    },
    {
      id: "prone",
      name: "PRONE",
      img: "systems/plume/icons/prone.png"
    },
    {
      id: "regen",
      name: "REGEN",
      img: "systems/plume/icons/regen.png"
    },
    {
      id: "shield",
      name: "SHIELD",
      img: "systems/plume/icons/shield.png"
    },
    {
      id: "shock",
      name: "SHOCK",
      img: "systems/plume/icons/shock.png"
    },
    {
      id: "sleep",
      name: "SLEEP",
      img: "systems/plume/icons/sleep.png"
    },
    {
      id: "stealth",
      name: "STEALTH",
      img: "systems/plume/icons/stealth.png"
    },
    {
      id: "stun",
      name: "STUN",
      img: "systems/plume/icons/stun.png"
    },
    {
      id: "taunt",
      name: "TAUNT",
      img: "systems/plume/icons/taunt.png"
    },
    {
      id: "undead",
      name: "UNDEAD",
      img: "systems/plume/icons/undead.png"
    },
    {
      id: "wet",
      name: "WET",
      img: "systems/plume/icons/wet.png"
    },
    {
      id: "focus",
      name: "FOCUS",
      img: "systems/plume/icons/x_focus.png"
    },
    {
      id: "technique",
      name: "TECHNIQUE",
      img: "systems/plume/icons/x_technique.png"
    },
    {
      id: "xxx_charm",
      name: "CHARM",
      img: "systems/plume/icons/xxx_charm.png"
    },
    {
      id: "xxx_erotic",
      name: "EROTIC",
      img: "systems/plume/icons/xxx_erotic.png"
    },
    {
      id: "xxx_hold",
      name: "HOLD",
      img: "systems/plume/icons/xxx_hold.png"
    },
    {
      id: "xxx_horny",
      name: "HORNY",
      img: "systems/plume/icons/xxx_horny.png"
    },
    {
      id: "xxx_pin",
      name: "PIN",
      img: "systems/plume/icons/xxx_pin.png"
    },
    {
      id: "xxx_poison",
      name: "POISON",
      img: "systems/plume/icons/xxx_poison.png"
    },
    {
      id: "xxx_position",
      name: "POSITION",
      img: "systems/plume/icons/xxx_position.png"
    },
    {
      id: "xxx_shame",
      name: "SHAME",
      img: "systems/plume/icons/xxx_shame.png"
    },
    {
      id: "xxx_tender",
      name: "TENDER",
      img: "systems/plume/icons/xxx_tender.png"
    },
    {
      id: "xxx_timid",
      name: "TIMID",
      img: "systems/plume/icons/xxx_timid.png"
    },
    {
      id: "y_blush",
      name: "BLUSH",
      img: "systems/plume/icons/y_blush.png"
    },
    {
      id: "y_collar",
      name: "COLLAR",
      img: "systems/plume/icons/y_collar.png"
    },
    {
      id: "y_bonded",
      name: "BONDED",
      img: "systems/plume/icons/y_bonded.png"
    },
    {
      id: "y_filled",
      name: "FILLED",
      img: "systems/plume/icons/y_filled.png"
    },
    {
      id: "y_heat",
      name: "HEAT",
      img: "systems/plume/icons/y_heat.png"
    },
    {
      id: "y_impregnated",
      name: "IMPREGNATED",
      img: "systems/plume/icons/y_impregnated.png"
    },
    {
      id: "y_eager",
      name: "EAGER",
      img: "systems/plume/icons/y_eager.png"
    },
    {
      id: "z_COIN",
      name: "COIN",
      img: "systems/plume/icons/z_COIN.png"
    },
    {
      id: "z_cooldown",
      name: "COOLDOWN",
      img: "systems/plume/icons/z_cooldown.png"
    },
    {
      id: "DEATH",
      name: "DEATH",
      img: "systems/plume/icons/zzz_death.png"
    }
  ];

  console.log("Plume | Custom Status Effects Initialized");
});

// We extend the modern ApplicationV2 framework
const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

class MyCustomHUD extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(options = {}) {
    super(options);
    this.token = options.token; // Store the token specifically
  }

  static DEFAULT_OPTIONS = {
    id: "my-custom-token-hud",
    classes: ["plume-hud"], // Add a CSS class for easier styling
    tag: "aside",
    window: {
        frame: false, // Removes the window border/close button
        resizable: false
    },
    position: {
        width: 200,
        height: "auto"
    }
  };

  // Modern way to define the template path
  static PARTS = {
    hud: {
      template: "systems/plume/templates/hud.html"
    }
  };

  // Modern way to send data to the HTML
  async _prepareContext(_options) {
      const actor = this.token?.actor;
      if (!actor) return { img: "", hp: 0, hpMax: 0, hpPct: 0, spirit: 0, spMax: 0, spiritPct: 0, risk: 0, rMax: 0, riskPct: 0 };

      const hp = actor.system.health || { value: 0, max: 1 };
      const spirit = actor.system.spirit || { value: 0, max: 1 };
      const risk = actor.system.risk || { value: 0, max: 1 };

      return {
          name: actor.name,
          level: actor.system.progression.level || "",
          race: actor.system.progression.race || "",
          class: actor.system.progression.class || "",
          boss: actor.system.progression.boss || "",
          scaling: actor.system.progression.scaling || "",
          type: actor.system.progression.type || "",
          img: this.token.document.texture.src || "",
          // Current Values
          hp: hp.value ?? 0,
          spirit: spirit.value ?? 0,
          risk: risk.value ?? 0,
          // Max Values
          hpMax: hp.max ?? 0,
          spMax: spirit.max ?? 0,
          rMax: risk.max ?? 0,
          // Percentages
          hpPct: Math.clamp(((hp.value || 0) / (hp.max || 1)) * 100, 0, 100),
          spiritPct: Math.clamp(((spirit.value || 0) / (spirit.max || 1)) * 100, 0, 100),
          riskPct: Math.clamp(((risk.value || 0) / (6)) * 100, 0, 100)
      };
  }
}

// 2. Update when any macro is executed
Hooks.on("runMacro", (macro, data, result) => {
  updateCustomHUD();
});

// Keep track of the active HUD instance globally or within your module scope
let activeCustomHUD = null;

Hooks.on("targetToken", (user, token, targeted) => {
    // Only trigger for the current user targeting tokens
    if (user.id !== game.user.id) return;

    // Scenario 1: Token was untargeted
    if (!targeted) {
        if (activeCustomHUD && activeCustomHUD.token?.id === token.id) {
            activeCustomHUD.close();
            activeCustomHUD = null;
        }
        return;
    }

    // Scenario 2: Token was targeted
    // Close any previously open HUD first to prevent multiple overlays
    if (activeCustomHUD) {
        activeCustomHUD.close();
    }

    // Instantiate and render the new HUD for the targeted token
    activeCustomHUD = new MyCustomHUD({ token: token });
    activeCustomHUD.render(true);
});

// Helper function to refresh the HUD for the currently targeted token
function updateCustomHUD() {
    // Get the first token targeted by the current user
    const token = game.user.targets.values().next().value;
    const existing = Object.values(ui.windows).find(w => w.id === "my-custom-token-hud");

    if (token) {
        if (existing) existing.close();
        new MyCustomHUD({ token }).render(true);
    } else if (existing) {
        existing.close();
    }
}


Hooks.on("combatTurnChange", async (combat, prev, curr) => {
  if (!game.user.isGM) return;
  // Only trigger if the turn actually changed (not just a round change)
  if (prev.turn === curr.turn && prev.round === curr.round) return;

  // Get the combatant whose turn just started
  const combatant = combat.turns[curr.turn];
  if (!combatant || !combatant.actor) return;

  const actor = combatant.actor;
  const currentRisk = getProperty(actor, "system.risk.value") || 0;
  const newRisk = Math.min(currentRisk + 1, 6);

  

  // 1. Send the chat message
  ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content: `
      <div class="dice-roll">
        <div class="dice-result">
          <div class="dice-formula">${actor.name}'s turn starts!</div>
          <div class="dice-total">Risk ${currentRisk} -> ${newRisk}</div>
        </div>
      </div>
    `
  });

  // 2. Update the actor's risk value
  await actor.update({ "system.risk.value": newRisk });

});























