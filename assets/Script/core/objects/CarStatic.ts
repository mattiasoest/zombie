import Obstacle from "./Obstacle";
import { GameEvent } from "../Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CarStatic extends Obstacle {

    init() {
        super.init();
        this.animations.on('finished', (event) => {
            this.carSprite.node.setScale(1);
            cc.systemEvent.emit(GameEvent.STATIC_CAR_REMOVE, this.node);
        });
    }

    update(dt) {
        if (this.alive) {
            // this.node.setPosition(this.node.position.x, this.node.position.y - this.scrollSpeed * dt);
            if (this.shouldRecycle()) {
                cc.systemEvent.emit(GameEvent.STATIC_CAR_REMOVE, this.node);
            }
        }
    }
}