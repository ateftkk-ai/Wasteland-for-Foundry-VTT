export class EnemySheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wasteland3", "sheet", "actor", "enemy"],
      template: "systems/wastelands/templates/enemy-sheet.html",
      width: 600,
      height: 600
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