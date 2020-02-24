import StageController from "../StageController";
import { GameEvent } from "../Event";
import SoundManager from "../../SoundManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class Obstacle extends cc.Component {

    @property(cc.Sprite)
    carSprite: cc.Sprite = null;

    @property(cc.Sprite)
    shadowSprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    carFrames: Array<cc.SpriteFrame> = new Array(4);

    controller: StageController = null;

    body: cc.RigidBody;

    alive = false;

    protected lowerBound: number = 0;
    protected upperBound: number = 0;
    protected leftBound: number = 0;
    protected rightBound: number = 0;

    private scrollSpeed: number = 180;

    private hitPoints = 4;

    protected abstract handleDeath();

    start() {
        this.node.zIndex = 7;
    }

    protected init() {
        this.body = this.node.getComponent(cc.RigidBody);
        this.body.linearVelocity = cc.v2(0, -180);
        this.lowerBound = -this.controller.getMainCanvas().height * 0.7;
        this.upperBound = this.controller.getMainCanvas().height * 0.7;
        this.leftBound = -this.controller.getMainCanvas().width * 0.7;
        this.rightBound = this.controller.getMainCanvas().width * 0.7;

        this.node.angle = Math.random() * 360;
        this.generateRandomProps();
        this.body.enabledContactListener = true;
        this.shadowSprite.enabled = true;
        this.alive = true;
    }

    public hit() {
        if (this.alive) {
            this.hitPoints--;
            if (this.hitPoints > 0) {
                this.carSprite.spriteFrame = this.carFrames[this.hitPoints - 1];
            } else {
                this.body.enabledContactListener = false;
                this.body.linearVelocity = cc.v2(0, 0);
                this.body.angularVelocity = 0;
                this.shadowSprite.enabled = false;
                this.alive = false;
                cc.systemEvent.emit(GameEvent.PLAY_EXPLOSION, this.node);
                this.handleDeath();
            }
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (this.alive) {
            if (otherCollider.node.name === 'Vehicle') {
                SoundManager.play('car_hit', false);
            } else if (otherCollider.node.name === 'Tank') {
                SoundManager.play('car_hit', false);
                cc.systemEvent.emit(GameEvent.PLAY_EXPLOSION, this.node);
                this.handleDeath();
            }
        }
    }

    protected shouldRecycle() {
        return this.node.position.y < this.lowerBound || this.node.x < this.leftBound || this.node.x > this.rightBound;
    }

    private generateRandomProps() {
        const random = Math.floor(Math.random() * this.carFrames.length);
        this.carSprite.spriteFrame = this.carFrames[random];
        this.hitPoints = random + 1;
    }
}
