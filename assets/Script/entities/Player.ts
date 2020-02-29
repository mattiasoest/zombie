import SoundManager from "../SoundManager";
import { GameEvent } from "../core/Event";


const { ccclass, property } = cc._decorator;

const ATTACK_CD = 0.1;

@ccclass
export default class Player extends cc.Component {

    @property(cc.Animation)
    animations: cc.Animation = null;

    isAlive = false;

    // Different depending on upgrades
    bulletCap = 10;

    bulletAmount = 5;

    private attackCooldown: number = ATTACK_CD;
    private chargingAttack: boolean = false;

    // onLoad() {
    // }

    start() {
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
        this.node.x = touchpos.x;
    }

    public handleAttack() {
        if (this.attackCooldown <= 0) {
            if (this.bulletAmount > 0) {

                this.bulletAmount--;
                SoundManager.play('fire1', false);
                this.animations.play("man_fire_gun");
                cc.systemEvent.emit(GameEvent.BULLET_SPAWN, this.node.position);
                this.resetAttack();
            } else {
                SoundManager.play('empty', false,  0.3);
            }
        } else {
            this.resetAttack();
        }
    }

    public resetAttack() {
        this.chargingAttack = false;
        this.attackCooldown = ATTACK_CD;
    }

    public chargeAttack() {
        this.chargingAttack = true;
        this.attackCooldown = ATTACK_CD;
    }

    public handleAmmoPickup() {
        this.bulletAmount += 5;
        if (this.bulletAmount > 10) {
            this.bulletAmount = 10;
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'CarObstacle') {
            console.log('Player dead static car');
        } else if (otherCollider.node.name === 'Vehicle') {
            console.log('Player dead vehicle');
        }
    }
}
