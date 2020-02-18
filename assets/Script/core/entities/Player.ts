import { GameEvent } from "../Event";


const { ccclass, property } = cc._decorator;


const ATTACK_CD = 0.1;

@ccclass
export default class Player extends cc.Component {

    private attackCooldown: number = ATTACK_CD;
    private chargingAttack: boolean = false;

    private animations: cc.Animation = null;

    onLoad() {
        this.animations = this.getComponent(cc.Animation);
    }

    start() {
        const animState = this.animations.getAnimationState('man_fire_gun');
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
            this.animations.play("man_fire_gun");
            cc.systemEvent.emit(GameEvent.BULLET_SPAWN, this.node.position);
            this.resetAttack();
        } else {
            console.log('NOT READY, RESET');
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

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'CarObstacle') {
            console.log('Player dead');
        }
    }
}
