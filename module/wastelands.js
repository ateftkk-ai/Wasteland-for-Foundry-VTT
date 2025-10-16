import { WL3Actor } from "./documents/actor.js";
import { WL3Item } from "./documents/item.js";
import { AnimalSheet } from "./sheets/animal-sheet.js";
import { RangerSheet } from "./sheets/ranger-sheet.js";
import { RobotSheet } from "./sheets/robot-sheet.js";
import { EnemySheet } from "./sheets/enemy-sheet.js";
import { WL3ItemSheet } from "./sheets/item-sheet.js";

Hooks.once("init", function() {
  console.log("Wasteland 3 System | Initializing Wasteland 3 Game System");

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
  CONFIG.Actor.documentClass = WL3Actor;
  CONFIG.Item.documentClass = WL3Item;

  // Define Actor types
  CONFIG.Actor.typeLabels = {
    "animal": "Wasteland3.ActorTypes.Animal",
    "ranger": "Wasteland3.ActorTypes.Ranger", 
    "robot": "Wasteland3.ActorTypes.Robot",
    "enemy": "Wasteland3.ActorTypes.Enemy"
  };

  // Define Item types
  CONFIG.Item.typeLabels = {
    "weapon": "Wasteland3.ItemTypes.Weapon",
    "armor": "Wasteland3.ItemTypes.Armor",
    "skill": "Wasteland3.ItemTypes.Skill",
    "perk": "Wasteland3.ItemTypes.Perk",
    "quirk": "Wasteland3.ItemTypes.Quirk"
  };

  // Register system documents
  game.wasteland3 = {
    WL3Actor,
    WL3Item,
    sheets: {
      AnimalSheet,
      RangerSheet, 
      RobotSheet,
      EnemySheet
    }
  };

  // Define custom document classes
  CONFIG.Actor.documentClass = WL3Actor;
  CONFIG.Item.documentClass = WL3Item;

  // Register system settings
  game.settings.register("wasteland3", "maxPartySize", {
    name: "Maximum Party Size",
    hint: "Maximum number of rangers in a party",
    scope: "world",
    config: true,
    type: Number,
    default: 6
  });

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("wasteland3", RangerSheet, { types: ["ranger"], makeDefault: true });
  Actors.registerSheet("wasteland3", AnimalSheet, { types: ["animal"] });
  Actors.registerSheet("wasteland3", RobotSheet, { types: ["robot"] });
  Actors.registerSheet("wasteland3", EnemySheet, { types: ["enemy"] });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("wasteland3", WL3ItemSheet, { makeDefault: true });

  // Preload templates
  loadTemplates([
    "systems/wasteland3/templates/ranger-sheet.hbs",
    "systems/wasteland3/templates/animal-sheet.hbs", 
    "systems/wasteland3/templates/robot-sheet.hbs",
    "systems/wasteland3/templates/enemy-sheet.hbs",
    "systems/wasteland3/templates/item-sheet.hbs"
  ]);
});

// Localization strings (create lang/en.json)
Hooks.once("i18nInit", function() {
  game.i18n.translations.Wasteland3 = {
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