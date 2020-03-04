import StageController from "../core/StageController";
import { GameEvent } from "../core/Event";

const { ccclass, property } = cc._decorator;

const enum FAST_TYPE {
    PICKUP,
    RUSTY,
}

const PICKUP_VEL = -1000;
const RUSTY_VEL = -1250;

@ccclass
export default class Vehicle extends cc.Component {

    @property(cc.Sprite)
    mainSprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    frames: Array<cc.SpriteFrame> = new Array(4);

    @property(cc.SpriteFrame)
    rustyFrame: cc.SpriteFrame = null;

    controller: StageController = null;

    body: cc.RigidBody;

    alive = false;

    private lowerBound: number = 0;

    private hitPoints = 4;

    private type: FAST_TYPE = null;

    onLoad() {
        cc.systemEvent.on(GameEvent.END_GAME, this.handleEndGame, this);
    }

    start() {
        this.node.zIndex = 7;
    }

    init() {
        this.body = this.node.getComponent(cc.RigidBody);

        this.lowerBound = -this.controller.getMainCanvas().height * 0.7;
        this.body.enabledContactListener = true;
        this.generateRandomProps();
        const velocity = this.type === FAST_TYPE.PICKUP ? PICKUP_VEL : RUSTY_VEL;
        this.body.linearVelocity = cc.v2(0, velocity);
        this.mainSprite.node.scale = this.type === FAST_TYPE.PICKUP ? 1 : 1.3;
        this.alive = true;
    }


    update(dt) {
        if (this.alive) {
            if (this.node.y < this.lowerBound) {
                cc.systemEvent.emit(GameEvent.VEHICLE_REMOVE, this.node);
            }
        }

    }

    hit() {
        if (this.alive) {

            this.hitPoints--;
            if (this.hitPoints > 0) {
                this.mainSprite.spriteFrame = this.frames[this.hitPoints - 1];
            } else {
                Math.random() < 0.1
                    ? cc.systemEvent.emit(GameEvent.RIFLE_SPAWN, this.node.position)
                    : cc.systemEvent.emit(GameEvent.SHIELD_SPAWN, this.node.position);
                this.handleDeath();
            }
        }
    }

    handleDeath(explosion = true) {
        this.body.enabledContactListener = false;
        this.alive = false;
        this.body.linearVelocity = cc.v2(0, 0);
        this.body.angularVelocity = 0;
        cc.systemEvent.emit(GameEvent.VEHICLE_REMOVE, this.node);
        if (explosion) {
            cc.systemEvent.emit(GameEvent.PLAY_EXPLOSION, this.node);
        }
    }

    private handleEndGame() {
        this.handleDeath(false);
    }

    private generateRandomProps() {

        if (Math.random() < 0.6) {
            const random = Math.floor(Math.random() * this.frames.length);
            this.type = FAST_TYPE.PICKUP;
            this.mainSprite.spriteFrame = this.frames[random];
            this.hitPoints = random + 1;
        } else {
            this.type = FAST_TYPE.RUSTY;
            this.mainSprite.spriteFrame = this.rustyFrame;
            this.hitPoints = 1;
        }
    }
}
