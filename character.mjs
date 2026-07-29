const {SchemaField, NumberField, BooleanField, StringField, ArrayField} = foundry.data.fields;

export default class CharacterData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			health: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				max: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			spirit: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				max: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			risk: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			fatigue: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			arousal: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			progression: new SchemaField({
				element: new StringField({ initial: '' }),
				level: new StringField({ initial: '0' }),
				alignment: new StringField({ initial: '' }),
				rank: new NumberField({ required: true, integer: true, initial: 0 }),
				race: new StringField({ initial: '' }),
				class: new StringField({ initial: '' }),
				type: new StringField({ initial: '' }),
				scaling: new StringField({ initial: '' }),
				boss: new StringField({ initial: '' }),
				athletics: new BooleanField({ required: true, initial: false }),
				awareness: new BooleanField({ required: true, initial: false }),
				bartering: new BooleanField({ required: true, initial: false }),
				knowledge: new BooleanField({ required: true, initial: false }),
				larceny: new BooleanField({ required: true, initial: false }),
				persuasion: new BooleanField({ required: true, initial: false }),
				sneaking: new BooleanField({ required: true, initial: false }),
				alchemy: new BooleanField({ required: true, initial: false }),
				blacksmith: new BooleanField({ required: true, initial: false }),
				cooking: new BooleanField({ required: true, initial: false }),
				enchanting: new BooleanField({ required: true, initial: false }),
				holycraft: new BooleanField({ required: true, initial: false }),
				technology: new BooleanField({ required: true, initial: false })
			}),
			str: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				bonus: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			dex: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				bonus: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			vig: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				bonus: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			mag: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				bonus: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			fth: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				bonus: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			evasion: new SchemaField({
				bonus: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			grip: new SchemaField({
				bonus: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			pointbuy: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				bonus: new NumberField({ required: true, integer: true, initial: 0 })
			}),
			acc: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				up: new BooleanField({ required: true, initial: false }),
				down: new BooleanField({ required: true, initial: false }),
			}),
			atk: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				up: new BooleanField({ required: true, initial: false }),
				down: new BooleanField({ required: true, initial: false }),
			}),
			pre: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				up: new BooleanField({ required: true, initial: false }),
				down: new BooleanField({ required: true, initial: false }),
			}),
			def: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				up: new BooleanField({ required: true, initial: false }),
				down: new BooleanField({ required: true, initial: false }),
			}),
			res: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				up: new BooleanField({ required: true, initial: false }),
				down: new BooleanField({ required: true, initial: false }),
			}),
			tgh: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				up: new BooleanField({ required: true, initial: false }),
				down: new BooleanField({ required: true, initial: false }),
			}),
			ext: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				up: new BooleanField({ required: true, initial: false }),
				down: new BooleanField({ required: true, initial: false }),
			}),
			fer: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				up: new BooleanField({ required: true, initial: false }),
				down: new BooleanField({ required: true, initial: false }),
			}),
			will: new SchemaField({
				value: new NumberField({ required: true, integer: true, initial: 0 }),
				up: new BooleanField({ required: true, initial: false }),
				down: new BooleanField({ required: true, initial: false }),
			}),
			cute: new SchemaField({
				up: new BooleanField({ required: true, initial: false }),
				yes: new BooleanField({ required: true, initial: false }),
				story: new StringField({}),
			}),
			armor: new SchemaField({
				NAME: new StringField({ initial: 'Clothes' }),
				NOTES: new StringField({ initial: '+1 Eva. A basic set of clothes.' }),
			}),
			weapon1: new SchemaField({
				HIT: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: 'Unarmed' }),
				NOTES: new StringField({ initial: 'Quick. Versatile(+1 Evasion)' }),
				DAMAGE: new StringField({ initial: '1d6' }),
			}),
			weapon2: new SchemaField({
				HIT: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: 'Unarmed' }),
				NOTES: new StringField({ initial: 'Quick. Versatile(+1 Evasion)' }),
				DAMAGE: new StringField({ initial: '1d6' }),
			}),
			weapon3: new SchemaField({
				HIT: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: 'Nothing' }),
				NOTES: new StringField({ initial: 'Notes' }),
				DAMAGE: new StringField({ initial: '0' }),
			}),
			weapon4: new SchemaField({
				HIT: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: 'Nothing' }),
				NOTES: new StringField({ initial: 'Notes' }),
				DAMAGE: new StringField({ initial: '0' }),
			}),
			weapon5: new SchemaField({
				HIT: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: 'Nothing' }),
				NOTES: new StringField({ initial: 'Notes' }),
				DAMAGE: new StringField({ initial: '0' }),
			}),
			save1: new SchemaField({
				HIT: new StringField({ initial: '0' }),
				VS: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				DAMAGE: new StringField({ initial: '0' }),
			}),
			save2: new SchemaField({
				HIT: new StringField({ initial: '0' }),
				VS: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				DAMAGE: new StringField({ initial: '0' }),
			}),
			save3: new SchemaField({
				HIT: new StringField({ initial: '0' }),
				VS: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				DAMAGE: new StringField({ initial: '0' }),
			}),
			save4: new SchemaField({
				HIT: new StringField({ initial: '0' }),
				VS: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				DAMAGE: new StringField({ initial: '0' }),
			}),
			save5: new SchemaField({
				HIT: new StringField({ initial: '0' }),
				VS: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				DAMAGE: new StringField({ initial: '0' }),
			}),
			save6: new SchemaField({
				HIT: new StringField({ initial: '0' }),
				VS: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				DAMAGE: new StringField({ initial: '0' }),
			}),
			sex0: new SchemaField({
				NAME: new StringField({ initial: 'Instinct' }),
				NOTES: new StringField({ initial: '' }),
				DAMAGE: new StringField({ initial: '2d10' }),
			}),
			sex1: new SchemaField({
				TYPE: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				DAMAGE: new StringField({ initial: '0' }),
				DMGTYPE: new StringField({ initial: '0' }),
			}),
			sex2: new SchemaField({
				TYPE: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				DAMAGE: new StringField({ initial: '0' }),
				DMGTYPE: new StringField({ initial: '0' }),
			}),
			sex3: new SchemaField({
				TYPE: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				DAMAGE: new StringField({ initial: '0' }),
				DMGTYPE: new StringField({ initial: '0' }),
			}),
			sex4: new SchemaField({
				TYPE: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				DAMAGE: new StringField({ initial: '0' }),
				DMGTYPE: new StringField({ initial: '0' }),
			}),
			skill1: new SchemaField({
				TYPE: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
			}),
			skill2: new SchemaField({
				TYPE: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
			}),
			skill3: new SchemaField({
				TYPE: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
			}),
			skill4: new SchemaField({
				TYPE: new StringField({ initial: '0' }),
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
			}),
			edge1: new SchemaField({
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' })
			}),
			edge2: new SchemaField({
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' })
			}),
			inventory: new ArrayField(new SchemaField({
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				NUMBER: new StringField({ initial: '0' })
			})),
			inventory2: new ArrayField(new SchemaField({
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				NUMBER: new StringField({ initial: '0' })
			})),
			inventory3: new ArrayField(new SchemaField({
				NAME: new StringField({ initial: '' }),
				NOTES: new StringField({ initial: '' }),
				NUMBER: new StringField({ initial: '0' })
			}))
		};
	};

	// stat getters
	get getLevel() {return this.progression.level || 0;}
	get getRank() {return this.progression.rank || 0;}
	get strTotal() { return this.str.value + this.str.bonus; }
	get dexTotal() { return this.dex.value + this.dex.bonus; }
	get vigTotal() { return this.vig.value + this.vig.bonus; }
	get magTotal() { return this.mag.value + this.mag.bonus; }
	get fthTotal() { return this.fth.value + this.fth.bonus; }
	get evasionTotal() { return 6 + this.dexTotal + this.evasion.bonus; }
	get gripDC() { return 6 + this.strTotal + this.grip.bonus; }
	get grapple() { return Math.max(this.strTotal, this.dexTotal); }
	get escapeDC() { return 6+Math.max(this.strTotal, this.dexTotal); }
	get rankbonus() { return 25+(this.progression.rank*7); }
	// pointbuy getters
	get getCost() { return 0+((this.str.value**2 + 3*this.str.value)/2)+((this.dex.value**2 + 3*this.dex.value)/2)+((this.vig.value**2 + 3*this.vig.value)/2)+((this.mag.value**2 + 3*this.mag.value)/2)+((this.fth.value**2 + 3*this.fth.value)/2); }
	get maxCost() { return (25 + this.progression.rank + this.pointbuy.bonus); }
	// substat getters
	get accTotal() { return (this.acc.value + (this.acc.up ? 3 : 0) + (this.acc.down ? -3 : 0)); }
	get atkTotal() { return (this.atk.value + (this.atk.up ? 3 : 0) + (this.atk.down ? -3 : 0)); }
	get preTotal() { return (this.pre.value + (this.pre.up ? 3 : 0) + (this.pre.down ? -3 : 0)); }
	get defTotal() { return (this.def.value + (this.def.up ? 3 : 0) + (this.def.down ? -3 : 0)); }
	get resTotal() { return (this.res.value + (this.res.up ? 3 : 0) + (this.res.down ? -3 : 0)); }
	get tghTotal() { return (this.tgh.value + (this.tgh.up ? 3 : 0) + (this.tgh.down ? -3 : 0)); }
	get extTotal() { return (this.ext.value + (this.ext.up ? 3 : 0) + (this.ext.down ? -3 : 0)); }
	get ferTotal() { return (this.fer.value + (this.fer.up ? 3 : 0) + (this.fer.down ? -3 : 0)); }
	get willTotal() { return (this.will.value + (this.will.up ? 3 : 0) + (this.will.down ? -3 : 0)); }
	// boolean checks getters
	get athleticsBonus() { return ( (this.progression.athletics ? 25+(this.progression.rank*7) : 0)); }
	get awarenessBonus() { return ( (this.progression.awareness ? 25+(this.progression.rank*7) : 0)); }
	get barteringBonus() { return ( (this.progression.bartering ? 25+(this.progression.rank*7) : 0)); }
	get knowledgeBonus() { return ( (this.progression.knowledge ? 25+(this.progression.rank*7) : 0)); }
	get larcenyBonus() { return ( (this.progression.larceny ? 25+(this.progression.rank*7) : 0)); }
	get persuasionBonus() { return ( (this.progression.persuasion ? 25+(this.progression.rank*7) : 0)); }
	get sneakingBonus() { return ( (this.progression.sneaking ? 25+(this.progression.rank*7) : 0)); }
	get alchemyBonus() { return ( (this.progression.alchemy ? 25+(this.progression.rank*7) : 0)); }
	get blacksmithBonus() { return ( (this.progression.blacksmith ? 25+(this.progression.rank*7) : 0)); }
	get cookingBonus() { return ( (this.progression.cooking ? 25+(this.progression.rank*7) : 0)); }
	get enchantingBonus() { return ( (this.progression.enchanting ? 25+(this.progression.rank*7) : 0)); }
	get holycraftBonus() { return ( (this.progression.holycraft ? 25+(this.progression.rank*7) : 0)); }
	get technologyBonus() { return ( (this.progression.technology ? 25+(this.progression.rank*7) : 0)); }
	// hp/spirit getter
	get fatigueTotal() {return (this.fatigue.value);}
	get arousalTotal() {return (this.arousal.value);}
	get scalingTotal() {
		if (this.progression.scaling == 'Minion') {return 3};
		if (this.progression.scaling == 'Normal') {return 2};
		if (this.progression.scaling == 'Elite') {return 0};
		return 2;
	}
	get healthTotal() { 
		if (this.progression.type == 'Stagger') {return (4-this.scalingTotal)*(18 + (this.vigTotal*3) + (this.tghTotal*3) + (this.getRank)-(3*this.fatigueTotal))};
		if (this.progression.type == 'Poise') {return ((12-(2*this.scalingTotal)) + (this.vigTotal*1) + (this.tghTotal*1) - (this.fatigueTotal))};
		return ((8+(5*(4-this.scalingTotal))) + (this.vigTotal*3)+(this.tghTotal*3)+(this.getRank)-(3*this.fatigueTotal))
	}
	get spiritTotal() { 
		if (this.progression.type == 'Poise') {return ((4-this.scalingTotal)*(40 + (this.fthTotal*5))+((8+(5*(4-this.scalingTotal))) + (this.getRank) + (this.vigTotal*3) + (this.tghTotal*3)) - (15*this.fatigueTotal) )};
		return (((4-this.scalingTotal)*(40 + (this.fthTotal*5))) - (12*this.fatigueTotal));
	}
	// cute getter
	get cuteTotal() {
    	// Adding || 0 to every step prevents NaN
		const str = this.strTotal || 0;
		const dex = this.dexTotal || 0;
		const vig = this.vigTotal || 0;
		const mag = this.magTotal || 0;
		const fth = this.fthTotal || 0;
		return (5 + (this.arousalTotal) - (str > 2 ? 1 : 0) - (dex > 2 ? 1 : 0) - (vig > 2 ? 1 : 0) + (mag > 2 ? 1 : 0) + (fth > 2 ? 1 : 0) + (this.cute?.up ? 3 : 0) + (this.cute?.yes ? 3 : 0));
	}

	getScaling(slot,slot2) {
		const weapon = this[slot];
		const selectedKey = weapon.HIT || "str";

		switch (selectedKey) 
		{
			case "str":
				return this.strTotal;
			case "dex":
				if (slot2 == 'dmg') {return this.strTotal;}
				return this.dexTotal;
			case "dex2":
				if (slot2 == 'dmg') {return 0;}
				return this.dexTotal;
			case "vig":
				return this.vigTotal;
			case "mag":
				return this.magTotal;
			case "fth":
				return this.fthTotal;
			case "heal":
				const healing = 0 + this.willTotal - this.atkTotal;
				return (healing);
			case "none":
				const noatk = 0 - this.atkTotal;
				if (slot2 == 'dmg') {return noatk;}
				return (0);
		}
	}

	// Specific Getters for Handlebars
	get weapon1Scaling() { return (  this.getScaling('weapon1','')); }
	get weapon2Scaling() { return (  this.getScaling('weapon2','')); }
	get weapon3Scaling() { return (  this.getScaling('weapon3','')); }
	get weapon4Scaling() { return (  this.getScaling('weapon4','')); }
	get weapon5Scaling() { return (  this.getScaling('weapon5','')); }
	get weapon1Scaling2() { return (  this.getScaling('weapon1','dmg')); }
	get weapon2Scaling2() { return (  this.getScaling('weapon2','dmg')); }
	get weapon3Scaling2() { return (  this.getScaling('weapon3','dmg')); }
	get weapon4Scaling2() { return (  this.getScaling('weapon4','dmg')); }
	get weapon5Scaling2() { return (  this.getScaling('weapon5','dmg')); }
	get save1Scaling() { return (  this.getScaling('save1','')); }
	get save2Scaling() { return (  this.getScaling('save2','')); }
	get save3Scaling() { return (  this.getScaling('save3','')); }
	get save4Scaling() { return (  this.getScaling('save4','')); }
	get save5Scaling() { return (  this.getScaling('save5','')); }
	get save6Scaling() { return (  this.getScaling('save6','')); }
	get save1Scaling2() { return (  this.getScaling('save1','dmg')); }
	get save2Scaling2() { return (  this.getScaling('save2','dmg')); }
	get save3Scaling2() { return (  this.getScaling('save3','dmg')); }
	get save4Scaling2() { return (  this.getScaling('save4','dmg')); }
	get save5Scaling2() { return (  this.getScaling('save5','dmg')); }
	get save6Scaling2() { return (  this.getScaling('save6','dmg')); }

	/** @inheritDoc */
	prepareDerivedData() {
		super.prepareDerivedData();

		// Make sure HP cannot exceed its maximum.
		this.health.max = this.healthTotal;
		this.spirit.max = this.spiritTotal;
		this.health.value = Math.min(this.health.value, this.healthTotal);
		this.spirit.value = Math.min(this.spirit.value, this.spiritTotal);
		this.risk.value = Math.min(this.risk.value, 6);
		this.fatigue.value = Math.min(this.fatigue.value, 5);
		this.arousal.value = Math.min(this.arousal.value, 10);
	}

	//end
}