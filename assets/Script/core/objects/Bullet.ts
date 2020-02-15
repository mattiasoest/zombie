import StageController from "../StageController";
import { GameEvent } from "../Event";

const { ccclass, property } = cc._decorator;


@ccclass
export default class Bullet extends cc.Component {
    playerFireSound: cc.AudioSource = null;

    controller: StageController = null;

    body: cc.RigidBody;

    alive = false;

    onLoad() {
        // this.playerFireSound = this.getComponent(cc.AudioSource);
        this.body = this.node.getComponent(cc.RigidBody);
    }

    start() {
        this.body.linearVelocity = cc.v2(0, 700);
        this.alive = true;
    }

    init() {
        this.alive = true;  
    }

    update(dt) {
        if (cc.isValid(this.node) && this.alive) {
            if (this.node.y > this.controller.getMainCanvas().height * 0.6) {
                this.alive = false;
                cc.systemEvent.emit(GameEvent.BULLET_REMOVE, this);
            }
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'Enemy') {
            otherCollider.node.destroy();
        }
    }

    // playFireSound() {
    //     this.playerFireSound.play();
    // }
}
