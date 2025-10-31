const config = require('./config');

class EconomyManager {
  constructor(database) {
    this.db = database;
    this.config = config.ECONOMY;
  }

  // Mining system
  async mine(userId, username) {
    const user = await this.db.getUser(userId);
    const now = new Date().toISOString();

    // Check cooldown
    if (user && user.last_mine) {
      const lastMine = new Date(user.last_mine);
      const cooldown = this.config.mining.cooldown;
      
      if (Date.now() - lastMine.getTime() < cooldown) {
        const timeLeft = cooldown - (Date.now() - lastMine.getTime());
        return { 
          success: false, 
          timeLeft: timeLeft 
        };
      }
    }

    // Calculate rewards
    const baseReward = this.getRandomInt(
      this.config.mining.minReward,
      this.config.mining.maxReward
    );
    
    const expReward = this.getRandomInt(
      this.config.mining.expReward.min,
      this.config.mining.expReward.max
    );

    // Apply bonuses
    const level = user ? user.level : 1;
    const levelBonus = 1 + (level * 0.1);
    
    let pickaxeBonus = 1.0;
    if (user && user.inventory && user.inventory.pickaxe) {
      const pickaxe = user.inventory.pickaxe;
      if (pickaxe === 'pickaxe1') pickaxeBonus = 1.1;
      else if (pickaxe === 'pickaxe2') pickaxeBonus = 1.25;
      else if (pickaxe === 'pickaxe3') pickaxeBonus = 1.5;
    }

    const finalReward = Math.floor(baseReward * levelBonus * pickaxeBonus);
    
    // Calculate new level and exp
    let newLevel = level;
    let newExp = (user ? user.exp : 0) + expReward;
    let levelUp = false;

    const expNeeded = newLevel * this.config.level.baseExp;
    if (newExp >= expNeeded) {
      newLevel++;
      newExp = 0;
      levelUp = true;
    }

    // Special user bonus
    let specialBonus = 0;
    if (userId === config.SPECIAL_USER_ID) {
      specialBonus = 50;
    }

    // Update user data
    const updateData = {
      coins: (user ? user.coins : 0) + finalReward + specialBonus,
      level: newLevel,
      exp: newExp,
      last_mine: now
    };

    if (user && user.inventory) {
      updateData.inventory = user.inventory;
    }

    await this.db.updateUser(userId, username, updateData);

    return {
      success: true,
      reward: finalReward,
      specialBonus: specialBonus,
      exp: expReward,
      level: newLevel,
      expCurrent: newExp,
      expNeeded: newLevel * this.config.level.baseExp,
      levelUp: levelUp
    };
  }

  // Daily reward system
  async daily(userId, username) {
    const user = await this.db.getUser(userId);
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    // Check if already claimed today
    if (user && user.last_daily) {
      const lastDaily = new Date(user.last_daily).toISOString().split('T')[0];
      if (lastDaily === today) {
        return { success: false, reason: 'already_claimed' };
      }
    }

    // Calculate rewards with streak bonus
    let streakBonus = 1.0;
    if (user && user.last_daily) {
      const lastDaily = new Date(user.last_daily);
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDaily.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        streakBonus = this.config.daily.streakBonus;
      }
    }

    const coins = Math.floor(
      this.getRandomInt(
        this.config.daily.baseCoins.min,
        this.config.daily.baseCoins.max
      ) * streakBonus
    );
    
    const diamonds = this.getRandomInt(
      this.config.daily.baseDiamonds.min,
      this.config.daily.baseDiamonds.max
    );

    // Special user bonus
    let specialBonus = { coins: 0, diamonds: 0 };
    if (userId === config.SPECIAL_USER_ID) {
      specialBonus.coins = 200;
      specialBonus.diamonds = 3;
    }

    // Update user data
    const updateData = {
      coins: (user ? user.coins : 0) + coins + specialBonus.coins,
      diamonds: (user ? user.diamonds : 0) + diamonds + specialBonus.diamonds,
      last_daily: now.toISOString()
    };

    if (user) {
      updateData.level = user.level;
      updateData.exp = user.exp;
      updateData.inventory = user.inventory;
    }

    await this.db.updateUser(userId, username, updateData);

    return {
      success: true,
      coins: coins,
      diamonds: diamonds,
      specialBonus: specialBonus,
      streakBonus: streakBonus > 1.0
    };
  }

  // Buy item from shop
  async buyItem(userId, username, itemId) {
    const user = await this.db.getUser(userId);
    const item = await this.db.getShopItem(itemId);

    if (!item) {
      return { success: false, reason: 'item_not_found' };
    }

    if (!user || user.coins < item.price) {
      return { success: false, reason: 'insufficient_coins' };
    }

    // Process purchase
    const newCoins = user.coins - item.price;
    const inventory = user.inventory || {};

    // Add to inventory based on item type
    switch (item.item_type) {
      case 'tool':
        inventory.pickaxe = itemId;
        break;
      case 'boost':
        if (!inventory.boosts) inventory.boosts = [];
        inventory.boosts.push(itemId);
        break;
      case 'role':
        // Handle role assignment (implement sesuai kebutuhan server)
        break;
    }

    // Update user
    await this.db.updateUser(userId, username, {
      coins: newCoins,
      inventory: inventory
    });

    return {
      success: true,
      item: item,
      newBalance: newCoins
    };
  }

  // Utility function
  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

module.exports = EconomyManager;