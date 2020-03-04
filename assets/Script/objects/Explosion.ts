import { GameEvent } from "../core/Event";
import { SCROLL_SPEED } from "../core/GroundScroll";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Explosion extends cc.Component {

    @property(cc.Animation)
    animations: cc.Animation = null;

    init() {
        this.animations.play();

        this.animations.on('finished', () => {
            cc.systemEvent.emit(GameEvent.EXPLOSION_REMOVE, this.node);
        });
    }

    update(dt) {
        this.node.y -= SCROLL_SPEED * dt;
    }
}
