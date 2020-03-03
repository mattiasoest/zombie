import SoundManager from "../SoundManager";
import { GameEvent } from "../core/Event";


const { ccclass, property } = cc._decorator;

const CHARGE_TIMER = 0.25;
const DEFAULT_HP = 3;
const SHIELD_THRESHOLD = 3;
const INVICIBLE_DEFAULT = 4;

@ccclass
export default class Player extends cc.Component {

    @property(cc.Animation)
    animations: cc.Animation = null;

    @property(cc.ProgressBar)
    hpBar: cc.ProgressBar = null;

    @property(cc.ProgressBar)
    chargeBar: cc.ProgressBar = null;

    @property(cc.Node)
    armorNode: cc.Node = null;


    isAlive = false;

    // Different depending on upgrades
    bulletCap = 10;

    bulletAmount = 10;

    shields = 0;

    invincible = false;

    private hp = 3;
    private armorEquipped = false;
    private chargeTimer: number = 0;
    private chargingAttack: boolean = false;
    private invicibleTimer = INVICIBLE_DEFAULT;

    start() {
        this.hpBar.progress = 1;
        this.chargeBar.progress = 0;
        this.chargeBar.node.active = false;
        this.isAlive = true;
        this.animations.on('finished', (event) => {
            this.animations.play();
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
                this.animations.node.color = cc.color(255, 255, 255);
                this.shields = 0;
                cc.systemEvent.emit(GameEvent.RESET_SHIELD);
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
                if (this.bulletAmount > 0) {
                    this.bulletAmount--;
                    SoundManager.play('fire1', false);
                    this.animations.play("man_fire_gun");
                    cc.systemEvent.emit(GameEvent.BULLET_SPAWN, this.node.position);
                    this.resetAttack();
                } else {
                    SoundManager.play('empty', false, 0.3);
                }
            } else {
                this.resetAttack();
            }
        }
    }

    handleAmmoPickup() {
        this.bulletAmount += 5;
        if (this.bulletAmount > this.bulletCap) {
            this.bulletAmount = this.bulletCap;
        }
    }

    reset() {
        this.resetBullets();
        this.resetPosition();
        this.resetHp();
        this.resetAttack();

        this.shields = 0;
        this.invincible = false;
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
                this.animations.node.color = cc.color(170, 0, 0);
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
}
