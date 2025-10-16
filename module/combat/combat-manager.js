export class WL3CombatManager {
  
  static async startCombat(actors) {
    // Initialize combat for all actors
    const updates = actors.map(actor => {
      const initiative = WL3CombatCalculations.calculateInitiative(actor);
      return {
        _id: actor.id,
        "system.combat.initiative": initiative,
        "system.combat.turnOrder": 0,
        "system.combat.actionPoints.current": actor.system.combat.actionPoints.max,
        "system.combat.statusEffects": []
      };
    });
    
    // Sort by initiative and set turn order
    const sortedActors = [...actors].sort((a, b) => {
      return b.system.combat.initiative - a.system.combat.initiative;
    });
    
    sortedActors.forEach((actor, index) => {
      const update = updates.find(u => u._id === actor.id);
      if (update) update["system.combat.turnOrder"] = index + 1;
    });
    
    // Apply updates
    for (const update of updates) {
      await game.actors.get(update._id).update(update);
    }
    
    // Create combat tracker
    const combatData = {
      round: 1,
      turn: 1,
      combatants: sortedActors.map(actor => ({
        actorId: actor.id,
        name: actor.name,
        initiative: actor.system.combat.initiative
      }))
    };
    
    // Store combat state in flags
    await game.settings.set('wastelands', 'currentCombat', combatData);
    
    ui.notifications.info("Combat started! Turn order set by initiative.");
    return combatData;
  }
  
  static async nextTurn() {
    const combat = game.settings.get('wastelands', 'currentCombat');
    if (!combat) return;
    
    combat.turn++;
    if (combat.turn > combat.combatants.length) {
      combat.turn = 1;
      combat.round++;
      await this.newRound();
    }
    
    await game.settings.set('wastelands', 'currentCombat', combat);
    
    // Refresh AP for current combatant
    const currentCombatant = combat.combatants[combat.turn - 1];
    const actor = game.actors.get(currentCombatant.actorId);
    if (actor) {
      await actor.update({
        "system.combat.actionPoints.current": actor.system.combat.actionPoints.max
      });
    }
    
    return combat;
  }
  
  static async newRound() {
    const combat = game.settings.get('wastelands', 'currentCombat');
    
    // Apply start-of-round effects
    for (const combatant of combat.combatants) {
      const actor = game.actors.get(combatant.actorId);
      if (actor) {
        await this.applyRoundStartEffects(actor);
      }
    }
    
    ui.notifications.info(`Round ${combat.round} begins!`);
  }
  
  static async applyRoundStartEffects(actor) {
    const effects = actor.system.combat.statusEffects;
    const updates = [];
    
    for (const effect of effects) {
      switch (effect.type) {
        case 'bleeding':
          const bleedDamage = effect.intensity || 1;
          await this.applyDamage(actor, bleedDamage, 'bleeding');
          effect.duration--;
          if (effect.duration <= 0) {
            updates.push(effect); // Mark for removal
          }
          break;
        case 'poisoned':
          // Handle poison damage
          break;
      }
    }
    
    // Remove expired effects
    if (updates.length > 0) {
      const newEffects = effects.filter(e => !updates.includes(e));
      await actor.update({ "system.combat.statusEffects": newEffects });
    }
  }
}