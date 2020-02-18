import StageController from "../StageController";
import { GameEvent } from "../Event";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Vehicle extends cc.Component {

    @property(cc.Sprite)
    mainSprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    frames: Array<cc.SpriteFrame> = new Array(4);

    controller: StageController = null;

    body: cc.RigidBody;

    alive = false;

    private lowerBound: number = 0;

    private hitPoints = 4;

    onLoad() {
        // this.playerFireSound = this.getComponent(cc.AudioSource);
        this.body = this.node.getComponent(cc.RigidBody);
    }

    start() {
        this.body.linearVelocity = cc.v2(0, -1000);
        this.alive = true;
    }

    init() {
        this.lowerBound = -this.controller.getMainCanvas().height * 0.7;
        this.generateRandomProps();
        this.alive = true;
    }


    update(dt) {
        if (this.node.y < this.lowerBound) {
            cc.systemEvent.emit(GameEvent.VEHICLE_REMOVE, this.node);
        }

    }

    public hit() {
        this.hitPoints--;
        if (this.hitPoints > 0) {
            this.mainSprite.spriteFrame = this.frames[this.hitPoints - 1];
        } else {
            cc.systemEvent.emit(GameEvent.VEHICLE_REMOVE, this.node);
        }
    }

    private generateRandomProps() {
        const random = Math.floor(Math.random() * this.frames.length);
        this.mainSprite.spriteFrame = this.frames[random];
        this.hitPoints = random + 1;
    }
}
