export class AnimalSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wastelands", "sheet", "actor", "animal"],
      template: "systems/wastelands/templates/animal-sheet.html",
      width: 600,
      height: 680
    });
  }

  /** @override */
  getData() {
    const context = super.getData();
    context.system = context.actor.system;
    context.dtypes = ["String", "Number", "Boolean"];
    return context;
  }
}