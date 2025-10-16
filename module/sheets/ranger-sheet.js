/**
 * Extend the base ActorSheet for Ranger characters
 * @extends {ActorSheet}
 */
export class RangerSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["wastelands", "sheet", "actor", "ranger"],
      template: "systems/wastelands/templates/ranger-sheet.hbs",
      width: 700,
      height: 800,
      tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "attributes"}]
    });
  }

  /** @override */
  getData() {
    const context = super.getData();
    
    // Use the actor's system data directly
    context.system = this.actor.system;
    
    // Prepare items for the sheet
    context.weapons = this.actor.items.filter(item => item.type === "weapon");
    context.armor = this.actor.items.filter(item => item.type === "armor");
    context.perks = this.actor.items.filter(item => item.type === "perk");
    context.quirks = this.actor.items.filter(item => item.type === "quirk");
    context.items = this.actor.items.filter(item => 
      !["weapon", "armor", "perk", "quirk", "skill"].includes(item.type)
    );

    console.log("Ranger Sheet Data:", context); // Debug log

    // Debug logging for skills
    console.log("=== RANGER SHEET DEBUG ===");
    console.log("Actor ID:", this.actor.id);
    console.log("RangerSheet getData - Skills data:", this.actor.system.skills);
    console.log("RangerSheet getData - Full system:", this.actor.system);
    console.log("Skills exists:", !!this.actor.system.skills); 
    
    if (this.actor.system.skills) {
        console.log("Weapons skills count:", Object.keys(this.actor.system.skills.weapons || {}).length);
        console.log("Combat skills count:", Object.keys(this.actor.system.skills.combat || {}).length);
        console.log("Survival skills count:", Object.keys(this.actor.system.skills.survival || {}).length);
        console.log("Tech skills count:", Object.keys(this.actor.system.skills.tech || {}).length);

        // Log each category in detail
        for (const category of ['weapons', 'combat', 'survival', 'tech']) {
            console.log(`${category} skills:`, this.actor.system.skills[category]);
        }
    } else {
        console.log("NO SKILLS DATA FOUND!");
        // Let's check what data actually exists
        console.log("Available system keys:", Object.keys(this.actor.system));
    }
    console.log("=== END DEBUG ===");
    // Ensure system data is available to the template
    context.system = this.actor.system;
        
    // If skills don't exist, we need to initialize them
    if (!context.system.skills) {
        console.warn("Initializing missing skills data");
        context.system.skills = {
            weapons: {
                automaticWeapons: { value: 0, attribute: "coordination" },
                smallArms: { value: 0, attribute: "coordination" },
                heavyWeapons: { value: 0, attribute: "strength" },
                sniperRifles: { value: 0, attribute: "awareness" },
                shotguns: { value: 0, attribute: "strength" },
                meleeWeapons: { value: 0, attribute: "strength" },
                brawling: { value: 0, attribute: "strength" },
                explosives: { value: 0, attribute: "coordination" }
            },
            combat: {
                armorModding: { value: 0, attribute: "intelligence" },
                weaponModding: { value: 0, attribute: "intelligence" },
                firstAid: { value: 0, attribute: "intelligence" },
                sneakyShit: { value: 0, attribute: "awareness" },
                animalWhisperer: { value: 0, attribute: "charisma" },
                leadership: { value: 0, attribute: "charisma" }
            },
            survival: {
                lockpicking: { value: 0, attribute: "awareness" },
                hardAss: { value: 0, attribute: "strength" },
                kissAss: { value: 0, attribute: "charisma" },
                mechanics: { value: 0, attribute: "intelligence" },
                survival: { value: 0, attribute: "intelligence" },
                toasterRepair: { value: 0, attribute: "intelligence" }
            },
            tech: {
                nerdStuff: { value: 0, attribute: "intelligence" },
                weirdScience: { value: 0, attribute: "intelligence" },
                cybernetics: { value: 0, attribute: "intelligence" },
                computerScience: { value: 0, attribute: "intelligence" },
                engineering: { value: 0, attribute: "intelligence" }
            }
        };
    }
    
    // Organize items by type for the inventory tab
    context.weapons = this.actor.items.filter(item => item.type === "weapon");
    context.armor = this.actor.items.filter(item => item.type === "armor");
    context.perks = this.actor.items.filter(item => item.type === "perk");
    context.quirks = this.actor.items.filter(item => item.type === "quirk");
    context.skills = this.actor.items.filter(item => item.type === "skill");
    context.otherItems = this.actor.items.filter(item => 
        !["weapon", "armor", "perk", "quirk", "skill"].includes(item.type)
    );
    
    return context;
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Roll skill checks
    html.find('.skill-roll').click(this._onSkillRoll.bind(this));
    
    // Item management
    html.find('.item-edit').click(this._onItemEdit.bind(this));
    html.find('.item-delete').click(this._onItemDelete.bind(this));
    
    // Add new item buttons
    html.find('.item-create').click(this._onItemCreate.bind(this));
  }

  _onSkillRoll(event) {
    event.preventDefault();
    const skillName = event.currentTarget.dataset.skill;
    console.log(`Rolling ${skillName} check`);
    // Implement skill roll logic here
    // Get the skill value from the actor's data
    const skill = this.actor.system.skills?.[category]?.[skillName];
    if (!skill) {
        console.error(`Skill ${category}.${skillName} not found`);
        return;
    }
        
    const skillValue = skill.value || 0;
    const attribute = skill.attribute || "coordination";
        
    // Create a skill check roll (d100 system)
    const roll = new Roll("1d100");
    roll.roll().then(result => {
        const target = skillValue * 10; // Convert skill level to percentage
        const success = result.total <= target;
        const degreeOfSuccess = Math.floor((target - result.total) / 10);
            
        let flavor = `
            <div class="wastelands-roll">
                <h3>${skillName} Check</h3>
                <div class="roll-details">
                    <p><strong>Skill:</strong> ${skillValue} (Target: ${target})</p>
                    <p><strong>Attribute:</strong> ${attribute}</p>
                    <p><strong>Roll:</strong> ${result.total}</p>
                    <p class="result ${success ? 'success' : 'failure'}">
                        <strong>Result:</strong> ${success ? "SUCCESS" : "FAILURE"}
                        ${success && degreeOfSuccess > 0 ? ` (+${degreeOfSuccess} degree${degreeOfSuccess > 1 ? 's' : ''})` : ''}
                    </p>
                </div>
            </div>
        `;
            
        result.toMessage({
            speaker: ChatMessage.getSpeaker({ actor: this.actor }),
            flavor: flavor
        });
    }).catch(err => {
        console.error("Skill roll error:", err);
        ui.notifications.error("Error making skill roll!");
     });
}

  
  _onItemEdit(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);
    if (item) item.sheet.render(true);
  }

  _onItemDelete(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    this.actor.createEmbeddedDocuments("Item", [{
      name: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      type: type,
      system: {}
    }]);
  }
}