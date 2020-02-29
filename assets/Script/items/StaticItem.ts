import { SCROLL_SPEED } from "../core/GroundScroll";
import StageController from "../core/StageController";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class StaticItem extends cc.Component {

    @property(cc.Node)
    visualNode: cc.Node = null;

    protected body: cc.RigidBody = null;
    protected lowerBound: number = 0;


    controller: StageController = null;
    alive = true;

    abstract handleRemoval();

    private animationVec = new cc.Vec2(0, 10);

    init() {
        this.body = this.node.getComponent(cc.RigidBody);
        this.lowerBound = -this.controller.getMainCanvas().height * 0.7;
        this.alive = true;
        // this.visualNode.runAction(cc.sequence(cc.scaleTo(1, 1.3), cc.scaleTo(1, 1)).repeatForever());
        // this.visualNode.runAction(cc.sequence(cc.moveTo(0.7, this.animationVec).easing(cc.easeSineIn()), cc.moveTo(0.7, cc.Vec2.ZERO).easing(cc.easeSineOut())).repeatForever());
        this.visualNode.runAction(cc.sequence(
            cc.moveTo(0.7, this.animationVec).easing(cc.easeSineInOut()),
            cc.moveTo(0.7, cc.Vec2.ZERO).easing(cc.easeSineInOut()))
            .repeatForever());
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
