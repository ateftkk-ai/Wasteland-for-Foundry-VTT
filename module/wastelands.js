import { WLSActor } from "./documents/actor.js";
import { WLSItem } from "./documents/item.js";
import { AnimalSheet } from "./sheets/animal-sheet.js";
import { RangerSheet } from "./sheets/ranger-sheet.js";
import { RobotSheet } from "./sheets/robot-sheet.js";
import { EnemySheet } from "./sheets/enemy-sheet.js";
import { WLSItemSheet } from "./sheets/item-sheet.js";

Hooks.once("init", function() {
  console.log("Wastelands System | Initializing Wastelands Game System");

      // Register Handlebars helpers
    Handlebars.registerHelper('capitalize', function(str) {
        if (typeof str === 'string') {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        return '';
    });

    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });

    Handlebars.registerHelper('ne', function(a, b) {
        return a !== b;
    });
    
  // Define custom document classes
  CONFIG.Actor.documentClass = WLSActor;
  CONFIG.Item.documentClass = WLSItem;

  // Define Actor types
  CONFIG.Actor.typeLabels = {
    "animal": "Wastelands.ActorTypes.Animal",
    "ranger": "Wastelands.ActorTypes.Ranger", 
    "robot": "Wastelands.ActorTypes.Robot",
    "enemy": "Wastelands.ActorTypes.Enemy"
  };

  // Define Item types
  CONFIG.Item.typeLabels = {
    "weapon": "Wastelands.ItemTypes.Weapon",
    "armor": "Wastelands.ItemTypes.Armor",
    "skill": "Wastelands.ItemTypes.Skill",
    "perk": "Wastelands.ItemTypes.Perk",
    "quirk": "Wastelands.ItemTypes.Quirk"
  };

  // Register system documents
  game.wastelands = {
    WLSActor,
    WLSItem,
    sheets: {
      AnimalSheet,
      RangerSheet, 
      RobotSheet,
      EnemySheet
    }
  };

  // Define custom document classes
  CONFIG.Actor.documentClass = WLSActor;
  CONFIG.Item.documentClass = WLSItem;

  // Register system settings
  game.settings.register("wastelands", "maxPartySize", {
    name: "Maximum Party Size",
    hint: "Maximum number of rangers in a party",
    scope: "world",
    config: true,
    type: Number,
    default: 6
  });

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wastelands", RangerSheet, { types: ["ranger"], makeDefault: true });
  Actors.registerSheet("wastelands", AnimalSheet, { types: ["animal"] });
  Actors.registerSheet("wastelands", RobotSheet, { types: ["robot"] });
  Actors.registerSheet("wastelands", EnemySheet, { types: ["enemy"] });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wastelands", WLSItemSheet, { makeDefault: true });

  // Preload templates
  loadTemplates([
    "systems/wastelands/templates/ranger-sheet.hbs",
    "systems/wastelands/templates/animal-sheet.hbs", 
    "systems/wastelands/templates/robot-sheet.hbs",
    "systems/wastelands/templates/enemy-sheet.hbs",
    "systems/wastelands/templates/item-sheet.hbs"
  ]);
});

// Localization strings (create lang/en.json)
Hooks.once("i18nInit", function() {
  game.i18n.translations.Wastelands = {
    "ActorTypes": {
      "Animal": "Animal",
      "Ranger": "Ranger", 
      "Robot": "Robot",
      "Enemy": "Enemy"
    },
    "ItemTypes": {
      "Weapon": "Weapon",
      "Armor": "Armor", 
      "Skill": "Skill",
      "Perk": "Perk",
      "Quirk": "Quirk"
    }
  };
});