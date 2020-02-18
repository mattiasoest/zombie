import StageController from "../StageController";
import { GameEvent } from "../Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Obstacle extends cc.Component {

    controller: StageController = null;

    body: cc.RigidBody;

    alive = false;

    lowerBound: number = 0;
    upperBound: number = 0;
    leftBound: number = 0;
    rightBound: number = 0;

    private scrollSpeed: number = 180;



    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.body = this.node.getComponent(cc.RigidBody);
    }

    start () {

    }

    init() {

        this.lowerBound = -this.controller.getMainCanvas().height * 0.7;
        this.upperBound = this.controller.getMainCanvas().height * 0.7;
        this.leftBound = -this.controller.getMainCanvas().width * 0.7;
        this.rightBound = this.controller.getMainCanvas().width * 0.7;
        // Rotation, position
        this.node.angle = Math.random() * 360;
    }


    update(dt) {
        this.node.setPosition(this.node.position.x, this.node.position.y - this.scrollSpeed * dt);
        if (this.node.position.y < this.lowerBound) {
            cc.systemEvent.emit(GameEvent.STATIC_CAR_REMOVE, this.node);
        }
        
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'Player') {
            console.log('Player dead');
        }
    }
}
