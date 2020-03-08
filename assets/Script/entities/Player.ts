import SoundManager from "../SoundManager";
import { GameEvent } from "../core/Event";


const { ccclass, property } = cc._decorator;

const CHARGE_TIMER = 0.25;
const DEFAULT_HP = 3;
const SHIELD_THRESHOLD = 3;
const DEFAULT_MELLE_TIMER = 0.33;
const INVICIBLE_DEFAULT = 4;
const DEFUALT_AMMO_PACK = 5;

const ARMOR_EFFECT_GUN = 10;
const ARMOR_EFFECT_RIFLE = 50;

export enum WEAPON {
    GUN = 'gun',
    RIFLE = 'rifle',
    BASEBALLBAT = 'bat',
    KNIFE = 'knife',
}

@ccclass
export default class Player extends cc.Component {

    @property(cc.PhysicsBoxCollider)
    meleeCollider: cc.PhysicsBoxCollider = null;

    @property(cc.Animation)
    animations: cc.Animation = null;

    @property(cc.ProgressBar)
    hpBar: cc.ProgressBar = null;

    @property(cc.ProgressBar)
    chargeBar: cc.ProgressBar = null;

    @property(cc.Node)
    armorNode: cc.Node = null;

    @property(cc.Node)
    invincibleNode: cc.Node = null;

    @property(cc.Node)
    weaponEffect: cc.Node = null;

    @property(cc.Node)
    characterEffect: cc.Node = null;

    @property(cc.Node)
    weaponGlow: cc.Node = null;

    isAlive = false;

    // Different depending on upgrades
    bulletCap = 10;

    bulletAmount = 5;

    shields = 0;

    invincible = false;

    rifleUpgrade = false;

    meleeAttack = false;

    currentWeapon = WEAPON.GUN;
    private hp = 3;
    private armorEquipped = false;
    private chargeTimer: number = 0;
    private chargingAttack: boolean = false;
    private invicibleTimer = INVICIBLE_DEFAULT;
    private meleeTimer = DEFAULT_MELLE_TIMER;

    start() {
        // TODO adjust dynamically during pickup
        this.characterEffect.runAction(cc.sequence(
            cc.fadeTo(1.5, 175).easing(cc.easeSineInOut()),
            cc.fadeTo(1.5, 255).easing(cc.easeSineInOut()))
            .repeatForever());

        this.weaponGlow.runAction(cc.sequence(
            cc.fadeTo(1.5, 175).easing(cc.easeSineInOut()),
            cc.fadeTo(1.5, 255).easing(cc.easeSineInOut()))
            .repeatForever());

        this.updateEffects();
        this.animations.play(`man_walk_${this.currentWeapon.toString()}`);
        this.hpBar.progress = 1;
        this.chargeBar.progress = 0;
        this.chargeBar.node.active = false;
        this.isAlive = true;
        this.animations.on('finished', (event) => {
            if (this.bulletAmount <= 0) {
                this.currentWeapon = WEAPON.KNIFE;
            }
            if (this.isAlive) {
                this.characterEffect.y = this.currentWeapon === WEAPON.GUN
                    ? ARMOR_EFFECT_GUN : ARMOR_EFFECT_RIFLE;
            }

            this.characterEffect.runAction(cc.sequence(
                cc.fadeTo(1.5, 175).easing(cc.easeSineInOut()),
                cc.fadeTo(1.5, 255).easing(cc.easeSineInOut()))
                .repeatForever());
            this.animations.play(`man_walk_${this.currentWeapon.toString()}`);
        });
    }

    update(dt) {
        if (this.chargingAttack) {
            this.chargeTimer += dt;
            if (this.chargeTimer >= CHARGE_TIMER) {
                this.chargeBar.progress = 1;
                this.chargingAttack = false;
                // SoundManager.stop('charge_temp');
            } else {
                this.chargeBar.progress = this.chargeTimer / CHARGE_TIMER;
            }
        }
        if (this.invincible) {
            this.invicibleTimer -= dt;
            if (this.invicibleTimer < 0) {
                this.invicibleTimer = INVICIBLE_DEFAULT;
                this.invincible = false;
                this.invincibleNode.active = false;
                this.shields = 0;
                cc.systemEvent.emit(GameEvent.RESET_SHIELD);
            }
        }

        if (this.meleeAttack) {
            this.meleeTimer -= dt;
            if (this.meleeTimer <= 0) {
                this.meleeAttack = false;
                this.meleeTimer = DEFAULT_MELLE_TIMER;
            }
        }
    }

    handleMovement(touchpos: cc.Vec2) {
        if (this.isAlive) {
            this.node.x = touchpos.x;
        }
    }

    handleAttack() {
        if (this.isAlive) {
            if (this.chargeTimer > CHARGE_TIMER) {
                switch (this.currentWeapon) {
                    case WEAPON.GUN:
                        this.useFirearm(this.currentWeapon);
                        break;
                    case WEAPON.RIFLE:
                        this.useFirearm(this.currentWeapon);
                        break;
                    case WEAPON.BASEBALLBAT:
                        // TOOD
                        // this.animations.play("man_fire_rifle");
                        break;
                    case WEAPON.KNIFE:
                        // TOOD
                        this.meleeAttack = true;
                        this.meleeTimer = DEFAULT_MELLE_TIMER;
                        this.animations.play("attack_knife");
                        SoundManager.play('sword', false);
                        break;
                    default:
                        throw new Error('Invalid weapon');
                }
            } else {
                this.resetAttack();
            }
        }
    }

    useFirearm(firearmType: WEAPON) {
        const isGun = firearmType === WEAPON.GUN;
        if (this.bulletAmount > 0) {
            this.bulletAmount--;
            if (isGun) {
                this.animations.play("man_fire_gun");
                SoundManager.play('fire1', false);
            } else {
                this.animations.play("man_fire_rifle");
                //Rifle 
                SoundManager.play('fire1', false);
                this.scheduleOnce(() => {
                    SoundManager.play('fire1', false);
                    cc.systemEvent.emit(GameEvent.BULLET_SPAWN, this.node.position);
                }, 0.1);
            }
            this.characterEffect.runAction(
                // TODO change with new char anims.
                cc.sequence(cc.moveBy(isGun ? 0 : 0.14, cc.v2(0, isGun ? 55 : 105)).easing(cc.easeSineInOut()),
                    cc.delayTime(isGun ? 0.12 : 0.07),
                    cc.callFunc(() => {
                        this.characterEffect.y = isGun
                            ? ARMOR_EFFECT_GUN : ARMOR_EFFECT_RIFLE;
                    })));
            cc.systemEvent.emit(GameEvent.BULLET_SPAWN, this.node.position);
            this.resetAttack();
        } else {
            this.resetAttack();
            SoundManager.play('empty', false, 0.3);
        }
    }

    startLevel() {
        this.rifleUpgrade = false;
        this.animations.on('finished', (event) => {
            this.animations.play(`man_walk_${this.currentWeapon.toString()}`);
        });
        this.isAlive = true;
        this.hpBar.node.active = true;
    }

    handleAmmoPickup() {
        if (this.currentWeapon === WEAPON.KNIFE || this.currentWeapon === WEAPON.BASEBALLBAT) {
            this.currentWeapon = this.rifleUpgrade ? WEAPON.RIFLE : WEAPON.GUN;
            this.animations.play(`man_walk_${this.currentWeapon.toString()}`);
        }
        this.bulletAmount += DEFUALT_AMMO_PACK;
        if (this.bulletAmount > this.bulletCap) {
            this.bulletAmount = this.bulletCap;
        }
    }

    handleDeath() {
        SoundManager.play('death', false, 0.5);
        this.isAlive = false;
        this.hpBar.node.active = false;
        // TODO animation
    }

    reset() {
        this.resetBullets();
        this.resetPosition();
        this.resetHp();
        this.hpBar.node.active = false;
        this.resetAttack();

        this.shields = 0;
        this.invincible = false;
        this.updateWeapon(WEAPON.GUN);
    }

    resetAttack() {
        this.chargeBar.progress = 0;
        this.chargeBar.node.active = false;
        this.chargingAttack = false;
        this.chargeTimer = 0;
        SoundManager.stop('reload_not_cc');
    }

    chargeAttack() {
        SoundManager.play('reload_not_cc', false, 0.5, true);
        this.chargeBar.node.active = true;
        this.chargingAttack = true;
        this.chargeTimer = 0;
    }

    handleHit(collderNode: cc.Node) {
        if (this.isAlive) {
            if (this.invincible) {
                // TODO DESTORY OTHER NODE
                SoundManager.play('hit_player', false, 0.5);
                return;
            }
            if (this.armorEquipped) {
                this.armorEquipped = false;
                this.armorNode.active = false;
                SoundManager.play('armor', false, 0.5);
            } else {
                this.hp--;
                if (this.hp < 0) {
                    cc.systemEvent.emit(GameEvent.PLAYER_DEAD, collderNode);
                    return;
                }
                this.hpBar.progress = this.hp / DEFAULT_HP;
                SoundManager.play('hit_player', false, 0.5);
            }
        }
    }

    handleHealthPack() {
        this.resetHp();
    }

    handleRifle() {
        this.rifleUpgrade = true;
        this.updateWeapon(WEAPON.RIFLE);
    }

    handleArmor() {
        this.armorEquipped = true;
        this.armorNode.active = true;
    }

    handleShield() {
        if (!this.invincible) {
            this.shields++;
            if (this.shields >= SHIELD_THRESHOLD) {
                // TODO SEND MESSAGE
                this.invincible = true;
                this.shields = SHIELD_THRESHOLD;
                this.invincibleNode.active = true;
            }
        } else {
            // Extend the timer
            this.invicibleTimer = INVICIBLE_DEFAULT;
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'CarObstacle') {
            this.handleHit(otherCollider.node);
        } else if (otherCollider.node.name === 'Vehicle') {
            this.handleHit(otherCollider.node);
        } else if (otherCollider.node.name === 'CompactObstacle') {
            this.handleHit(otherCollider.node);
        } else if (otherCollider.node.name === 'Tank') {
            this.handleHit(otherCollider.node);
        }
    }

    private resetPosition() {
        // Crashes wihout this using 'static' collider
        this.scheduleOnce(() => {
            this.node.x = 0;
        }, 0);
    }

    private resetBullets() {
        this.bulletAmount = this.bulletCap;
    }

    private resetHp() {
        this.hp = DEFAULT_HP;
        this.hpBar.progress = 1;
    }

    private updateEffects() {
        this.characterEffect.y = this.currentWeapon === WEAPON.GUN
            ? ARMOR_EFFECT_GUN : ARMOR_EFFECT_RIFLE;
        this.weaponGlow.y = this.currentWeapon === WEAPON.RIFLE ? -50 : -67.5;
        this.weaponGlow.scaleY = this.currentWeapon === WEAPON.RIFLE ? 0.7 : 0.5;
        this.weaponGlow.scaleX = this.currentWeapon === WEAPON.RIFLE ? 0.7 : 0.34;
    }

    private updateWeapon(weapon: WEAPON) {
        this.currentWeapon = weapon;
        this.updateEffects();
        this.animations.play(`man_walk_${this.currentWeapon.toString()}`);
    }
}
