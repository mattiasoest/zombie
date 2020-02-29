import StageController from "../core/StageController";
import { GameEvent } from "../core/Event";


const { ccclass, property } = cc._decorator;

const ALIVE_TIME = 3;


@ccclass
export default class BigShot extends cc.Component {
    playerFireSound: cc.AudioSource = null;

    controller: StageController = null;

    body: cc.RigidBody;

    alive = false;

    private lowerBound = 0;
    private upperBound = 0;
    private leftBound = 0;
    private rightBound = 0;

    private aliveTimer = 3;
    
    init(velocityVector: cc.Vec2, cannonAngle: number) {
        this.lowerBound = -this.controller.getMainCanvas().height * 0.55;
        this.upperBound = this.controller.getMainCanvas().height * 0.55;
        this.leftBound = -this.controller.getMainCanvas().width * 0.5;
        this.rightBound = this.controller.getMainCanvas().width * 0.5;
        
        this.body = this.node.getComponent(cc.RigidBody);
        this.alive = true;
        this.body.linearVelocity = velocityVector;
        this.node.setPosition(0, 0);
        this.node.angle = 0;
        this.node.setScale(1.7);
        this.aliveTimer = ALIVE_TIME;

    }

    update(dt) {
        if (cc.isValid(this.node) && this.alive) {
            if (this.shouldRecycle(dt)) {
                this.alive = false;
                cc.systemEvent.emit(GameEvent.BIG_SHOT_REMOVE, this.node, false);
            }
        }
    }


    onBeginContact(contact, selfCollider, otherCollider) {
        if (this.alive) {
            if (otherCollider.node.name === 'Player') {
                cc.systemEvent.emit(GameEvent.PLAYER_DEAD, this.node);
                this.alive = false;
                cc.systemEvent.emit(GameEvent.BIG_SHOT_REMOVE, this.node, false);
            }
        }
    }

    private shouldRecycle(dt) {
        // return this.node.y < this.lowerBound || this.node.x < this.leftBound || this.node.x > this.rightBound || this.node.y > this.upperBound;
        this.aliveTimer -= dt;
        return this.aliveTimer < 0
    }
}