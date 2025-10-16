export class RobotSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wastelands", "sheet", "actor", "robot"],
      template: "systems/wastelands/templates/robot-sheet.hbs", 
      width: 600,
      height: 600
    });
  }

  /** @override */
  getData() {
    const context = super.getData();
    context.system = this.actor.system;
    console.log("Robot Sheet Data:", context); // Debug log
    return context;
  }
}