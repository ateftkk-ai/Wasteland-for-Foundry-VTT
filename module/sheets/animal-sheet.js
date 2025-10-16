export class AnimalSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wastelands", "sheet", "actor", "animal"],
      template: "systems/wastelands/templates/animal-sheet.hbs",
      width: 600,
      height: 600
    });
  }

  /** @override */
  getData() {
    const context = super.getData();
    context.system = this.actor.system;
    console.log("Animal Sheet Data:", context); // Debug log
    return context;
  }
}