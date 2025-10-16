export class RobotSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wasteland3", "sheet", "actor", "robot"],
      template: "systems/wastelands/templates/robot-sheet.html",
      width: 600,
      height: 650
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