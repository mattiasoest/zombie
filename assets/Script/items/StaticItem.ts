import { SCROLL_SPEED } from "../core/GroundScroll";
import StageController from "../core/StageController";
import { GameEvent } from "../core/Event";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class StaticItem extends cc.Component {

    protected body: cc.RigidBody = null;
    protected lowerBound: number = 0;
    controller: StageController = null;
    alive = true;

    abstract handleRemoval();

    init() {
        this.body = this.node.getComponent(cc.RigidBody);
        this.lowerBound = -this.controller.getMainCanvas().height * 0.7;
        this.alive = true;
    }

    start() {
        this.node.zIndex = 1;
    }

    update(dt) {
        if (this.alive) {
            this.node.y -= SCROLL_SPEED * dt;
            if (this.node.position.y < this.lowerBound) {
                this.handleRemoval()
            }
        }
    }

}
