import { SCROLL_SPEED } from "../core/GroundScroll";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class StaticItem extends cc.Component {

    protected body: cc.RigidBody = null;

    init() {
        this.body = this.node.getComponent(cc.RigidBody);
    }

    start() {

    }

    update(dt) {
        this.node.y -= SCROLL_SPEED * dt;
    }
}
