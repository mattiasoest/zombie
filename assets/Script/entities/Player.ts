import SoundManager from "../SoundManager";
import { GameEvent } from "../core/Event";


const { ccclass, property } = cc._decorator;

const ATTACK_CD = 0.1;
const DEFAULT_HP = 3;

@ccclass
export default class Player extends cc.Component {

    @property(cc.Animation)
    animations: cc.Animation = null;

    @property(cc.ProgressBar)
    hpBar: cc.ProgressBar = null;

    private hp = 3;


    isAlive = false;

    // Different depending on upgrades
    bulletCap = 10;

    bulletAmount = 5;

    private attackCooldown: number = ATTACK_CD;
    private chargingAttack: boolean = false;

    // onLoad() {
    // }

    start() {
        this.hpBar.progress = 1;
        this.isAlive = true;
        this.animations.on('finished', (event) => {
            this.animations.play();
        });
    }

    update(dt) {
        if (this.chargingAttack) {
            this.attackCooldown -= dt;
        }
    }

    public handleMovement(touchpos: cc.Vec2) {
        if (this.isAlive) {
            this.node.x = touchpos.x;
        }
    }

    public handleAttack() {
        if (this.isAlive) {
            if (this.attackCooldown <= 0) {
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

    public handleAmmoPickup() {
        this.bulletAmount += 5;
        if (this.bulletAmount > this.bulletCap) {
            this.bulletAmount = this.bulletCap;
        }
    }

    public reset() {
        this.resetBullets();
        this.resetPosition();
        this.resetHp();
    }

    public resetAttack() {
        this.chargingAttack = false;
        this.attackCooldown = ATTACK_CD;
    }

    public chargeAttack() {
        this.chargingAttack = true;
        this.attackCooldown = ATTACK_CD;
    }

    public handleHit(collderNode: cc.Node) {
        this.hp--;
        console.log(this.hp);
        if (this.hp < 0) {
            cc.systemEvent.emit(GameEvent.PLAYER_DEAD, collderNode);
            return;
        }
        this.hpBar.progress = this.hp / DEFAULT_HP;
        SoundManager.play('hit_player', false, 0.5);
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
        this.bulletAmount = 5;
    }

    private resetHp() {
        this.hp = DEFAULT_HP;
        this.hpBar.progress = 1;
    }
}
