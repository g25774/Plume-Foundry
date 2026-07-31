const {SchemaField, NumberField, StringField} = foundry.data.fields;

export default class ItemData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		return {
			input: new SchemaField({
				notes: new StringField({ initial: 'An item in Plume.' }),
				number: new NumberField({ initial: 1 }),
				damage: new StringField({ initial: '1d6' })
			})
		};
	};
}