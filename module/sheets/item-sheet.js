export class WLSItemSheet extends ItemSheet {
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
        console.log("WLSItemSheet getData called");
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
        console.log("WLSItemSheet activateListeners called");

                // Check if HTML is properly rendered
        if (!html || !html[0]) {
            console.error("WLSItemSheet: HTML not properly rendered");
            return;
        }
        
        console.log("WLSItemSheet HTML element:", html[0]);
    }

    /** @override */
    async _render(force = false, options = {}) {
        console.log("WLSItemSheet _render called");
        await super._render(force, options);
        console.log("WLSItemSheet _render completed");
    }
}