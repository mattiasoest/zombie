import StageController from "../StageController";
import { GameEvent } from "../Event";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Obstacle extends cc.Component {

    @property(cc.Sprite)
    carSprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    carFrames: Array<cc.SpriteFrame> = new Array(4);

    controller: StageController = null;

    body: cc.RigidBody;

    alive = false;

    private lowerBound: number = 0;
    private upperBound: number = 0;
    private leftBound: number = 0;
    private rightBound: number = 0;

    private scrollSpeed: number = 180;

    private hitPoints = 4;



    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.body = this.node.getComponent(cc.RigidBody);
    }

    start() {

    }

    init() {
        this.lowerBound = -this.controller.getMainCanvas().height * 0.7;
        this.upperBound = this.controller.getMainCanvas().height * 0.7;
        this.leftBound = -this.controller.getMainCanvas().width * 0.7;
        this.rightBound = this.controller.getMainCanvas().width * 0.7;
        // Rotation, position
        this.node.angle = Math.random() * 360;
        this.generateRandomProps();
        this.alive = true;
    }


    update(dt) {
        this.node.setPosition(this.node.position.x, this.node.position.y - this.scrollSpeed * dt);
        if (this.node.position.y < this.lowerBound) {
            cc.systemEvent.emit(GameEvent.STATIC_CAR_REMOVE, this.node);
        }

    }

    public hit() {
        this.hitPoints--;
        if (this.hitPoints > 0) {
            this.carSprite.spriteFrame = this.carFrames[this.hitPoints - 1];
        } else {
            cc.systemEvent.emit(GameEvent.STATIC_CAR_REMOVE, this.node);
        }
    }

    private generateRandomProps() {
        const random = Math.floor(Math.random() * this.carFrames.length);
        this.carSprite.spriteFrame = this.carFrames[random];
        this.hitPoints = random + 1;
    }
}
