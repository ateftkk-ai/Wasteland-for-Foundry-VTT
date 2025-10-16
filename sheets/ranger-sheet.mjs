export class RangerSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wastelands", "sheet", "actor", "ranger"],
      template: "systems/wastelands/templates/ranger-sheet.html",
      width: 700,
      height: 800
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