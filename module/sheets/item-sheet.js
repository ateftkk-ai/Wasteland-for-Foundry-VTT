export class WL3ItemSheet extends ItemSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wastelands", "sheet", "item"],
      template: "systems/wastelands/templates/item-sheet.hbs",
      width: 500,
      height: 400,
      resizable: true
    });
  }

    /** @override */
    getData() {
        const context = super.getData();
        
        // Debug logging
        console.log("WL3ItemSheet getData called");
        console.log("Item:", this.item);
        console.log("Item type:", this.item.type);
        console.log("Item system data:", this.item.system);
        
        // Ensure system data is available to the template
        context.system = this.item.system;
        context.item = this.item;
        context.config = CONFIG.wastelands;
        
        return context;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);
        console.log("WL3ItemSheet activateListeners called");

                // Check if HTML is properly rendered
        if (!html || !html[0]) {
            console.error("WL3ItemSheet: HTML not properly rendered");
            return;
        }
        
        console.log("WL3ItemSheet HTML element:", html[0]);
    }

    /** @override */
    async _render(force = false, options = {}) {
        console.log("WL3ItemSheet _render called");
        await super._render(force, options);
        console.log("WL3ItemSheet _render completed");
    }
}