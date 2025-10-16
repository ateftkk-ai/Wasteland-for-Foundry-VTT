export class EnemySheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wastelands", "sheet", "actor", "enemy"],
      template: "systems/wastelands/templates/enemy-sheet.hbs",
      width: 600, 
      height: 600
    });
  }

  /** @override */
  getData() {
    const context = super.getData();
    context.system = this.actor.system;
    console.log("Enemy Sheet Data:", context); // Debug log
    return context;
  }
}