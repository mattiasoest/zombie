import { GameEvent } from "./Event";
import Bullet from "./objects/Bullet";
import Player from "./entities/Player";

const { ccclass, property } = cc._decorator;

const STATIC_SPAWN_RATE = 7;

@ccclass
export default class StageController extends cc.Component {

    @property(Player)
    player: Player = null;

    @property(cc.TiledLayer)
    topLayer: cc.TiledLayer = null;

    @property(cc.Node)
    zombie: cc.Node = null;

    @property(cc.Prefab)
    bullet: cc.Prefab = null;

    @property(cc.Prefab)
    carObstacle: cc.Prefab = null;

    public cvs: cc.Node = null;

    bulletPool: cc.NodePool = new cc.NodePool();
    staticCarPool: cc.NodePool = new cc.NodePool();

    private staticObjectSpawnTimer: number = 2;


    onLoad() {
        this.initPhysics();
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        cc.systemEvent.on(GameEvent.BULLET_SPAWN, this.onBulletSpawn, this);
        cc.systemEvent.on(GameEvent.BULLET_REMOVE, this.onBulletRemove, this);
        cc.systemEvent.on(GameEvent.STATIC_CAR_REMOVE, this.onStaticCarRemove, this);
    }

    start() {
        this.cvs = cc.find("Canvas");
        // TODO z indexes
        this.topLayer.node.zIndex = 5;
        this.player.node.zIndex = 1;
        this.zombie.zIndex = 0;
    }

    update(dt) {
        this.staticObjectSpawnTimer -= dt;
        if (this.staticObjectSpawnTimer <= 0) {
            // Random among other objects
            this.handleStaticCarSpawn();
        }
    }


    getMainCanvas() {
        return this.cvs;
    }

    private initPhysics() {
        const manager = cc.director.getPhysicsManager();
        manager.enabled = true;
        manager.enabledAccumulator = true;

        cc.PhysicsManager.FIXED_TIME_STEP = 1 / 60;
        // The number of iterations per update of the Physics System processing speed is 10 by default
        cc.PhysicsManager.VELOCITY_ITERATIONS = 8;

        // The number of iterations per update of the Physics processing location is 10 by default
        cc.PhysicsManager.POSITION_ITERATIONS = 8;

        // if (this.showPhysicsDebugInfo) {
        //   cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        //     cc.PhysicsManager.DrawBits.e_pairBit |
        //     cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        //     cc.PhysicsManager.DrawBits.e_jointBit |
        //     cc.PhysicsManager.DrawBits.e_shapeBit;
        // }
    }

    private onBulletSpawn() {
        let bulletNode;

        if (this.bulletPool.size() > 0) {
            bulletNode = this.bulletPool.get();
        } else {
            bulletNode = cc.instantiate(this.bullet);
        }
        const bullet = bulletNode.getComponent('Bullet');
        bullet.controller = this;
        bullet.init();
        const pos = this.node.convertToNodeSpaceAR(this.player.node.position);
        pos.x = pos.x + 25;
        pos.y = pos.y + 50;
        bulletNode.setPosition(pos);
        this.node.addChild(bulletNode);
    }

    private onBulletRemove(bulletNode: cc.Node) {
        bulletNode.removeFromParent();
        this.bulletPool.put(bulletNode);
    }

    private onTouchStart(event: any) {
        this.player.chargeAttack();
        const touch: cc.Touch = event.touch;
        this.handleTouch(touch);
    }

    private onTouchMove(event: any) {
        const touch: cc.Touch = event.touch;
        this.handleTouch(touch);
    }

    private handleTouch(touch: cc.Touch) {
        this.player.handleMovement(touch.getLocation());
    }

    private onTouchEnd(event: any) {
        this.player.handleAttack();
    }

    private generateRandomPos() {
        let randomX = Math.random() * this.cvs.width / 2;
        // set sign value
        randomX *= this.generateRandomSign();
        return cc.v2(randomX, this.cvs.height * 0.6);
    }

    private generateRandomSign() {
        return Math.random() <= 0.5 ? -1 : 1;
    }

    private handleStaticCarSpawn() {
        let carNode;
        if (this.staticCarPool.size() > 0) {
            carNode = this.staticCarPool.get();
        } else {
            carNode = cc.instantiate(this.carObstacle);
        }
        const carObj = carNode.getComponent('Obstacle');
        carObj.controller = this;
        carNode.setPosition(this.generateRandomPos());
        carObj.init();
        this.node.addChild(carNode);
        this.staticObjectSpawnTimer = STATIC_SPAWN_RATE;
    }

    private onStaticCarRemove(staticCarNode: cc.Node) {
        staticCarNode.removeFromParent();
        this.staticCarPool.put(staticCarNode);
    }
}
