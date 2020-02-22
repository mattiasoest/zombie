import StageController from "../StageController";
import { GameEvent } from "../Event";
import { SCROLL_SPEED } from "../GroundScroll";

const { ccclass, property } = cc._decorator;

export enum ZOMBIE_TYPE {
    FEMALE_1,
    FEMALE_2,
    MALE_3,
    MALE_4,
    ARMY,
    COP
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
    protected zombieType: ZOMBIE_TYPE = null;
    protected body: cc.RigidBody = null;

    protected isAlive = true;

    abstract handleNotHardImpact(colliderNode: cc.Node): void;

    protected init(leftBound?: number, rightBound?: number) {
        const randomZombieLook = Math.floor(Math.random() * this.controller.walk.length);
        switch (randomZombieLook) {
            case ZOMBIE_TYPE.FEMALE_1:
            case ZOMBIE_TYPE.FEMALE_2:
                this.animations.node.setScale(0.9);
                break;
            case ZOMBIE_TYPE.MALE_3:
            case ZOMBIE_TYPE.MALE_4:
                this.animations.node.setScale(0.85);
                break;
            case ZOMBIE_TYPE.ARMY:
            case ZOMBIE_TYPE.COP:
                this.animations.node.setScale(0.78);
                break;
            default:
                throw new Error("Not supported look");

        }
        this.animations.addClip(this.controller.walk[randomZombieLook], 'walk');
        this.animations.addClip(this.controller.death[randomZombieLook], 'death');
        this.animations.play('walk');
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
                this.killZombie(true);
            }
        }
    }

    // Handle colissions here so all subclasses can run the same logic
    onBeginContact(contact: cc.PhysicsContact, selfCollider: cc.PhysicsCollider, otherCollider: cc.PhysicsCollider) {
        if (otherCollider.node.name === "Bullet") {
            cc.systemEvent.emit(GameEvent.BULLET_REMOVE, otherCollider.node);
            if (this.hitPoints > 0) {
                this.hitPoints--;
            }
            else {
                this.killZombie();
            }
        }
        else if (otherCollider.node.name === "Player") {
            console.log('Player died - ENEMY');
        }
        else if (otherCollider.node.name === "Vehicle") {
            this.killZombie();
        }
        else if (this.isStaticObject(otherCollider.node)) {
            if (this.isHardObjectImpact(otherCollider.body)) {
                this.killZombie();
            } else {
                this.handleNotHardImpact(otherCollider.node);
            }
        }
    }

    protected setDefaultBounds() {
        this.leftBound = -this.controller.getMainCanvas().width * 0.5;
        this.rightBound = this.controller.getMainCanvas().width * 0.5;
    }

    protected killZombie(instant = true) {
        this.isAlive = false;
        this.body.enabledContactListener = false;
        this.body.linearVelocity = cc.v2(0, 0);
        this.animations.play('death')
        let timer = 1.6;
        this.scheduleOnce(() => {
            if (instant) {
                timer = 0;
            }
            cc.systemEvent.emit(GameEvent.ZOMBIE_REMOVE, this);
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
}
