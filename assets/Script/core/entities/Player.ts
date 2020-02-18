import { GameEvent } from "../Event";


const {ccclass, property} = cc._decorator;


const ATTACK_CD = 0.1;

@ccclass
export default class Player extends cc.Component {

    private attackCooldown: number = ATTACK_CD;
    private chargingAttack: boolean  = false;

    // onLoad () {}

    start () {

    }

    update (dt) {
        if (this.chargingAttack) {
            this.attackCooldown -= dt;
        }
    }

    public handleMovement(touchpos: cc.Vec2) {
        this.node.x = touchpos.x;
    }

    public handleAttack() {
        if (this.attackCooldown <= 0) {
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
