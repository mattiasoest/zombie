import StageController from "../StageController";
import { GameEvent } from "../Event";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Vehicle extends cc.Component {

    @property(cc.Animation)
    animations: cc.Animation = null;

    @property(cc.Sprite)
    mainSprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    frames: Array<cc.SpriteFrame> = new Array(4);

    controller: StageController = null;

    body: cc.RigidBody;

    alive = false;

    private lowerBound: number = 0;

    private hitPoints = 4;

    init() {
        this.animations.on('finished', (event) => {
            this.mainSprite.node.setScale(0.7);
            cc.systemEvent.emit(GameEvent.VEHICLE_REMOVE, this.node);
        });

        this.body = this.node.getComponent(cc.RigidBody);
        this.body.linearVelocity = cc.v2(0, -1000);
        this.lowerBound = -this.controller.getMainCanvas().height * 0.7;
        this.body.enabledContactListener = true;
        this.generateRandomProps();
        this.alive = true;
    }


    update(dt) {
        if (this.alive) {
            if (this.node.y < this.lowerBound) {
                cc.systemEvent.emit(GameEvent.VEHICLE_REMOVE, this.node);
            }
        }

    }

    public hit() {
        if (this.alive) {

            this.hitPoints--;
            if (this.hitPoints > 0) {
                this.mainSprite.spriteFrame = this.frames[this.hitPoints - 1];
            } else {
                this.body.enabledContactListener = false;
                this.alive = false;
                this.body.linearVelocity = cc.v2(0, 0);
                this.body.angularVelocity = 0;
                this.animations.play('car_explosion');
            }
        }
    }

    private generateRandomProps() {
        const random = Math.floor(Math.random() * this.frames.length);
        this.mainSprite.spriteFrame = this.frames[random];
        this.hitPoints = random + 1;
    }
}
