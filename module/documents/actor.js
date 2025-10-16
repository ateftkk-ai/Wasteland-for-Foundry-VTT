export class WL3Actor extends Actor {
  /** @override */
  prepareData() {
    super.prepareData();
    console.log("WL3Actor prepareData called for", this.name, "type:", this.type);
    // Calculate derived stats when data changes
    this.prepareDerivedStats();
    this.prepareSkills();
  }
  
  /** @override */
  prepareBaseData() {
      console.log("WL3Actor prepareBaseData called");
        
      // Ensure the actor has all required data structure
      if (!this.system.skills) {
          console.log("Initializing skills data structure in prepareBaseData");
          this.system.skills = {
              weapons: {},
              combat: {},
              survival: {},
              tech: {}
          };
      }
  }

  /** @override */
  prepareDerivedStats() {
    const stats = this.system.attributes.stats;
    
    // Update derived stats
    this.system.attributes.derived = WL3Calculations.calculateDerivedStats(this);
    
    // Calculate current/max action points
    this.system.attributes.actionPoints.max = 6 + Math.floor(stats.speed.value / 2);
    if (this.system.attributes.actionPoints.value > this.system.attributes.actionPoints.max) {
      this.system.attributes.actionPoints.value = this.system.attributes.actionPoints.max;
    }
  }
  
  prepareSkills() {
    // Calculate total skill values (skill + attribute)
    const stats = this.system.attributes.stats;
    const skills = this.system.skills;
    
    for (const [category, categorySkills] of Object.entries(skills)) {
      for (const [skillName, skillData] of Object.entries(categorySkills)) {
        skillData.total = WL3Calculations.getTotalSkillValue(skillData, stats);
            // Debug: Check if we have skills data after preparation
        console.log("After preparation - Skills data:", this.system.skills);
      }
    }
  }
  
  // Method to increase a skill
  async increaseSkill(skillPath, cost) {
    const currentValue = getProperty(this.system, `${skillPath}.value`);
    const newValue = currentValue + 1;
    
    // Check if character has enough skill points
    if (this.system.attributes.skillPoints < cost) {
      ui.notifications.warn("Not enough skill points!");
      return false;
    }
    
    // Update the skill
    await this.update({
      [`system.${skillPath}.value`]: newValue,
      "system.attributes.skillPoints": this.system.attributes.skillPoints - cost
    });
    
    return true;
  }
  
  // Method to make a skill check
  async makeSkillCheck(skillCategory, skillName, modifiers = 0) {
    const skill = this.system.skills[skillCategory]?.[skillName];
    if (!skill) {
      ui.notifications.error(`Skill ${skillName} not found!`);
      return;
    }
    
    const totalSkill = skill.total || skill.value;
    const target = totalSkill * 5 + modifiers; // Convert to percentage
    
    const roll = new Roll("1d100");
    
    try {
      const result = await roll.roll({ async: true });
      const success = result.total <= target;
      const degreeOfSuccess = Math.floor((target - result.total) / 10);
      
      let flavor = `
        <div class="wastelands-skill-check">
          <h2>${skillName} Check</h2>
          <div class="check-details">
            <p><strong>Skill:</strong> ${totalSkill} (Target: ${target})</p>
            <p><strong>Roll:</strong> ${result.total}</p>
            <p class="result ${success ? 'success' : 'failure'}">
              <strong>Result:</strong> ${success ? 'SUCCESS' : 'FAILURE'}
              ${success && degreeOfSuccess > 0 ? ` (${degreeOfSuccess} degree${degreeOfSuccess > 1 ? 's' : ''} of success)` : ''}
            </p>
          </div>
        </div>
      `;
      
      await result.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: flavor
      });
      
      return {
        success,
        total: result.total,
        target,
        degreeOfSuccess: success ? degreeOfSuccess : 0
      };
      
    } catch (err) {
      console.error("Skill check error:", err);
    }
  }
  
  async performAttack(targetActor, weaponItem, options = {}) {
    // Check AP cost
    const apCost = weaponItem.system.attackCost;
    if (this.system.combat.actionPoints.current < apCost) {
      ui.notifications.warn("Not enough Action Points!");
      return false;
    }
    
    // Calculate range if not provided
    if (!options.range && canvas.ready) {
      options.range = this.getDistanceToTarget(targetActor);
    }
    
    // Perform attack calculation
    const attackData = WL3CombatCalculations.calculateAttack(this, targetActor, weaponItem, options);
    const defenseData = WL3CombatCalculations.calculateDefense(targetActor, attackData);
    
    // Roll to hit
    const hitRoll = new Roll("1d100");
    const hitResult = await hitRoll.roll({ async: true });
    const isHit = hitResult.total <= attackData.hitChance;
    const isCritical = hitResult.total <= attackData.criticalChance;
    
    // Apply results
    if (isHit) {
      attackData.isCritical = isCritical;
      if (isCritical) {
        defenseData.damageTaken *= weaponItem.system.criticalMultiplier;
      }
      
      await this.applyCombatResults(this, targetActor, attackData, defenseData, hitResult);
    }
    
    // Spend action points
    await this.update({
      "system.combat.actionPoints.current": this.system.combat.actionPoints.current - apCost,
      "system.combat.lastAction": `Attacked ${targetActor.name}`
    });
    
    return { isHit, isCritical, attackData, defenseData };
  }
  
  async applyCombatResults(attacker, target, attackData, defenseData, hitRoll) {
    // Apply damage
    if (defenseData.damageTaken > 0) {
      await this.applyDamage(target, defenseData.damageTaken, attackData.damageType);
    }
    
    // Apply status effects
    if (defenseData.statusEffectsApplied.length > 0) {
      const currentEffects = target.system.combat.statusEffects;
      const newEffects = [...currentEffects, ...defenseData.statusEffectsApplied];
      await target.update({ "system.combat.statusEffects": newEffects });
    }
    
    // Create combat message
    await this.createCombatMessage(attacker, target, attackData, defenseData, hitRoll);
  }
  
  async applyDamage(target, damage, damageType = 'ballistic') {
    const currentHealth = target.system.attributes.health.value;
    const newHealth = Math.max(0, currentHealth - damage);
    
    await target.update({
      "system.attributes.health.value": newHealth
    });
    
    // Check for incapacitation
    if (newHealth <= 0) {
      await this.incapacitateActor(target);
    }
    
    return newHealth;
  }
  
  async incapacitateActor(actor) {
    // Apply unconscious status
    const effects = actor.system.combat.statusEffects;
    effects.push({
      type: 'unconscious',
      duration: -1 // Permanent until healed
    });
    
    await actor.update({
      "system.combat.statusEffects": effects,
      "system.combat.actionPoints.current": 0
    });
    
    ui.notifications.warn(`${actor.name} has been incapacitated!`);
  }
  
  getDistanceToTarget(targetActor) {
    if (!canvas.ready || !this.token || !targetActor.token) return 0;
    
    const token1 = this.token;
    const token2 = targetActor.token;
    const distance = canvas.grid.measureDistance(token1, token2);
    
    return Math.round(distance);
  }
  
  async createCombatMessage(attacker, target, attackData, defenseData, hitRoll) {
    const template = `
      <div class="wastelands-combat-message">
        <h2>Combat Resolution</h2>
        <div class="combat-header">
          <strong>${attacker.name}</strong> vs <strong>${target.name}</strong>
        </div>
        <div class="combat-details">
          <p><strong>Attack Roll:</strong> ${hitRoll.total} vs ${attackData.hitChance}%</p>
          <p><strong>Result:</strong> 
            <span class="{{#if attackData.isCritical}}critical-hit{{else if isHit}}hit{{else}}miss{{/if}}">
              {{#if attackData.isCritical}}CRITICAL HIT!{{else if isHit}}HIT{{else}}MISS{{/if}}
            </span>
          </p>
          {{#if isHit}}
          <p><strong>Damage:</strong> ${attackData.damage} - ${defenseData.armorReduction} = 
             <strong>${defenseData.damageTaken}</strong> ${attackData.damageType}}</p>
          <p><strong>Hit Location:</strong> ${defenseData.locationHit}</p>
          {{#if defenseData.statusEffectsApplied.length}}
          <p><strong>Status Effects:</strong> 
            {{#each defenseData.statusEffectsApplied}}{{this.type}} {{/each}}
          </p>
          {{/if}}
          {{/if}}
        </div>
      </div>
    `;
    
    const html = await renderTemplate(template, {
      isHit: hitRoll.total <= attackData.hitChance,
      ...attackData,
      ...defenseData
    });
    
    await ChatMessage.create({
      content: html,
      speaker: ChatMessage.getSpeaker({ actor: attacker })
    });
  }
  
  // Utility methods for combat UI
  getEquippedWeapon(slot = 'primary') {
    const weaponId = this.system.weapons.equipped[slot];
    if (!weaponId) return null;
    return this.items.get(weaponId);
  }
  
  getTotalArmor(location) {
    const baseArmor = this.system.armor[location]?.value || 0;
    // Add armor from equipped items
    const armorItems = this.items.filter(item => item.type === 'armor' && 
      item.system.location === location);
    
    let itemArmor = 0;
    armorItems.forEach(item => {
      itemArmor += item.system.armorValue || 0;
    });
    
    return baseArmor + itemArmor;
  }
}