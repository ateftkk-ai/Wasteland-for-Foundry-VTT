/**
 * Extend the base Item document for Wasteland 3.
 * @extends {Item}
 */
export class WL3Item extends Item {
  /** @override */
  prepareData() {
    super.prepareData();
        console.log("WL3Item prepareData called for", this.name, "type:", this.type);
    }

    /** @override */
    prepareBaseData() {
        // Ensure the item has a valid type and basic structure
        if (!this.system) {
            this.system = {};
        }
        
        // Set default values based on item type
        if (this.type === "weapon" && !this.system.damage) {
            this.system.damage = "1d6";
        }
        
        if (this.type === "armor" && typeof this.system.armorValue !== "number") {
            this.system.armorValue = 0;
        }
        
        if (typeof this.system.quantity !== "number") {
            this.system.quantity = 1;
        }
        
        if (typeof this.system.weight !== "number") {
            this.system.weight = 0;
        }
        
        if (typeof this.system.cost !== "number") {
            this.system.cost = 0;
        }
        
        if (!this.system.description) {
            this.system.description = "";
        }
    }
}