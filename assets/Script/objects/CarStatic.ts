import Obstacle from "./Obstacle";
import { GameEvent } from "../core/Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CarStatic extends Obstacle {

    init() {
        super.init();
    }

    update(dt) {
        if (this.alive) {
            if (this.shouldRecycle()) {
                this.handleDeath();
            }
        }
    }

    protected handleDeath() {
        this.alive = false;
        cc.systemEvent.emit(GameEvent.STATIC_CAR_REMOVE, this.node);
    }
}