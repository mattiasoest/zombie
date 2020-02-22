import Obstacle from "./Obstacle";
import { GameEvent } from "../Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CarStatic extends Obstacle {

    init() {
        super.init();
    }

    update(dt) {
        if (this.alive) {
            // this.node.setPosition(this.node.position.x, this.node.position.y - this.scrollSpeed * dt);
            if (this.shouldRecycle()) {
                cc.systemEvent.emit(GameEvent.STATIC_CAR_REMOVE, this.node);
            }
        }
    }

    protected handleDeath() {
        cc.systemEvent.emit(GameEvent.STATIC_CAR_REMOVE, this.node);
    }
}