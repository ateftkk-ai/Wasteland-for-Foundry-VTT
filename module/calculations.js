// Attribute and Skill Calculations
export class WLSCalculations {
  
  // Calculate derived stats from attributes
  static calculateDerivedStats(actor) {
    const stats = actor.system.attributes.stats;
    const derived = {};
    
    // Strike Rate (Coordination + Speed)
    derived.strikeRate = (stats.coordination.value + stats.speed.value) * 5;
    
    // Critical Chance (Luck based)
    derived.criticalChance = stats.luck.value * 2;
    
    // Carry Weight (Strength based)
    derived.maxCarryWeight = 25 + (stats.strength.value * 5);
    
    // Initiative (Awareness + Speed)
    derived.initiative = stats.awareness.value + stats.speed.value;

    class Calculations {
      static calculateInitiative(actor) {
        const stats = actor.system.attributes.stats;
        const baseInitiative = stats.awareness.value + stats.speed.value;
        const weapon = actor.system.weapons?.equipped?.primary;

        let weaponPenalty = 0;
        if (weapon) {
          // Heavier weapons impose initiative penalty
          weaponPenalty = Math.floor(weapon.system.weight / 2);
        }

    return Math.max(1, baseInitiative - weaponPenalty);
  }
  
  static calculateActionPoints(actor) {
    const baseAP = 10;
    const speedBonus = Math.floor(actor.system.attributes.stats.speed.value / 2);
    return baseAP + speedBonus;
  }
  
  static calculateAttack(attacker, target, weapon, options = {}) {
    const attackData = {
      hitChance: 0,
      criticalChance: 0,
      damage: 0,
      armorPenetration: 0,
      statusEffects: []
    };
    
    // Base hit chance from skill
    const skillName = weapon.system.skill;
    const skillValue = attacker.system.skills.weapons[skillName]?.total || 0;
    attackData.hitChance = skillValue * 5; // Convert to percentage
    
    // Attribute modifiers
    const attribute = weapon.system.attribute;
    const attributeValue = attacker.system.attributes.stats[attribute]?.value || 0;
    attackData.hitChance += attributeValue * 3;
    
    // Range modifier
    const range = options.range || 0;
    const rangePenalty = Math.max(0, Math.floor(range / weapon.system.range) * 10);
    attackData.hitChance -= rangePenalty;
    
    // Cover modifier
    const cover = target.system.combat.cover;
    const coverModifiers = { none: 0, partial: -20, full: -40 };
    attackData.hitChance += coverModifiers[cover] || 0;
    
    // Critical chance
    attackData.criticalChance = weapon.system.criticalChance;
    attackData.criticalChance += attacker.system.attributes.stats.luck.value * 2;
    
    // Calculate base damage
    attackData.damage = this.rollDamage(weapon.system.damage);
    
    // Armor penetration
    attackData.armorPenetration = this.calculateArmorPenetration(weapon);
    
    // Apply attacker status effects
    attackData.hitChance += this.getStatusEffectModifier(attacker, 'hitChance');
    
    // Cap values
    attackData.hitChance = Math.max(5, Math.min(95, attackData.hitChance));
    attackData.criticalChance = Math.max(0, Math.min(50, attackData.criticalChance));
    
    return attackData;
  }
  
  static calculateDefense(target, attackData) {
    const defenseData = {
      damageTaken: 0,
      armorReduction: 0,
      locationHit: this.determineHitLocation(),
      statusEffectsApplied: []
    };
    
    // Get armor for hit location
    const locationArmor = target.system.armor[defenseData.locationHit]?.value || 0;
    const effectiveArmor = Math.max(0, locationArmor - attackData.armorPenetration);
    
    // Damage reduction
    defenseData.armorReduction = effectiveArmor;
    defenseData.damageTaken = Math.max(0, attackData.damage - defenseData.armorReduction);
    
    // Chance to apply status effects based on damage through armor
    if (defenseData.damageTaken > 0) {
      defenseData.statusEffectsApplied = this.determineStatusEffects(attackData, defenseData);
    }
    
    return defenseData;
  }
  
  static determineHitLocation() {
    const roll = new Roll('1d100').roll().total;
    if (roll <= 15) return 'head';
    if (roll <= 60) return 'body';
    if (roll <= 80) return 'arms';
    return 'legs';
  }
  
  static rollDamage(damageFormula) {
    try {
      const roll = new Roll(damageFormula);
      return roll.roll().total;
    } catch (error) {
      console.error('Damage roll error:', error);
      return 0;
    }
  }
  
  static calculateArmorPenetration(weapon) {
    let ap = 0;
    
    // Base AP from weapon type
    const weaponAP = {
      sniperRifles: 3,
      heavyWeapons: 2,
      automaticWeapons: 1,
      smallArms: 0,
      shotguns: -1 // Shotguns have poor armor penetration
    };
    
    ap += weaponAP[weapon.system.skill] || 0;
    
    // Add AP from mods
    if (weapon.system.mods) {
      weapon.system.mods.forEach(mod => {
        if (mod.armorPenetration) ap += mod.armorPenetration;
      });
    }
    
    return Math.max(0, ap);
  }
  
  static getStatusEffectModifier(actor, type) {
    let modifier = 0;
    const effects = actor.system.combat.statusEffects;
    
    effects.forEach(effect => {
      switch (effect.type) {
        case 'suppressed':
          if (type === 'hitChance') modifier -= 10;
          break;
        case 'inspired':
          if (type === 'hitChance') modifier += 5;
          break;
        case 'concussed':
          if (type === 'hitChance') modifier -= 15;
          break;
      }
    });
    
    return modifier;
  }
  
  static determineStatusEffects(attackData, defenseData) {
    const effects = [];
    const damageThroughArmor = defenseData.damageTaken;
    
    // Bleeding chance
    if (damageThroughArmor >= 5) {
      const bleedChance = Math.min(50, damageThroughArmor * 5);
      if (Math.random() * 100 <= bleedChance) {
        effects.push({
          type: 'bleeding',
          duration: Math.ceil(damageThroughArmor / 2),
          intensity: Math.ceil(damageThroughArmor / 5)
        });
      }
    }
    
    // Critical hit effects
    if (attackData.isCritical) {
      effects.push({
        type: 'stunned',
        duration: 1
      });
    }
    
    return effects;
  }
}
    
    // Detection (Awareness based)
    derived.detection = stats.awareness.value * 2;
    
    // Experience Bonus (Intelligence based)
    derived.experienceBonus = stats.intelligence.value * 2;
    
    return derived;
  }
  
  // Calculate skill point cost
  static getSkillPointCost(currentLevel, intelligence) {
    const baseCosts = [1, 1, 1, 2, 2, 3, 3, 4, 4, 5]; // Costs for levels 1-10
    const intDiscount = Math.floor(intelligence / 3);
    const actualCost = Math.max(1, baseCosts[currentLevel] - intDiscount);
    return actualCost;
  }
  
  // Get total skill value (base + attribute bonus)
  static getTotalSkillValue(skillData, attributes) {
    const baseValue = skillData.value || 0;
    const attributeBonus = attributes[skillData.attribute]?.value || 0;
    return baseValue + attributeBonus;
  }
  
  // Calculate combat accuracy
  static calculateAccuracy(weaponSkill, coordination, range, modifiers = 0) {
    const baseAccuracy = weaponSkill * 5;
    const coordBonus = coordination * 3;
    return Math.max(5, Math.min(95, baseAccuracy + coordBonus + modifiers - range));
  }
}

// Attribute modifiers
export const ATTRIBUTE_MODIFIERS = {
  coordination: {
    strikeRate: 5,
    rangedAccuracy: 3
  },
  luck: {
    criticalChance: 2,
    lootQuality: 1
  },
  awareness: {
    detectionRange: 2,
    initiative: 1
  },
  strength: {
    carryWeight: 5,
    meleeDamage: 1
  },
  speed: {
    actionPoints: 0.5,
    movement: 1
  },
  intelligence: {
    skillPoints: 1,
    experience: 2
  },
  charisma: {
    vendorPrices: -2, // Better prices
    persuasionBonus: 2
  }
};