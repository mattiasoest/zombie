import StageController from "../core/StageController";
import { GameEvent } from "../core/Event";
import SoundManager from "../SoundManager";
import { SCROLL_SPEED } from "../core/GroundScroll";


const { ccclass, property } = cc._decorator;

export enum ZOMBIE_VISUAL {
    FEMALE_1,
    FEMALE_2,
    MALE_3,
    MALE_4,
    ARMY,
    COP
}

export enum ZOMBIE_TYPE {
    CHARGER,
    PATROLLER,
    PATROLLER_DYN_HALF,
    PATROLLER_DYN_FULL,
}

@ccclass
export default abstract class Enemy extends cc.Component {

    @property(cc.Animation)
    animations: cc.Animation = null;

    protected ySpeed: number = 0;
    protected lowerBound: number = 0;
    protected leftBound: number = 0;
    protected rightBound: number = 0;
    protected controller: StageController = null;

    protected hitPoints: number = 0;
    protected xSpeed = 0;
    protected body: cc.RigidBody = null;
    protected zombieType: ZOMBIE_TYPE = null;

    protected isAlive = true;

    abstract handleNotHardImpact(colliderNode: cc.Node): void;

    onLoad() {
        cc.systemEvent.on(GameEvent.END_GAME, this.handleEndGame, this);
    }

    protected init(leftBound?: number, rightBound?: number) {
        this.node.zIndex = 3;
        const randomZombieLook = Math.floor(Math.random() * this.controller.walk.length);
        switch (randomZombieLook) {
            case ZOMBIE_VISUAL.FEMALE_1:
            case ZOMBIE_VISUAL.FEMALE_2:
                this.animations.node.setScale(0.9);
                break;
            case ZOMBIE_VISUAL.MALE_3:
            case ZOMBIE_VISUAL.MALE_4:
                this.animations.node.setScale(0.85);
                break;
            case ZOMBIE_VISUAL.ARMY:
            case ZOMBIE_VISUAL.COP:
                this.animations.node.setScale(0.78);
                break;
            default:
                throw new Error("Not supported look");

        }
        this.animations.addClip(this.controller.walk[randomZombieLook], 'walk');
        this.animations.addClip(this.controller.death[randomZombieLook], 'death');

        let animationSpeed = 0.3;
        switch (this.zombieType) {
            case ZOMBIE_TYPE.CHARGER:
                animationSpeed = 0.8;
                break;
            case ZOMBIE_TYPE.PATROLLER:
                animationSpeed = 0.2;
                break;
            case ZOMBIE_TYPE.PATROLLER_DYN_HALF:
                animationSpeed = 0.5;
                break;
            case ZOMBIE_TYPE.PATROLLER_DYN_FULL:
                animationSpeed = 0.5;
                break;
            default:
                throw new Error(`Unknown zombie type ${this.zombieType}`);
        }
        this.animations.play('walk').speed = animationSpeed;
        this.isAlive = true;
        this.body = this.node.getComponent(cc.RigidBody);
        this.body.enabledContactListener = true;
        this.lowerBound = -this.controller.getMainCanvas().height * 0.6;
        if (leftBound !== undefined && rightBound !== undefined) {
            this.leftBound = leftBound;
            this.rightBound = rightBound;
        } else {
            this.setDefaultBounds();
        }
    }

    update(dt) {
        if (this.isAlive) {
            if (this.node.y < this.lowerBound) {
                this.killZombie(false, true, false);
            }
        }
    }

    // Handle colissions here so all subclasses can run the same logic
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (otherCollider.node.name === "Bullet") {
            cc.systemEvent.emit(GameEvent.BULLET_REMOVE, otherCollider.node, false);
            if (this.hitPoints > 0) {
                this.hitPoints--;
            }
            else {
                this.killZombie(true, false, true);
            }
        }
        else if (otherCollider.node.name === "Player") {
            cc.systemEvent.emit(GameEvent.PLAYER_DEAD, this.node);
        }
        else if (otherCollider.node.name === "Vehicle") {
            this.killZombie(false);
        }
        else if (otherCollider.node.name === "Tank") {
            this.killZombie(false);
        }
        else if (this.isStaticObject(otherCollider.node)) {
            if (this.isHardObjectImpact(otherCollider.body)) {
                this.killZombie(false);
            } else {
                this.handleNotHardImpact(otherCollider.node);
            }
        }
    }

    protected setDefaultBounds() {
        this.leftBound = -this.controller.getMainCanvas().width * 0.5;
        this.rightBound = this.controller.getMainCanvas().width * 0.5;
    }

    protected killZombie(isPlayerKill: boolean, instant = false, playFallsound = true) {
        this.node.zIndex = 0;
        this.isAlive = false;
        this.body.enabledContactListener = false;
        this.body.linearVelocity = cc.v2(0, 0);
        if (!instant) {
            cc.systemEvent.emit(GameEvent.CASH_SPAWN, this.node.position);
        }

        this.animations.play('death')
        if (playFallsound) {
            SoundManager.play('fall', false);
        }
        let timer = 1.6;
        this.scheduleOnce(() => {
            if (instant) {
                timer = 0;
            }
            cc.systemEvent.emit(GameEvent.ZOMBIE_REMOVE, this, isPlayerKill);
        }, timer);
    }

    getAngle() {
        if (this.controller.isPlayerAlive() && this.node.position.y > this.controller.player.node.y) {
            let angle = Math.atan2(this.controller.player.node.y - this.node.y, this.controller.player.node.x - this.node.x) * 180 / Math.PI;
            return angle + 90;
        }
        else {
            return 0;
        }
    }

    private isStaticObject(colliderNode: cc.Node) {
        const type = colliderNode.name;
        return type === 'CarObstacle' || type === 'CompactObstacle';
    }

    private isHardObjectImpact(colliderBody: cc.RigidBody) {
        const isObjectMoving = colliderBody.linearVelocity.y < -SCROLL_SPEED - 5 || colliderBody.linearVelocity.y > -SCROLL_SPEED + 5;
        return Math.abs(colliderBody.angularVelocity) > 5 || isObjectMoving;
    }

    private handleEndGame() {
        if (this.isAlive) {
            this.killZombie(false, true, false);
        }
    }
}
