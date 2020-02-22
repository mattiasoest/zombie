import { GameEvent } from "../Event";

const {ccclass, property} = cc._decorator;

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
}
